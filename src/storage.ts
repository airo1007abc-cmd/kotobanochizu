import type { CorrectionRequest, ModerationStatus, Submission } from "./domain";
const available = () =>
  typeof globalThis !== "undefined" && "localStorage" in globalThis;
const readJson = <T>(
  key: string,
  fallback: T,
  validate: (value: unknown) => value is T,
): T => {
  if (!available()) return fallback;
  try {
    const parsed: unknown = JSON.parse(
      globalThis.localStorage.getItem(key) ?? "null",
    );
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};
const writeJson = (key: string, value: unknown) => {
  if (!available()) return false;
  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
const isStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");
const unique = (items: string[]) => [...new Set(items)].slice(0, 50);
const collection = (key: string) => ({
  all: () => readJson(key, [], isStrings),
  has: (id: string) => readJson(key, [], isStrings).includes(id),
  toggle: (id: string) => {
    const old = readJson(key, [], isStrings);
    const next = old.includes(id)
      ? old.filter((item) => item !== id)
      : unique([...old, id]);
    writeJson(key, next);
    return next;
  },
});
export const favorites = collection("kotoba:favorites:v1");
export const regionFavorites = collection("kotoba:region-favorites:v1");
export const recentDialects = {
  all: () => readJson("kotoba:recent:v1", [], isStrings),
  add: (id: string) => {
    const next = unique([
      id,
      ...readJson("kotoba:recent:v1", [], isStrings).filter(
        (item) => item !== id,
      ),
    ]).slice(0, 8);
    writeJson("kotoba:recent:v1", next);
    return next;
  },
};
const reactionValues = ["use", "heard", "new"] as const;
export const reactionStore = {
  get: (id: string) => {
    if (!available()) return null;
    const value = globalThis.localStorage.getItem(`kotoba:reaction:${id}`);
    return reactionValues.includes(value as (typeof reactionValues)[number])
      ? value
      : null;
  },
  set: (id: string, value: string) => {
    if (
      !reactionValues.includes(value as (typeof reactionValues)[number]) ||
      !available()
    )
      return false;
    try {
      globalThis.localStorage.setItem(`kotoba:reaction:${id}`, value);
      return true;
    } catch {
      return false;
    }
  },
};
const statuses: ModerationStatus[] = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
];
const isSubmission = (value: unknown): value is Submission =>
  !!value &&
  typeof value === "object" &&
  "id" in value &&
  "status" in value &&
  statuses.includes((value as Submission).status);
const isSubmissions = (value: unknown): value is Submission[] =>
  Array.isArray(value) && value.every(isSubmission);
export const submissionStore = {
  all: () => readJson("kotoba:submissions:v1", [], isSubmissions),
  save: (submission: Submission) =>
    writeJson("kotoba:submissions:v1", [
      submission,
      ...submissionStore.all().filter((item) => item.id !== submission.id),
    ]),
  updateStatus: (id: string, status: ModerationStatus, moderationNote = "") => {
    const next = submissionStore.all().map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            moderationNote,
            updatedAt: new Date().toISOString(),
          }
        : item,
    );
    writeJson("kotoba:submissions:v1", next);
    return next;
  },
  review: (
    id: string,
    review: Pick<
      Submission,
      "status" | "moderationNote" | "moderationChecklist" | "reviewBasis"
    >,
  ) => {
    const next = submissionStore
      .all()
      .map((item) =>
        item.id === id
          ? { ...item, ...review, updatedAt: new Date().toISOString() }
          : item,
      );
    writeJson("kotoba:submissions:v1", next);
    return next;
  },
};
export const draftStore = {
  get: () =>
    readJson<Record<string, string>>(
      "kotoba:submission-draft:v1",
      {},
      (value): value is Record<string, string> =>
        !!value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.values(value).every((item) => typeof item === "string"),
    ),
  save: (draft: Record<string, string>) =>
    writeJson("kotoba:submission-draft:v1", draft),
  clear: () => {
    if (available())
      try {
        globalThis.localStorage.removeItem("kotoba:submission-draft:v1");
      } catch {
        /* unavailable */
      }
  },
};

const correctionStatuses: CorrectionRequest["status"][] = [
  "received",
  "investigating",
  "resolved",
  "dismissed",
];
const isCorrection = (value: unknown): value is CorrectionRequest =>
  !!value &&
  typeof value === "object" &&
  "id" in value &&
  "status" in value &&
  correctionStatuses.includes((value as CorrectionRequest).status);
const isCorrections = (value: unknown): value is CorrectionRequest[] =>
  Array.isArray(value) && value.every(isCorrection);
export const correctionStore = {
  all: () => readJson("kotoba:corrections:v1", [], isCorrections),
  save: (request: CorrectionRequest) =>
    writeJson("kotoba:corrections:v1", [
      request,
      ...correctionStore.all().filter((item) => item.id !== request.id),
    ]),
  updateStatus: (id: string, status: CorrectionRequest["status"]) => {
    const next = correctionStore
      .all()
      .map((item) =>
        item.id === id
          ? { ...item, status, updatedAt: new Date().toISOString() }
          : item,
      );
    writeJson("kotoba:corrections:v1", next);
    return next;
  },
};
