import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const failures = [];
const required = [
  "dist/index.html",
  "dist/robots.txt",
  "dist/manifest.webmanifest",
  "dist/editorial-policy/index.html",
  "dist/privacy/index.html",
  "dist/terms/index.html",
  "dist/corrections/index.html",
];

for (const path of required) {
  await access(join(root, ...path.split("/"))).catch(() =>
    failures.push(`${path}: 生成されていません`),
  );
}

const sourceFiles = ["src/App.tsx", "src/Corrections.tsx", "src/LegalPages.tsx"];
const source = (
  await Promise.all(sourceFiles.map((path) => readFile(join(root, path), "utf8")))
).join("\n");
for (const phrase of ["公開プレビュー", "確認待ち", "端末内デモ受付"]) {
  if (!source.includes(phrase)) failures.push(`表示文言「${phrase}」がありません`);
}

console.log(
  JSON.stringify(
    {
      status: failures.length ? "BLOCKED" : "PREVIEW_READY",
      scope: "未確認データを明示した公開プレビュー",
      warnings: [
        "文化資料としての正式公開判定ではありません",
        "投稿・訂正は運営者へ送信されず端末内にのみ保存されます",
        "運営主体・問い合わせ先が未設定の場合は未確定表示になります",
      ],
      failures,
    },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;

