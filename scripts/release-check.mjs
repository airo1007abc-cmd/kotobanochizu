import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const loadEnvironment = async () => {
  const values = { ...process.env };
  for (const name of [
    ".env.production.local",
    ".env.production",
    ".env.local",
  ]) {
    const content = await readFile(join(root, name), "utf8").catch(() => "");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^([A-Z][A-Z0-9_]*)\s*=\s*(.*)$/);
      if (!match || values[match[1]]) continue;
      values[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
    }
  }
  return values;
};

const env = await loadEnvironment();
const failures = [];
const requireValue = (name, description) => {
  if (!env[name]?.trim()) failures.push(`${name}: ${description}`);
};

requireValue("SITE_URL", "本番のHTTPS originが未設定");
if (env.SITE_URL && !/^https:\/\/[^/]+/i.test(env.SITE_URL))
  failures.push("SITE_URL: HTTPSのoriginではありません");
requireValue("OPERATOR_NAME", "運営主体が未設定");
requireValue("SUPPORT_EMAIL", "問い合わせ・訂正・撤回窓口が未設定");
requireValue("VITE_SUPABASE_URL", "本番データベースが未接続");
requireValue("VITE_SUPABASE_ANON_KEY", "本番公開キーが未設定");
if (env.VITE_DATA_SOURCE !== "supabase")
  failures.push("VITE_DATA_SOURCE: 正式公開ではsupabaseを指定してください");
if (env.LEGAL_REVIEWED !== "true")
  failures.push("LEGAL_REVIEWED: 正式規約・privacyの法務確認が未完了");
if (env.ACCESSIBILITY_REVIEWED !== "true")
  failures.push("ACCESSIBILITY_REVIEWED: 支援技術・実機による人手監査が未完了");
if (env.INCIDENT_CONTACT_CONFIGURED !== "true")
  failures.push(
    "INCIDENT_CONTACT_CONFIGURED: 障害・権利侵害の緊急連絡経路が未設定",
  );

const files = (await readdir(join(root, "src/data/dialects"))).filter((file) =>
  file.endsWith(".json"),
);
const records = (
  await Promise.all(
    files.map(async (file) =>
      JSON.parse(await readFile(join(root, "src/data/dialects", file), "utf8")),
    ),
  )
).flat();
const confirmedStatuses = new Set([
  "verified",
  "reference_confirmed",
  "community_confirmed",
  "reviewed",
]);
const flagship = [
  [2, "青森県"],
  [27, "大阪府"],
  [40, "福岡県"],
];
for (const [code, name] of flagship) {
  const count = records.filter(
    (item) =>
      item.prefectureCode === code &&
      confirmedStatuses.has(item.verificationStatus),
  ).length;
  if (count < 20)
    failures.push(
      `${name}: 確認済みJSON記録 ${count}/20（デモTSデータは確認済み数に含めません）`,
    );
}

const output = {
  checkedAt: new Date().toISOString(),
  status: failures.length ? "BLOCKED" : "READY",
  staticRecordsChecked: records.length,
  failureCount: failures.length,
  failures,
};
console.log(JSON.stringify(output, null, 2));
if (failures.length) process.exitCode = 1;
