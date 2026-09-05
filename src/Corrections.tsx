import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { correctionStore } from "./storage";
import { repository } from "./repository";
import type { CorrectionRequest } from "./domain";

const requestLabels: Record<CorrectionRequest["requestType"], string> = {
  factual_error: "意味・読み・例文などの誤り",
  regional_difference: "地域・世代による違い",
  rights: "著作権・肖像・個人情報などの権利",
  consent_withdrawal: "音声・映像・証言の同意撤回",
  harmful_context: "差別的・有害・不適切な文脈",
  other: "その他",
};

export function Corrections() {
  const [params] = useSearchParams();
  const dialectId = params.get("dialect");
  const conversationId = params.get("conversation");
  const dialect = dialectId ? repository.dialect(dialectId) : undefined;
  const conversation = conversationId
    ? repository.conversation(conversationId)
    : undefined;
  const target = dialect ?? conversation;
  const targetType: CorrectionRequest["targetType"] = dialect
    ? "dialect"
    : "conversation";
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  if (!target)
    return (
      <section className="prose-page">
        <div className="page-head">
          <span className="eyebrow">CORRECTIONS &amp; RIGHTS</span>
          <h1>対象の記録を選んでください</h1>
          <p>
            訂正・削除の申請は、各ことば・会話ページの「訂正・権利について知らせる」から始められます。
          </p>
        </div>
        <Link className="button" to="/search">
          ことばを探す
        </Link>
      </section>
    );

  if (done)
    return (
      <section className="quiz-result correction-complete">
        <CheckCircle2 />
        <h1>申請内容を端末に保存しました</h1>
        <p>
          これは公開前のデモ受付で、運営者には送信されていません。本番窓口の接続後は、受付番号と対応状況を確認できる設計へ移行します。
        </p>
        <Link
          className="button secondary"
          to={
            dialect
              ? `/dialects/${dialect.id}`
              : `/conversations/${conversation!.id}`
          }
        >
          記録へ戻る
        </Link>
      </section>
    );

  return (
    <section className="prose-page correction-page">
      <div className="page-head">
        <span className="eyebrow">CORRECTIONS &amp; RIGHTS</span>
        <h1>訂正・権利について知らせる</h1>
        <p>
          誤り、地域差、権利侵害、同意撤回を優先して確認するための窓口です。
        </p>
      </div>
      <div className="correction-target">
        <small>対象の記録</small>
        <strong>{"phrase" in target ? target.phrase : target.title}</strong>
        <span>
          {"standardJapanese" in target
            ? `標準語：${target.standardJapanese}`
            : target.description}
        </span>
      </div>
      <div className="review-notice">
        <AlertTriangle />
        <div>
          <b>現在は端末内デモ受付です</b>
          <p>
            入力内容はサーバーや運営者へ送信されません。緊急の権利侵害や同意撤回を受け付ける正式窓口は、運営主体と連絡先の確定後に接続します。
          </p>
        </div>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const message = String(data.get("message") ?? "").trim();
          if (message.length < 10) {
            setError("状況を10文字以上で教えてください");
            return;
          }
          const now = new Date().toISOString();
          correctionStore.save({
            id: `local-correction-${Date.now()}`,
            targetType,
            targetId: target.id,
            requestType: data.get(
              "requestType",
            ) as CorrectionRequest["requestType"],
            message,
            status: "received",
            submittedAt: now,
            updatedAt: now,
          });
          setDone(true);
        }}
      >
        <label>
          申請の種類 <b>必須</b>
          <select name="requestType">
            {Object.entries(requestLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          確認してほしい内容 <b>必須</b>
          <textarea
            name="message"
            maxLength={4000}
            aria-describedby="correction-help"
            placeholder="どの部分に、どのような問題や地域差がありますか？ 同意撤回の場合は対象となる素材を説明してください。"
          />
        </label>
        <p id="correction-help" className="form-help">
          公開フォームには、住所、電話番号、本人確認書類などの機微情報を書かないでください。本番では必要に応じて安全な本人確認手段を別途案内します。
        </p>
        {error && (
          <div className="errors" role="alert">
            <p>{error}</p>
          </div>
        )}
        <label className="check">
          <input type="checkbox" required />
          入力内容が事実にもとづき、嫌がらせや虚偽の申請ではないことを確認します。
        </label>
        <button className="button" type="submit">
          <ShieldCheck />
          内容を端末内に保存
        </button>
      </form>
    </section>
  );
}
