import { useState } from "react";
import { Link } from "react-router-dom";
import type { ModerationStatus, Submission } from "./domain";
import { repository } from "./repository";
import { correctionStore, submissionStore } from "./storage";

const labels: Record<ModerationStatus, string> = {
  submitted: "未確認",
  under_review: "確認中",
  approved: "承認済み",
  rejected: "見送り",
};
const emptyChecklist = {
  regionalFit: false,
  meaningAndExample: false,
  sourceOrCommunity: false,
  rightsAndConsent: false,
  privacyAndHarm: false,
};
const checklistLabels = {
  regionalFit: "地域・市町村・世代の範囲を確認した",
  meaningAndExample: "意味・例文・ニュアンスを確認した",
  sourceOrCommunity: "文献または複数の地域話者で照合した",
  rightsAndConsent: "提供権限・公開同意の記録を確認した",
  privacyAndHarm: "個人情報・差別的文脈・安全性を確認した",
};

function ReviewCard({
  item,
  onChange,
}: {
  item: Submission;
  onChange: () => void;
}) {
  const [note, setNote] = useState(item.moderationNote ?? "");
  const [basis, setBasis] = useState<Submission["reviewBasis"]>(
    item.reviewBasis ?? "insufficient",
  );
  const [checks, setChecks] = useState(
    item.moderationChecklist ?? emptyChecklist,
  );
  const checklistComplete = Object.values(checks).every(Boolean);
  const consentComplete = Boolean(
    item.rightsOwnershipConfirmed &&
    item.thirdPartyPrivacyConfirmed &&
    item.publicationConsent &&
    item.consentVersion,
  );
  const canApprove =
    checklistComplete &&
    consentComplete &&
    basis !== "insufficient" &&
    note.trim().length >= 10;
  const saveReview = (status: ModerationStatus) => {
    submissionStore.review(item.id, {
      status,
      moderationNote: note.trim(),
      moderationChecklist: checks,
      reviewBasis: basis,
    });
    onChange();
  };
  return (
    <article>
      <div>
        <span className={`status ${item.status}`}>{labels[item.status]}</span>
        <small>{new Date(item.submittedAt).toLocaleString("ja-JP")}</small>
      </div>
      <h2>{item.phrase}</h2>
      <p>標準語：{item.standardJapanese}</p>
      <p>
        {repository.prefectures().find((p) => p.id === item.prefectureId)
          ?.name ?? "地域未設定"}
        ・{item.usageContext}
      </p>
      <div
        className={`consent-audit ${consentComplete ? "complete" : "incomplete"}`}
      >
        <b>投稿時同意：{consentComplete ? "記録あり" : "不足"}</b>
        <span>
          提供権限 {item.rightsOwnershipConfirmed ? "✓" : "×"}／第三者情報{" "}
          {item.thirdPartyPrivacyConfirmed ? "✓" : "×"}／公開同意{" "}
          {item.publicationConsent ? "✓" : "×"}
        </span>
      </div>
      <fieldset className="review-checklist">
        <legend>公開前チェック</legend>
        {(Object.keys(checklistLabels) as (keyof typeof checklistLabels)[]).map(
          (key) => (
            <label className="check" key={key}>
              <input
                type="checkbox"
                checked={checks[key]}
                onChange={(event) =>
                  setChecks((current) => ({
                    ...current,
                    [key]: event.target.checked,
                  }))
                }
              />
              {checklistLabels[key]}
            </label>
          ),
        )}
      </fieldset>
      <label>
        確認根拠
        <select
          value={basis}
          onChange={(event) =>
            setBasis(event.target.value as Submission["reviewBasis"])
          }
        >
          <option value="insufficient">根拠不足・確認中</option>
          <option value="community">複数の地域話者による確認</option>
          <option value="reference">文献・公的資料による確認</option>
        </select>
      </label>
      <label>
        審査メモ（承認時は根拠を10文字以上で記録）
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </label>
      {!canApprove && (
        <p className="approval-hint">
          承認には、投稿同意、5項目の確認、確認根拠、10文字以上の審査メモが必要です。
        </p>
      )}
      <div className="admin-actions">
        <button onClick={() => saveReview("under_review")}>
          確認内容を保存
        </button>
        <button disabled={!canApprove} onClick={() => saveReview("approved")}>
          根拠つきで承認
        </button>
        <button onClick={() => saveReview("rejected")}>見送る</button>
      </div>
    </article>
  );
}
export function AdminPage() {
  const [, refresh] = useState(0);
  const [filter, setFilter] = useState<ModerationStatus | "all">("all");
  const submissions = submissionStore
    .all()
    .filter((item) => filter === "all" || item.status === filter);
  const corrections = correctionStore.all();
  return (
    <section>
      <div className="page-head">
        <span className="eyebrow">開発環境限定</span>
        <h1>投稿の確認</h1>
        <p>
          端末内に保存されたデモ投稿を確認し、審査状態を動かせます。本番では管理者認証と監査ログが必要です。
        </p>
      </div>
      <div className="admin-tabs" role="group" aria-label="審査状態で絞り込む">
        {(
          ["all", "submitted", "under_review", "approved", "rejected"] as const
        ).map((status) => (
          <button
            className={filter === status ? "selected" : ""}
            onClick={() => setFilter(status)}
            key={status}
          >
            {status === "all" ? "すべて" : labels[status]}
          </button>
        ))}
      </div>
      {submissions.length === 0 ? (
        <div className="empty compact">
          <h2>該当する投稿はありません</h2>
          <p>
            <Link to="/submit">投稿フォーム</Link>
            からデモ投稿を作成すると、ここに表示されます。
          </p>
        </div>
      ) : (
        <div className="admin-list">
          {submissions.map((item) => (
            <ReviewCard
              key={item.id}
              item={item}
              onChange={() => refresh((x) => x + 1)}
            />
          ))}
        </div>
      )}
      <div className="admin-section-head">
        <span className="eyebrow">CORRECTIONS &amp; RIGHTS</span>
        <h2>訂正・権利申請</h2>
        <p>
          端末内デモ受付です。本番では権利・同意撤回を優先度付きキューとして扱います。
        </p>
      </div>
      {corrections.length ? (
        <div className="admin-list correction-admin-list">
          {corrections.map((request) => {
            const target =
              request.targetType === "dialect"
                ? repository.dialect(request.targetId)
                : repository.conversation(request.targetId);
            return (
              <article key={request.id}>
                <div>
                  <span className={`status ${request.status}`}>
                    {request.status === "received"
                      ? "受付"
                      : request.status === "investigating"
                        ? "調査中"
                        : request.status === "resolved"
                          ? "対応済み"
                          : "見送り"}
                  </span>
                  <small>
                    {new Date(request.submittedAt).toLocaleString("ja-JP")}
                  </small>
                </div>
                <h3>
                  {target
                    ? "phrase" in target
                      ? target.phrase
                      : target.title
                    : "対象記録なし"}
                </h3>
                <p>{request.message}</p>
                <label>
                  対応状態
                  <select
                    value={request.status}
                    onChange={(event) => {
                      correctionStore.updateStatus(
                        request.id,
                        event.target.value as typeof request.status,
                      );
                      refresh((x) => x + 1);
                    }}
                  >
                    <option value="received">受付</option>
                    <option value="investigating">調査中</option>
                    <option value="resolved">対応済み</option>
                    <option value="dismissed">見送り</option>
                  </select>
                </label>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="empty compact">
          <h2>訂正・権利申請はありません</h2>
        </div>
      )}
    </section>
  );
}
