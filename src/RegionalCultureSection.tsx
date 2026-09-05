import { Archive, BookOpen, ExternalLink, Film, MessageCircle, Music2, Volume2 } from "lucide-react";
import type { RegionalCultureItem } from "./domain";

const labels: Record<RegionalCultureItem["type"], string> = { audio: "音声", conversation: "会話", song: "童歌・民謡", commercial: "CM", archive: "資料アーカイブ", book: "書籍・テキスト", video: "映像", other: "文化資料" };
const icons = { audio: Volume2, conversation: MessageCircle, song: Music2, commercial: Film, archive: Archive, book: BookOpen, video: Film, other: Archive };

export function RegionalCultureSection({ title, items }: { title: string; items: RegionalCultureItem[] }) {
  if (!items.length) return null;
  return <section className="regional-culture" aria-labelledby="regional-culture-title">
    <div className="prefecture-v2-section-head"><div><span className="eyebrow">VOICE &amp; CULTURE</span><h2 id="regional-culture-title">{title}</h2></div><p>自治体・大学・研究機関等が公開する資料へ案内します。音源・映像・歌詞をこのサイトへ無断転載しません。</p></div>
    <div className="regional-culture-grid">{items.slice(0, 8).map((item) => { const Icon = icons[item.type]; return <a href={item.sourceUrl} target="_blank" rel="noreferrer" key={item.id}>
      <div><span><Icon/>{labels[item.type]}</span><small>公式資料への外部リンク <ExternalLink/></small></div><h3>{item.title}</h3><p>{item.description}</p><footer><strong>{item.sourceOrganization}</strong><span>{item.municipality ?? "広域資料"}</span></footer>
    </a>; })}</div>
    <p className="regional-culture-rights">各資料の著作権・利用条件は提供元に帰属します。リンク先の利用条件をご確認ください。</p>
  </section>;
}
