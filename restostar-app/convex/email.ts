"use node";

import nodemailer from "nodemailer";
import { v } from "convex/values";

import { internalAction } from "./_generated/server";

async function generateSympatheticMessage(
  restaurantName: string,
  customerFeedback: string,
  couponDiscount: string | undefined
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  if (!openaiKey) {
    // Fallback if no API key
    return `We're truly sorry to hear about your experience at ${restaurantName}. Your feedback means a lot to us, and we're committed to making things right.`;
  }

  const prompt = [
    "You write short, warm, human-sounding email messages for restaurants.",
    "Write a sympathetic response to a customer who had a negative experience.",
    "Keep it brief (2-3 sentences), genuine, and avoid corporate-speak.",
    "Do NOT include subject line, greeting, or signature - just the body message.",
    "",
    `Restaurant: ${restaurantName}`,
    `Customer's feedback: ${customerFeedback || "(No specific feedback provided)"}`,
    couponDiscount ? `Coupon being offered: ${couponDiscount}` : "",
  ].filter(Boolean).join("\n");

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 150,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI error: ${res.status}`);
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;

    if (content && typeof content === "string") {
      return content.trim();
    }
  } catch (e) {
    console.error("Failed to generate AI message:", e);
  }

  // Fallback
  return `We're truly sorry to hear about your experience at ${restaurantName}. Your feedback means a lot to us, and we're committed to making things right.`;
}

export const sendCouponEmail = internalAction({
  args: {
    to: v.string(),
    restaurantName: v.string(),
    couponCode: v.string(),
    sentimentType: v.union(v.literal("positive"), v.literal("negative")),
    googleMapsUrl: v.optional(v.string()),
    offerTitle: v.optional(v.string()),
    offerDiscountValue: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
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

    const offerLine =
      args.offerTitle || args.offerDiscountValue
        ? `${args.offerTitle ?? ""}${
            args.offerTitle && args.offerDiscountValue ? " — " : ""
          }${args.offerDiscountValue ?? ""}`.trim()
        : null;

    const subject =
      args.sentimentType === "positive"
        ? `${args.restaurantName} — thanks for your review!`
        : `${args.restaurantName} — thanks for your feedback`;

    const lines: string[] = [
      `Thanks for visiting ${args.restaurantName}!`,
      "",
      offerLine ? `Offer: ${offerLine}` : "",
      `Coupon code: ${args.couponCode}`,
      "",
      args.sentimentType === "positive" && args.googleMapsUrl
        ? `Leave a Google review: ${args.googleMapsUrl}`
        : "",
      "",
      "(Please show this email in-store to redeem.)",
    ].filter(Boolean);

    await transporter.sendMail({
      from: user,
      to: args.to,
      subject,
      text: lines.join("\n"),
    });

    return { ok: true };
  },
});

export const sendNegativeCouponEmail = internalAction({
  args: {
    to: v.string(),
    restaurantName: v.string(),
    couponCode: v.string(),
    customerFeedback: v.optional(v.string()),
    offerTitle: v.optional(v.string()),
    offerDiscountValue: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
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

    // Generate AI sympathetic message
    const aiMessage = await generateSympatheticMessage(
      args.restaurantName,
      args.customerFeedback ?? "",
      args.offerDiscountValue
    );

    const offerLine =
      args.offerTitle || args.offerDiscountValue
        ? `${args.offerTitle ?? ""}${
            args.offerTitle && args.offerDiscountValue ? " — " : ""
          }${args.offerDiscountValue ?? ""}`.trim()
        : null;

    const subject = `${args.restaurantName} — we'd love to make it up to you`;

    const lines: string[] = [
      aiMessage,
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

    return { ok: true };
  },
});
