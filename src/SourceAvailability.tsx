import availability from "./data/source-availability.json";

export function SourceAvailability({ url }: { url?: string }) {
  const state = availability.find(item => item.url === url);
  if (!state) return null;
  return <small className="source-availability">
    資料リンク確認（{state.checkedAt}）：{state.message}
    {state.archiveUrl && <> <a href={state.archiveUrl} target="_blank" rel="noreferrer">過去の保存版を見る（Web Archive）</a></>}
  </small>;
}
