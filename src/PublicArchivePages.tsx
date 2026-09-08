import { Link } from "react-router-dom";
import { repository } from "./repository";
import { allPageMetadata } from "./seo";
import { Breadcrumbs } from "./Breadcrumbs";
import { NotFound } from "./NotFound";

export function ConversationSources() {
  return <section className="prose-page"><h1>会話・発話の資料を読む</h1><p>実際の資料に記録された発話と、その出典を紹介します。音声の提供は行っていません。</p><ul>{allPageMetadata.filter(p => p.indexable && p.path.startsWith('/stories/')).map(p => <li key={p.path}><Link to={p.path}>{p.title.replace('｜ことばの地図','')}</Link></li>)}</ul><details><summary>以前の会話ページについて</summary><p>資料による裏付けのない初期の会話例は掲載を終了しました。旧URLからは記録資料への案内を表示します。</p><ul>{repository.conversations().map(c => <li key={c.id}><Link to={`/conversations/${c.id}`}>{c.title}（掲載終了）</Link></li>)}</ul></details></section>;
}

export function ArchiveConversation({ id }: { id: string }) {
  const record = repository.conversation(id);
  if (!record) return <NotFound />;
  return <section className="prose-page"><Breadcrumbs /><h1>{record.title}</h1><p>このページにあった会話例は、出典で確認された発話ではないため掲載を終了しました。</p><p>語形や会話、音声を実際の地域資料として扱うことはできません。</p><Link className="button" to="/conversations">出典のある会話・発話資料を読む</Link></section>;
}

export function ArchivedQuiz() {
  return <section className="prose-page"><h1>方言クイズについて</h1><p>以前のクイズは出典確認が十分でないため掲載を終了しました。ことばの意味と地域差は、各記録の根拠資料から確認できます。</p><Link className="button" to="/search">記録と出典を探す</Link></section>;
}
