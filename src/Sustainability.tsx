import {
  Building2,
  GraduationCap,
  HeartHandshake,
  Scale,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Sustainability() {
  return (
    <section className="prose-page sustainability-page">
      <div className="page-head">
        <span className="eyebrow">SUSTAINABLE CULTURE</span>
        <h1>文化を閉じずに、続けていく。</h1>
        <p>
          調べるための基本機能を無料で開きながら、収録・確認・保存に必要な費用を、個人支援と組織向けサービスで支える方針です。
        </p>
      </div>
      <div className="public-promise">
        <HeartHandshake />
        <div>
          <small>OUR PUBLIC PROMISE</small>
          <h2>基本の辞典・検索・確認状態は無料。</h2>
          <p>
            文化資料への入口を有料の壁で閉じません。料金が発生する場合は、追加の保存容量、教材運用、共同制作、専門的なデータ提供など、明確な付加価値に対して設定します。
          </p>
        </div>
      </div>
      <div className="revenue-grid">
        <article>
          <Sparkles />
          <small>INDIVIDUAL</small>
          <h2>個人サポーター</h2>
          <p>
            広告なし、学習履歴同期、家族アーカイブの追加容量など。正式価格は原価と需要を検証してから提示します。
          </p>
          <span>公開後の検証候補</span>
        </article>
        <article>
          <Building2 />
          <small>REGIONAL</small>
          <h2>自治体・文化施設</h2>
          <p>
            共同収録、地域特集、展示、観光音声ガイド。話者への謝礼と地域への成果還元を見積に含めます。
          </p>
          <span>最初に検証する収益源</span>
        </article>
        <article>
          <GraduationCap />
          <small>EDUCATION</small>
          <h2>教育・研究</h2>
          <p>
            教材、教員向け運用、権利処理済みデータセット、研究API。利用範囲と再配布条件を契約単位で管理します。
          </p>
          <span>連携先と共同設計</span>
        </article>
      </div>
      <div className="policy-copy">
        <h2>収益化で守る5つの原則</h2>
        <ol>
          <li>
            <b>無料の入口</b>
            <span>基本検索と文化的説明を有料会員だけに限定しない。</span>
          </li>
          <li>
            <b>同意の範囲</b>
            <span>
              サイト掲載への同意を、広告・AI・商品化への同意に読み替えない。
            </span>
          </li>
          <li>
            <b>地域へ還元</b>
            <span>共同制作費、話者謝礼、成果物、利用報告の形で還元する。</span>
          </li>
          <li>
            <b>広告の節度</b>
            <span>記録本文や音声体験を分断する広告配置を行わない。</span>
          </li>
          <li>
            <b>透明な数字</b>
            <span>
              架空の利用者数、導入実績、満足度、価格比較を表示しない。
            </span>
          </li>
        </ol>
      </div>
      <div className="ethics-cta">
        <Scale />
        <div>
          <h2>データは「採掘する資源」ではありません。</h2>
          <p>
            音声・証言・地域知識の商用利用は、素材ごとの権利と契約を確認し、提供者が理解できる言葉で説明します。
          </p>
        </div>
        <Link className="button secondary" to="/terms">
          権利方針を見る
        </Link>
      </div>
    </section>
  );
}
