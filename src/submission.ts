import { z } from "zod";
import type { Submission } from "./domain";
export const submissionSchema = z.object({
  type: z.enum(["dialect", "conversation"]),
  prefectureId: z.string().min(1, "都道府県を選んでください"),
  regionId: z.string().optional(),
  municipality: z.string().max(80).optional(),
  phrase: z
    .string()
    .trim()
    .min(1, "ことばを入力してください")
    .max(80, "ことばは80文字以内で入力してください"),
  standardJapanese: z
    .string()
    .trim()
    .min(1, "標準語での意味を入力してください")
    .max(160),
  example: z.string().max(300).optional(),
  nuance: z.string().max(300).optional(),
  usageContext: z.string().min(1),
  ageGroup: z.string().optional(),
  learnedFrom: z.string().max(80).optional(),
  stillUsed: z.boolean(),
  recordingConsent: z.boolean().default(false),
  rightsOwnershipConfirmed: z.literal(true, {
    error: "自分が提供できる内容であることの確認が必要です",
  }),
  thirdPartyPrivacyConfirmed: z.literal(true, {
    error: "第三者の個人情報を含まないことの確認が必要です",
  }),
  publicationConsent: z.literal(true, {
    error: "審査と公開についての同意が必要です",
  }),
  consentVersion: z.literal("submission-consent-v1"),
});
export type SubmissionInput = z.infer<typeof submissionSchema>;
export const createSubmission = (
  input: SubmissionInput,
  now = new Date(),
): Submission => ({
  ...input,
  id: `local-${now.getTime()}`,
  status: "submitted",
  submittedAt: now.toISOString(),
  updatedAt: now.toISOString(),
});
