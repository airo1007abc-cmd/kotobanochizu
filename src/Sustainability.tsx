import {
  HeartHandshake,
  Scale,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Sustainability() {
  return (
    <section className="prose-page sustainability-page">
      <div className="page-head">
        <span className="eyebrow">SUSTAINABLE CULTURE</span>
        <h1>文化を閉じずに、続けていく。</h1>
        <p>
          調べるための基本機能を無料で開きながら、収録・確認・保存を続けるための方針を示しています。有料プランや寄付の受付は行っていません。
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
