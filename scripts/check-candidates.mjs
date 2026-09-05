import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const candidates = process.argv.slice(2).map((value) => value.trim()).filter(Boolean);
if (!candidates.length) {
  console.error("usage: npm run seo:check-candidates -- 語1 語2 ...");
  process.exit(2);
}

const directory = path.resolve("src/data/dialects");
const files = (await readdir(directory)).filter((file) => file.endsWith(".json"));
const records = (await Promise.all(files.map(async (file) => {
  const items = JSON.parse(await readFile(path.join(directory, file), "utf8"));
  return items.map((item) => ({ ...item, file }));
}))).flat();

let duplicates = 0;
for (const phrase of candidates) {
  const normalized = phrase.normalize("NFKC");
  const matches = records.filter((item) =>
    item.phrase.normalize("NFKC") === normalized ||
    item.reading?.normalize("NFKC") === normalized
  );
  if (matches.length) duplicates += 1;
  console.log(JSON.stringify({ phrase, available: matches.length === 0, matches: matches.map(({ id, slug, file }) => ({ id, slug, file })) }));
}
process.exitCode = duplicates ? 1 : 0;
