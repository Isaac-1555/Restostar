"use node";

import nodemailer from "nodemailer";
import { v } from "convex/values";

import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

// ── Shared AI helper ──────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

  if (!geminiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            // Disable thinking — simple email generation doesn't need it,
            // and the thinking budget eats into maxOutputTokens.
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

    const data = await res.json();
    const candidate = data?.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text;

    // Reject truncated responses (thinking models can exhaust the token budget)
    if (
      candidate?.finishReason === "MAX_TOKENS" ||
      !content ||
      typeof content !== "string" ||
      content.trim().length < 20
    ) {
      return null;
    }

    return content.trim();
  } catch (e) {
    console.error("Failed to generate AI message:", e);
  }
  return null;
}

// ── Generic (manual) templates ────────────────────────────────────────

const ALL_CATEGORIES = ["Food", "Ambience", "Service", "Value"];

function buildGenericPositiveMessage(
  restaurantName: string,
  positiveCategories: string[] | undefined
): string {
  const liked = (positiveCategories ?? []).filter((c) => ALL_CATEGORIES.includes(c));
  const notLiked = ALL_CATEGORIES.filter((c) => !liked.includes(c));

  if (liked.length === 0) {
    return `Thanks for visiting ${restaurantName} and for your wonderful review! We're glad you enjoyed your experience.`;
  }

  const likedStr = liked.join(", ").replace(/, ([^,]+)$/, " and $1").toLowerCase();
  let msg = `We're thrilled that you enjoyed our ${likedStr}!`;

  if (notLiked.length > 0 && notLiked.length <= 2) {
    const notStr = notLiked.join(" and ").toLowerCase();
    msg += ` We'll keep working to make the ${notStr} even better for your next visit.`;
  }

  return msg;
}

function buildGenericNegativeMessage(
  restaurantName: string,
  customerFeedback: string | undefined
): string {
  const fb = (customerFeedback ?? "").toLowerCase();

  if (fb.includes("cold")) {
    return `We're sorry that your food was cold when you received it at ${restaurantName}. That's not the experience we want for you, and we're taking steps to fix it.`;
  }
  if (fb.includes("wait") || fb.includes("slow")) {
    return `We apologize for the long wait at ${restaurantName}. We understand how frustrating that can be and are working to improve our service speed.`;
  }
  if (fb.includes("rude") || fb.includes("unfriendly") || fb.includes("staff")) {
    return `We're sorry about the service experience at ${restaurantName}. Your feedback has been shared with our team and we're committed to doing better.`;
  }

  return `We're truly sorry to hear about your experience at ${restaurantName}. Your feedback means a lot to us, and we're committed to making things right.`;
}

// ── AI intro generators ───────────────────────────────────────────────

async function generatePositiveAIMessage(
  restaurantName: string,
  positiveCategories: string[] | undefined,
  couponDiscount: string | undefined
): Promise<string> {
  const liked = (positiveCategories ?? []).join(", ") || "(none selected)";
  const prompt = [
    "You write short, warm, human-sounding email messages for restaurants.",
    "Write a grateful response to a customer who left a positive review.",
    "Reference the specific things they liked. If they didn't select everything, briefly mention the restaurant's commitment to improving the rest.",
    "Keep it brief (2-3 sentences), genuine, and avoid corporate-speak.",
    "Do NOT include subject line, greeting, or signature - just the body message.",
    "",
    `Restaurant: ${restaurantName}`,
    `Categories the customer liked: ${liked}`,
    couponDiscount ? `Thank-you coupon being offered: ${couponDiscount}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const ai = await callGemini(prompt);
  return ai ?? buildGenericPositiveMessage(restaurantName, positiveCategories);
}

async function generateNegativeAIMessage(
  restaurantName: string,
  customerFeedback: string,
  couponDiscount: string | undefined
): Promise<string> {
  const prompt = [
    "You write short, warm, human-sounding email messages for restaurants.",
    "Write a sympathetic response to a customer who had a negative experience.",
    "Keep it brief (2-3 sentences), genuine, and avoid corporate-speak.",
    "Do NOT include subject line, greeting, or signature - just the body message.",
    "",
    `Restaurant: ${restaurantName}`,
    `Customer's feedback: ${customerFeedback || "(No specific feedback provided)"}`,
    couponDiscount ? `Coupon being offered: ${couponDiscount}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const ai = await callGemini(prompt);
  return ai ?? buildGenericNegativeMessage(restaurantName, customerFeedback);
}

export const sendCouponEmail = internalAction({
  args: {
    customerCouponId: v.id("customerCoupons"),
    to: v.string(),
    restaurantName: v.string(),
    couponCode: v.string(),
    sentimentType: v.union(v.literal("positive"), v.literal("negative")),
    googleMapsUrl: v.optional(v.string()),
    offerTitle: v.optional(v.string()),
    offerDiscountValue: v.optional(v.string()),
    emailTone: v.union(v.literal("assist"), v.literal("manual")),
    positiveCategories: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = process.env.GMAIL_SMTP_USER;
    const pass = process.env.GMAIL_SMTP_APP_PASSWORD;

    if (!user || !pass) {
      throw new Error(
        "Missing Convex env vars: GMAIL_SMTP_USER and/or GMAIL_SMTP_APP_PASSWORD"
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    // Build personalized intro based on emailTone
    const introMessage =
      args.emailTone === "assist"
        ? await generatePositiveAIMessage(
            args.restaurantName,
            args.positiveCategories,
            args.offerDiscountValue
          )
        : buildGenericPositiveMessage(
            args.restaurantName,
            args.positiveCategories
          );

    const offerLine =
      args.offerTitle || args.offerDiscountValue
        ? `${args.offerTitle ?? ""}${
            args.offerTitle && args.offerDiscountValue ? " — " : ""
          }${args.offerDiscountValue ?? ""}`.trim()
        : null;

    const subject = `${args.restaurantName} — thanks for your review!`;

    const lines: string[] = [
      introMessage,
      "",
      offerLine ? `Offer: ${offerLine}` : "",
      `Coupon code: ${args.couponCode}`,
      "",
      args.googleMapsUrl
        ? `Leave a Google review: ${args.googleMapsUrl}`
        : "",
      "",
      "(Please show this email in-store to redeem.)",
      "",
      `— The ${args.restaurantName} team`,
    ].filter(Boolean);

    await transporter.sendMail({
      from: user,
      to: args.to,
      subject,
      text: lines.join("\n"),
    });

    await ctx.runMutation(internal.customerCoupons.markCouponEmailSent, {
      customerCouponId: args.customerCouponId,
      sentAt: Date.now(),
    });

    return { ok: true };
  },
});

export const sendNegativeCouponEmail = internalAction({
  args: {
    customerCouponId: v.id("customerCoupons"),
    to: v.string(),
    restaurantName: v.string(),
    couponCode: v.string(),
    customerFeedback: v.optional(v.string()),
    offerTitle: v.optional(v.string()),
    offerDiscountValue: v.optional(v.string()),
    emailTone: v.union(v.literal("assist"), v.literal("manual")),
  },
  handler: async (ctx, args) => {
    const user = process.env.GMAIL_SMTP_USER;
    const pass = process.env.GMAIL_SMTP_APP_PASSWORD;

    if (!user || !pass) {
      throw new Error(
        "Missing Convex env vars: GMAIL_SMTP_USER and/or GMAIL_SMTP_APP_PASSWORD"
      );
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user, pass },
    });

    // Build personalized intro based on emailTone
    const introMessage =
      args.emailTone === "assist"
        ? await generateNegativeAIMessage(
            args.restaurantName,
            args.customerFeedback ?? "",
            args.offerDiscountValue
          )
        : buildGenericNegativeMessage(
            args.restaurantName,
            args.customerFeedback
          );

    const offerLine =
      args.offerTitle || args.offerDiscountValue
        ? `${args.offerTitle ?? ""}${
            args.offerTitle && args.offerDiscountValue ? " — " : ""
          }${args.offerDiscountValue ?? ""}`.trim()
        : null;

    const subject = `${args.restaurantName} — we'd love to make it up to you`;

    const lines: string[] = [
      introMessage,
      "",
      offerLine ? `Here's a little something: ${offerLine}` : "",
      `Your coupon code: ${args.couponCode}`,
      "",
      "(Please show this email in-store to redeem.)",
      "",
      `— The ${args.restaurantName} team`,
    ].filter(Boolean);

    await transporter.sendMail({
      from: user,
      to: args.to,
      subject,
      text: lines.join("\n"),
    });

    await ctx.runMutation(internal.customerCoupons.markCouponEmailSent, {
      customerCouponId: args.customerCouponId,
      sentAt: Date.now(),
    });

    return { ok: true };
  },
});
