import { beforeEach, describe, expect, it } from "vitest";
import { isCorrectAnswer, resultMessage } from "./quiz";
import { repository } from "./repository";
import { parseDialectSearch } from "./searchParams";
import { createSubmission, submissionSchema } from "./submission";
import { correctionStore, reactionStore, submissionStore } from "./storage";
import { normalizeJapanese } from "./japaneseSearch";
import { hasPublishableAudio } from "./domain";
const memory = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => memory.set(key, value),
    removeItem: (key: string) => memory.delete(key),
    clear: () => memory.clear(),
  },
});

describe("critical flows", () => {
  beforeEach(() => localStorage.clear());
  it("never exposes audio without consent and withdrawal support", () => {
    expect(
      repository
        .dialects()
        .filter((item) => item.audioUrl)
        .every(hasPublishableAudio),
    ).toBe(true);
  });
  it("restores every URL filter", () => {
    const parsed = parseDialectSearch(
      new URLSearchParams("q=家庭&pref=p40&region=r1&age=全年代&context=家庭"),
    );
    expect(parsed).toEqual({
      q: "家庭",
      prefectureId: "p40",
      regionId: "r1",
      ageGroup: "全年代",
      context: "家庭",
    });
  });
  it("paginates without losing total", () => {
    const page = repository.dialectPage({ page: 2, pageSize: 5 });
    expect(page.items).toHaveLength(5);
    expect(page.total).toBeGreaterThan(15);
  });
  it("enforces one valid reaction value", () => {
    expect(reactionStore.set("d1", "invalid")).toBe(false);
    expect(reactionStore.set("d1", "use")).toBe(true);
    expect(reactionStore.get("d1")).toBe("use");
  });
  it("validates and creates a submitted item", () => {
    const input = submissionSchema.parse({
      type: "dialect",
      prefectureId: "p40",
      phrase: "ことば",
      standardJapanese: "意味",
      usageContext: "家庭",
      stillUsed: true,
      recordingConsent: false,
      rightsOwnershipConfirmed: true,
      thirdPartyPrivacyConfirmed: true,
      publicationConsent: true,
      consentVersion: "submission-consent-v1",
    });
    const submission = createSubmission(
      input,
      new Date("2026-01-01T00:00:00Z"),
    );
    expect(submission.status).toBe("submitted");
    expect(submissionStore.save(submission)).toBe(true);
    expect(submissionStore.all()).toHaveLength(1);
  });
  it("rejects submission without consent", () => {
    expect(
      submissionSchema.safeParse({
        type: "dialect",
        prefectureId: "p40",
        phrase: "ことば",
        standardJapanese: "意味",
        usageContext: "家庭",
        stillUsed: true,
        recordingConsent: false,
        rightsOwnershipConfirmed: true,
        thirdPartyPrivacyConfirmed: true,
        publicationConsent: false,
        consentVersion: "submission-consent-v1",
      }).success,
    ).toBe(false);
  });
  it("stores a structured moderation review", () => {
    const item = createSubmission({
      type: "dialect",
      prefectureId: "p40",
      phrase: "ことば",
      standardJapanese: "意味",
      usageContext: "家庭",
      stillUsed: true,
      recordingConsent: false,
      rightsOwnershipConfirmed: true,
      thirdPartyPrivacyConfirmed: true,
      publicationConsent: true,
      consentVersion: "submission-consent-v1",
    });
    submissionStore.save(item);
    submissionStore.review(item.id, {
      status: "under_review",
      moderationNote: "地域話者への確認を進めています",
      reviewBasis: "insufficient",
      moderationChecklist: {
        regionalFit: true,
        meaningAndExample: true,
        sourceOrCommunity: false,
        rightsAndConsent: true,
        privacyAndHarm: true,
      },
    });
    expect(submissionStore.all()[0].moderationChecklist?.regionalFit).toBe(
      true,
    );
  });
  it("stores and updates a correction request", () => {
    const now = "2026-08-31T00:00:00.000Z";
    correctionStore.save({
      id: "correction-1",
      targetType: "dialect",
      targetId: "d1",
      requestType: "regional_difference",
      message: "この表現は別の世代でも使われています。",
      status: "received",
      submittedAt: now,
      updatedAt: now,
    });
    correctionStore.updateStatus("correction-1", "investigating");
    expect(correctionStore.all()[0].status).toBe("investigating");
  });
  it("scores quizzes and provides a result message", () => {
    const question = repository.quizzes()[0];
    expect(isCorrectAnswer(question, question.answer)).toBe(true);
    expect(resultMessage(8, 10)).toContain("達人");
  });
  it("normalizes width, kana and spaces for search", () => {
    expect(normalizeJapanese(" ナマラー ")).toBe(normalizeJapanese("なまら"));
    expect(repository.dialects({ q: "ナマラー" })[0]?.phrase).toBe("なまら");
  });
});
