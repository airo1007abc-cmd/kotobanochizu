import { useState } from "react";
import { memoStore } from "./storage";

export function LocalMemo() {
  const [notes, setNotes] = useState(memoStore.all);
  const [message, setMessage] = useState("");
  return <section>
    <div className="page-head"><h1>ことばのメモ</h1><p>思い出したことばをこの端末に保存できます。運営者へ送信したり、サイトに公開したりする機能はありません。個人情報は書かないでください。</p></div>
    <form onSubmit={event => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      const phrase = String(data.get("phrase") ?? "").trim();
      const detail = String(data.get("detail") ?? "").trim();
      if (!phrase) { setMessage("ことばを入力してください。"); return; }
      const next = [{ id: crypto.randomUUID(), phrase, detail }, ...notes].slice(0, 50);
      if (memoStore.save(next)) { setNotes(next); form.reset(); setMessage("メモをこの端末に保存しました。"); }
      else setMessage("保存できませんでした。ブラウザの保存設定を確認してください。");
    }}>
      <label>ことば（必須）<input name="phrase" required maxLength={200} /></label>
      <label>意味・使う地域・場面など<textarea name="detail" maxLength={3000} /></label>
      <p>最新50件を保存します。このブラウザの保存データを削除するとメモも消えます。</p>
      <button className="button" type="submit">この端末に保存する</button>
    </form>
    <p role="status">{message}</p>
    <h2>保存したメモ</h2>
    {notes.length ? <ul className="card-grid">{notes.map(note => <li className="card" key={note.id}><h3>{note.phrase}</h3><p style={{ whiteSpace: "pre-wrap" }}>{note.detail}</p><button className="text-button" onClick={() => {
      const next = notes.filter(item => item.id !== note.id);
      if (memoStore.save(next)) { setNotes(next); setMessage("メモを削除しました。"); }
      else setMessage("削除できませんでした。ブラウザの保存設定を確認してください。");
    }} aria-label={`${note.phrase}のメモを削除`}>削除</button></li>)}</ul> : <p>保存したメモはまだありません。</p>}
  </section>;
}
