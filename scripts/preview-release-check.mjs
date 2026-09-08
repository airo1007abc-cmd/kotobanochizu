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

const sourceFiles = ["src/App.tsx", "src/Corrections.tsx", "src/LegalPages.tsx", "src/LocalMemo.tsx"];
const source = (
  await Promise.all(sourceFiles.map((path) => readFile(join(root, path), "utf8")))
).join("\n");
for (const phrase of ["資料と確認状態について", "この端末に保存する", "運営者へ送信"]) {
  if (!source.includes(phrase)) failures.push(`表示文言「${phrase}」がありません`);
}

console.log(
  JSON.stringify(
    {
      status: failures.length ? "BLOCKED" : "EDITORIAL_READY",
      scope: "資料ごとの確認範囲と端末内保存を明示した公開サイト",
      warnings: [
        "文化資料としての正式公開判定ではありません",
        "ことばのメモは端末内保存。訂正の受付フォームはありません",
        "運営主体・問い合わせ先が未設定の場合は掲載されていないことを明示します",
      ],
      failures,
    },
    null,
    2,
  ),
);
if (failures.length) process.exitCode = 1;

