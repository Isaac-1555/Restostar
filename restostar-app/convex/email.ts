"use node";

import nodemailer from "nodemailer";
import { v } from "convex/values";

import { internalAction } from "./_generated/server";

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
