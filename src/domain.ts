export type Verification =
  | "verified"
  | "reference_confirmed"
  | "community_confirmed"
  | "needs_review"
  | "demo_candidate"
  | "demo"
  | "community"
  | "reviewed";
export type SourceMetadata = {
  type:
    | "official_reference"
    | "academic_reference"
    | "community_or_demo"
    | "source_pending";
  title?: string;
  organization?: string;
  url?: string;
  note?: string;
  checkedAt?: string;
  publicationYear?: string;
  sourceTier?: 1 | 2 | 3 | 4;
  exactFormMatch?: "exact" | "variant" | "uncertain";
  evidenceScopes?: Array<
    "phrase" | "reading" | "meaning" | "region" | "example" | "usage" | "history"
  >;
};
export type MediaRights = {
  consentRecordedAt: string;
  consentVersion: string;
  scope: "site_only" | "education" | "commercial_license";
  speakerDisplay: "anonymous" | "age_and_region" | "credited";
  withdrawalContactConfigured: boolean;
};
export type Prefecture = {
  id: string;
  code: number;
  name: string;
  area: string;
  summary: string;
  active: boolean;
};
export type Region = {
  id: string;
  prefectureId: string;
  name: string;
  description: string;
};
export type RegionalCultureItem = {
  id: string;
  type: "audio" | "conversation" | "song" | "commercial" | "archive" | "book" | "video" | "other";
  title: string;
  prefectureId: string;
  regionId?: string;
  municipality?: string;
  languageVariety?: Dialect["languageVariety"];
  sourceTitle: string;
  sourceOrganization: string;
  sourceUrl: string;
  rightsStatus: "official_link" | "permission_confirmed" | "public_domain" | "rights_review_required";
  accessType: "external_link" | "embed" | "onsite_only";
  rightsNote: string;
  description: string;
  verifiedAt: string;
};
export type Dialect = {
  id: string;
  phrase: string;
  reading: string;
  standardJapanese: string;
  description: string;
  exampleDialect: string;
  exampleStandard: string;
  prefectureId: string;
  regionId: string;
  municipality?: string;
  ageGroups: string[];
  usageContexts: string[];
  emotionTags: string[];
  usageFrequency:
    | "common"
    | "occasional"
    | "rare"
    | "historical"
    | "unknown"
    | "よく使う"
    | "ときどき"
    | "懐かしい";
  recordingYear?: number;
  verificationStatus: Verification;
  sourceType: "demo" | "submission";
  audioUrl?: string;
  videoUrl?: string;
  mediaRights?: MediaRights;
  slug?: string;
  source?: SourceMetadata;
  additionalSources?: SourceMetadata[];
  confidence?: "high" | "medium" | "low" | "unknown";
  pronunciationNote?: string;
  languageVariety?:
    "japanese_dialect" | "ryukyuan_language" | "ainu_loanword" | "unknown";
  needsAudio?: boolean;
  audioPriority?: 1 | 2 | 3;
  createdAt: string;
  updatedAt: string;
  reactions: { use: number; heard: number; new: number };
};

export const hasPublishableAudio = (dialect: Dialect) =>
  Boolean(
    dialect.audioUrl &&
    dialect.mediaRights?.consentRecordedAt &&
    dialect.mediaRights.consentVersion &&
    dialect.mediaRights.withdrawalContactConfigured,
  );
export type ConversationLine = {
  speaker: string;
  dialectText: string;
  standardText: string;
  dialectId?: string;
};
export type Conversation = {
  id: string;
  title: string;
  description: string;
  prefectureId: string;
  regionId: string;
  usageContext: string;
  speakers: { name: string; ageGroup: string; origin: string }[];
  lines: ConversationLine[];
  recordedYear: number;
  verificationStatus: Verification;
};
export type Comparison = {
  id: string;
  prompt: string;
  entries: { prefectureId: string; phrase: string }[];
};
export type Quiz = {
  id: string;
  question: string;
  choices: string[];
  answer: number;
  explanation: string;
  dialectId: string;
  difficulty: "やさしい" | "ふつう" | "むずかしい";
};

export type ModerationStatus =
  "submitted" | "under_review" | "approved" | "rejected";

export type Submission = {
  id: string;
  type: "dialect" | "conversation";
  prefectureId: string;
  regionId?: string;
  municipality?: string;
  phrase: string;
  standardJapanese: string;
  example?: string;
  nuance?: string;
  usageContext: string;
  ageGroup?: string;
  learnedFrom?: string;
  stillUsed?: boolean;
  recordingConsent: boolean;
  rightsOwnershipConfirmed: boolean;
  thirdPartyPrivacyConfirmed: boolean;
  publicationConsent: boolean;
  consentVersion: string;
  moderationChecklist?: {
    regionalFit: boolean;
    meaningAndExample: boolean;
    sourceOrCommunity: boolean;
    rightsAndConsent: boolean;
    privacyAndHarm: boolean;
  };
  reviewBasis?: "reference" | "community" | "insufficient";
  status: ModerationStatus;
  moderationNote?: string;
  submittedAt: string;
  updatedAt: string;
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type CorrectionRequest = {
  id: string;
  targetType: "dialect" | "conversation";
  targetId: string;
  requestType:
    | "factual_error"
    | "regional_difference"
    | "rights"
    | "consent_withdrawal"
    | "harmful_context"
    | "other";
  message: string;
  status: "received" | "investigating" | "resolved" | "dismissed";
  submittedAt: string;
  updatedAt: string;
};
