import type { DialectQuery } from "./repository";
export const parseDialectSearch = (params: URLSearchParams): DialectQuery => ({
  q: params.get("q")?.trim() || undefined,
  prefectureId: params.get("pref") || undefined,
  regionId: params.get("region") || undefined,
  ageGroup: params.get("age") || undefined,
  context: params.get("context") || undefined,
  verificationStatus:
    (params.get("status") as DialectQuery["verificationStatus"]) || undefined,
});
