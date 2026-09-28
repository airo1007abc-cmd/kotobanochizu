import { Volume2 } from "lucide-react";
import type { Dialect } from "./domain";
import { hasPublishableAudio } from "./domain";

const speakerDisplayLabel = (dialect: Dialect) =>
  dialect.mediaRights?.speakerDisplay === "credited"
    ? "本人希望の名前"
    : dialect.mediaRights?.speakerDisplay === "age_and_region"
      ? "年代・地域のみ"
      : "匿名";

export function DialectAudioPlayer({ dialect }: { dialect: Dialect }) {
  if (!hasPublishableAudio(dialect)) return null;
  const archive = dialect.archivalAudio;

  return (
    <section
      className="dialect-audio-card"
      aria-labelledby={`audio-${dialect.id}`}
    >
      <h2 id={`audio-${dialect.id}`}>
        <Volume2 /> 発話音声
      </h2>
      <p className="dialect-audio-transcript">
        <b>{dialect.phrase}</b>
        <span>意味：{dialect.standardJapanese}</span>
      </p>
      <audio
        controls
        preload="none"
        src={dialect.audioUrl}
        aria-label={`「${dialect.phrase}」（意味：${dialect.standardJapanese}）の発話音声`}
      >
        音声を再生できないブラウザです。
      </audio>
      {archive ? (
        <>
          <dl className="dialect-audio-meta">
            <div>
              <dt>記録日</dt>
              <dd>{archive.recordingDate ?? "原資料に記載なし"}</dd>
            </div>
            <div>
              <dt>記録地点</dt>
              <dd>{archive.recordingLocation}</dd>
            </div>
            <div>
              <dt>話者</dt>
              <dd>{archive.speakerLabel}</dd>
            </div>
            <div>
              <dt>発話番号</dt>
              <dd>{archive.utteranceId}</dd>
            </div>
            <div>
              <dt>原音声</dt>
              <dd>
                <a
                  href={archive.originalAudioUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {archive.originalFileName}
                </a>
              </dd>
            </div>
          </dl>
          <p className="dialect-audio-caution">
            この音声は原資料に記録された一人の話者の発話例です。地域全体の標準的な発音を示すものではありません。
          </p>
          <p className="dialect-audio-source">
            出典：
            <a href={archive.sourceUrl} target="_blank" rel="noreferrer">
              {archive.sourceTitle}
            </a>
            （{archive.sourceOrganization}）<span aria-hidden="true">・</span>
            <a
              href={archive.licenseUrl}
              target="_blank"
              rel="license noreferrer"
            >
              {archive.licenseName}
            </a>
          </p>
          <small>{archive.modificationNote}</small>
        </>
      ) : (
        <small>話者表示：{speakerDisplayLabel(dialect)}</small>
      )}
    </section>
  );
}
