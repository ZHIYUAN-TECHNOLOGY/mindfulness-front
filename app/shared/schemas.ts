import { z } from "zod";

export const EventVideoProviderSchema = z.enum(["youtube", "r2"]);
export const MembershipPurchaseStatusSchema = z.enum([
  "pending",
  "active",
  "failed",
  "refunded",
]);

export const RequestMagicLinkSchema = z.object({
  email: z.string().email(),
});

export const VerifyMagicLinkSchema = z.object({
  token: z.string().min(10),
});

export const UpsertSettingSchema = z.object({
  value: z.any(),
});

export const SettingKeySchema = z.string().regex(/^[a-z0-9._-]+$/);

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(["admin", "editor", "user", "member"]),
  createdAt: z.string().datetime(),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export const RequestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8),
});

export type User = z.infer<typeof UserSchema>;

export const SubscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().max(100).optional(),
});

export const UnsubscribeSchema = z.object({
  token: z.string().min(1),
});

const EmailBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), content: z.string().min(1) }),
  z.object({ type: z.literal("image"), mediaId: z.string().uuid(), alt: z.string().optional() }),
  z.object({ type: z.literal("button"), text: z.string().min(1), url: z.string().url(), align: z.enum(["left", "center", "right"]).default("center") }),
]);

export const TemplateKeySchema = z.enum([
  "editorial",
  "mindful-note",
  "weekly-digest",
  "announcement",
  "custom",
]);

export const TemplateOptionsSchema = z
  .object({
    brandName: z.string().max(120).optional(),
    authorName: z.string().max(120).optional(),
    issueNumber: z.string().max(40).optional(),
    eyebrow: z.string().max(120).optional(),
    greeting: z.string().max(120).optional(),
    signature: z.string().max(120).optional(),
    signoff: z.string().max(240).optional(),
    footerAddress: z.string().max(240).optional(),
    siteUrl: z.string().url().max(240).optional(),
    portraitUrl: z.string().url().max(500).optional(),
    heroImageUrl: z.string().url().max(500).optional(),
  })
  .passthrough();

export const CreateNewsletterSchema = z.object({
  subject: z.string().min(1).max(200),
  preheader: z.string().max(300).optional(),
  blocks: z.array(EmailBlockSchema).min(1),
  templateKey: TemplateKeySchema.optional(),
  templateOptions: TemplateOptionsSchema.optional(),
  customHtml: z.string().max(200000).optional(),
});

export const UpdateNewsletterSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  preheader: z.string().max(300).optional(),
  blocks: z.array(EmailBlockSchema).optional(),
  templateKey: TemplateKeySchema.optional(),
  templateOptions: TemplateOptionsSchema.optional(),
  customHtml: z.string().max(200000).optional(),
});

export const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

export const CreateEventVideoSchema = z.object({
  eventId: z.string().uuid(),
  title: z.string().min(1).max(200),
  provider: EventVideoProviderSchema,
  videoUrl: z.string().url().max(1000),
  thumbnailUrl: z.string().url().max(1000).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const UpdateEventVideoSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  provider: EventVideoProviderSchema.optional(),
  videoUrl: z.string().url().max(1000).optional(),
  thumbnailUrl: z.string().url().max(1000).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
});
