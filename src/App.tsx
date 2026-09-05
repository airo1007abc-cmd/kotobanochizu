import { lazy, Suspense, useEffect, useState } from "react";
import {
  NavLink,
  Link,
  Route,
  Routes,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  BookOpen,
  ChevronLeft,
  Heart,
  Home as HomeIcon,
  Map,
  MapPin,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Volume2,
  ArrowRight,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { repository } from "./repository";
import { JapanPrefectureMap } from "./JapanPrefectureMap";
import { DialectDetailV2 } from "./DialectDetailV2";
import { PrefectureDetailV2 } from "./PrefectureDetailV2";
import { createPrefectureDetailViewModel } from "./prefectureDetailViewModel";
import { shouldUsePrefectureDetailV2 } from "./prefectureDetailVersion";
import { RegionDetailV2 } from "./RegionDetailV2";
import { createRegionDetailViewModel } from "./regionDetailViewModel";
import { shouldUseRegionDetailV2 } from "./regionDetailVersion";
import { USE_DIALECT_DETAIL_V2 } from "./dialectDetailVersion";
import {
  createSubmission,
  submissionSchema,
  type SubmissionInput,
} from "./submission";
import {
  favorites,
  reactionStore,
  recentDialects,
  submissionStore,
} from "./storage";
import { hasPublishableAudio, type Dialect } from "./domain";
import { isPreview, siteConfig } from "./siteConfig";
import meaningComparisonData from "./data/meaning-comparisons.json";
import regionGuideData from "./data/region-guides.json";
import cultureGuideData from "./data/culture-guides.json";
import contextGuideData from "./data/context-guides.json";
const AdminPage = lazy(() =>
  import("./AdminPage").then((module) => ({ default: module.AdminPage })),
);
const EditorialPolicy = lazy(() =>
  import("./PublicPages").then((module) => ({
    default: module.EditorialPolicy,
  })),
);
const ForOrganizations = lazy(() =>
  import("./PublicPages").then((module) => ({
    default: module.ForOrganizations,
  })),
);
const Privacy = lazy(() =>
  import("./LegalPages").then((module) => ({ default: module.Privacy })),
);
const Terms = lazy(() =>
  import("./LegalPages").then((module) => ({ default: module.Terms })),
);
const MeaningAtlas = lazy(() =>
  import("./MeaningAtlas").then((module) => ({ default: module.MeaningAtlas })),
);
const MeaningComparison = lazy(() =>
  import("./MeaningAtlas").then((module) => ({
    default: module.MeaningComparison,
  })),
);
const RegionGuidePage = lazy(() =>
  import("./RegionGuide").then((module) => ({ default: module.RegionGuide })),
);
const CultureGuidePage = lazy(() =>
  import("./CultureGuide").then((module) => ({ default: module.CultureGuide })),
);
const ContextGuidePage = lazy(() =>
  import("./ContextGuide").then((module) => ({ default: module.ContextGuide })),
);

const Sustainability = lazy(() =>
  import("./Sustainability").then((module) => ({
    default: module.Sustainability,
  })),
);
const Corrections = lazy(() =>
  import("./Corrections").then((module) => ({ default: module.Corrections })),
);
const prefName = (id: string) =>
  repository.prefectures().find((p) => p.id === id)?.name ?? "";
const regionName = (id: string) =>
  repository.regions().find((r) => r.id === id)?.name ?? "";
const verificationLabel = (status: Dialect["verificationStatus"]) =>
  status === "needs_review"
    ? "要確認候補"
    : status === "demo_candidate" || status === "demo"
      ? "デモ使用例"
      : status === "community_confirmed" || status === "community"
        ? "地域確認"
        : "参照確認";
function Shell() {
  const { pathname } = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "ことばの地図｜声と暮らしでたどる日本の地域言語文化",
      "/prefectures": "47都道府県のことば｜ことばの地図",
      "/search": "方言・地域のことばを検索｜ことばの地図",
      "/compare": "全国ことばくらべ｜ことばの地図",
      "/meanings": "一つの意味、全国のことば｜ことばの地図",
      "/editorial-policy": "編集方針と信頼性｜ことばの地図",
      "/for-organizations": "自治体・教育・研究機関の方へ｜ことばの地図",
      "/sustainability": "文化を支える仕組み｜ことばの地図",
      "/corrections": "訂正・権利の申請｜ことばの地図",
    };
    const descriptions: Record<string, string> = {
      "/": "日本全国の方言と地域のことばを、土地・世代・暮らしの場面・確認状態とともに残す地域言語文化アーカイブ。",
      "/prefectures":
        "47都道府県、171の地域区分から、暮らしのことばを探せます。",
      "/search":
        "方言、読み、標準語、地域、世代、暮らしの場面、確認状態から使用例を検索できます。",
      "/meanings":
        "ありがとう、とても、がんばる。一つの意味が各地でどう響くかを横断して比べます。",
      "/editorial-policy":
        "確認状態、出典、話者の権利を明示する、ことばの地図の編集方針です。",
      "/sustainability":
        "基本の文化アーカイブを無料で開きながら、個人支援と組織向けサービスで継続する方針です。",
      "/corrections":
        "誤り、地域差、権利侵害、同意撤回について知らせるための受付です。",
    };
    const dialectMatch = pathname.match(/^\/dialects\/([^/]+)$/);
    const dialect = dialectMatch
      ? repository.dialect(decodeURIComponent(dialectMatch[1]))
      : undefined;
    const prefectureMatch = pathname.match(/^\/prefectures\/([^/]+)$/);
    const prefecture = prefectureMatch
      ? repository.prefectures().find((item) => item.id === prefectureMatch[1])
      : undefined;
    const meaningMatch = pathname.match(/^\/meanings\/([^/]+)$/);
    const meaningComparison = meaningMatch
      ? meaningComparisonData.find((item) => item.slug === meaningMatch[1])
      : undefined;
    const regionGuideMatch = pathname.match(/^\/guides\/regions\/([^/]+)$/);
    const regionGuide = regionGuideMatch
      ? regionGuideData.find((item) => item.slug === regionGuideMatch[1])
      : undefined;
    const cultureGuideMatch = pathname.match(/^\/guides\/culture\/([^/]+)$/);
    const cultureGuide = cultureGuideMatch
      ? cultureGuideData.find((item) => item.slug === cultureGuideMatch[1])
      : undefined;
    const contextGuideMatch = pathname.match(/^\/stories\/([^/]+)$/);
    const contextGuide = contextGuideMatch
      ? contextGuideData.find((item) => item.slug === contextGuideMatch[1])
      : undefined;
    const title = dialect
      ? `${dialect.phrase}の意味・使い方（${dialect.municipality ? `${dialect.municipality}・` : ""}${prefName(dialect.prefectureId)}）｜ことばの地図`
      : prefecture
        ? `${prefecture.name}の方言・地域のことば｜ことばの地図`
        : meaningComparison
          ? `${meaningComparison.title}｜ことばの地図`
          : regionGuide
            ? `${regionGuide.title}｜ことばの地図`
            : cultureGuide
              ? `${cultureGuide.title}｜ことばの地図`
              : contextGuide
                ? `${contextGuide.title}｜ことばの地図`
                : (titles[pathname] ?? "ことばの地図｜日本の地域言語文化アーカイブ");
    const description = dialect
      ? `${prefName(dialect.prefectureId)}・${regionName(dialect.regionId)}での「${dialect.phrase}」の使用例。標準語では「${dialect.standardJapanese}」。確認状態と地域差を明示しています。`
      : prefecture
        ? `${prefecture.name}で受け継がれる方言と地域のことばを、地域差・世代・使用場面・確認状態とともに紹介します。`
        : meaningComparison
          ? meaningComparison.description
          : regionGuide
            ? regionGuide.description
            : cultureGuide
              ? cultureGuide.description
              : contextGuide
                ? contextGuide.description
                : (descriptions[pathname] ??
                  "日本全国の方言と地域のことばを、土地・世代・暮らしの場面・確認状態とともに残す地域言語文化アーカイブ。");
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", description);
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        本文へ移動
      </a>
      {isPreview && (
        <div className="preview-banner" role="status">
          <b>公開プレビュー</b>
          <span>
            掲載内容は確認待ちの使用例です。研究・引用の確定資料ではありません。
          </span>
          <Link to="/editorial-policy">確認状態を見る</Link>
        </div>
      )}
      <header className="site-header">
        <Link className="brand" to="/">
          <span>こ</span>ことばの地図
        </Link>
        <nav>
          <NavLink to="/prefectures">地域を探す</NavLink>
          <NavLink to="/search">ことば検索</NavLink>
          <NavLink to="/compare">全国くらべ</NavLink>
          <NavLink to="/meanings">意味の地図</NavLink>
          <NavLink to="/quiz">クイズ</NavLink>
        </nav>
        <Link className="button small" to="/submit">
          <Send size={17} />
          ことばを残す
        </Link>
      </header>
      <main id="main-content">
        <Suspense
          fallback={
            <div className="route-loading" role="status">
              ページを読み込んでいます…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/prefectures" element={<Prefectures />} />
            <Route path="/prefectures/:id" element={<Prefecture />} />
            <Route path="/regions/:id" element={<Region />} />
            <Route path="/dialects/:id" element={<DialectDetail />} />
            {import.meta.env.DEV && <Route path="/preview/dialect-v2/:id" element={<DialectDetailV2Preview />} />}
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/conversations/:id" element={<ConversationDetail />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/meanings" element={<MeaningAtlas />} />
            <Route path="/meanings/:slug" element={<MeaningComparison />} />
            <Route path="/guides/regions/:slug" element={<RegionGuidePage />} />
            <Route path="/guides/culture/:slug" element={<CultureGuidePage />} />
            <Route path="/stories/:slug" element={<ContextGuidePage />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/submit" element={<Submit />} />
            <Route path="/editorial-policy" element={<EditorialPolicy />} />
            <Route path="/for-organizations" element={<ForOrganizations />} />
            <Route path="/sustainability" element={<Sustainability />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/corrections" element={<Corrections />} />
            {import.meta.env.DEV && (
              <Route path="/admin" element={<AdminPage />} />
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <MobileNav />
      <footer>
        <div className="footer-grid">
          <div>
            <div className="brand light">
              <span>こ</span>ことばの地図
            </div>
            <p>
              日本中の「いつもの言い方」を、声・土地・人・時間とともに未来へ。
            </p>
          </div>
          <div>
            <b>めぐる</b>
            <Link to="/prefectures">地域から探す</Link>
            <Link to="/search">意味から探す</Link>
            <Link to="/compare">全国でくらべる</Link>
            <Link to="/meanings">意味の地図</Link>
          </div>
          <div>
            <b>このアーカイブについて</b>
            <Link to="/editorial-policy">編集方針と信頼性</Link>
            <Link to="/for-organizations">自治体・教育・研究機関の方へ</Link>
            <Link to="/sustainability">文化を支える仕組み</Link>
            <Link to="/submit">ことばを残す</Link>
            <Link to="/privacy">プライバシー</Link>
            <Link to="/terms">利用・投稿・権利</Link>
            <Link to="/corrections">訂正・権利の申請</Link>
          </div>
        </div>
        <p className="muted">
          掲載内容は地域・家庭・世代で異なる使用例です。確認状態と出典を明示し、未確認情報を監修済み資料として扱いません。
        </p>
        <p className="muted site-operator">
          運営：{siteConfig.operatorName ?? "公開準備チーム（正式名称は確定後に掲載）"}
          {siteConfig.supportEmail && (
            <>
              {" · "}
              <a href={`mailto:${siteConfig.supportEmail}`}>
                {siteConfig.supportEmail}
              </a>
            </>
          )}
        </p>
        {import.meta.env.DEV && (
          <Link className="dev-link" to="/admin">
            開発用・投稿確認
          </Link>
        )}
      </footer>
    </>
  );
}
function MobileNav() {
  return (
    <nav className="mobile-nav">
      <NavLink to="/">
        <HomeIcon />
        ホーム
      </NavLink>
      <NavLink to="/prefectures">
        <Map />
        地域
      </NavLink>
      <NavLink to="/search">
        <Search />
        検索
      </NavLink>
      <NavLink to="/favorites">
        <Heart />
        保存
      </NavLink>
      <NavLink to="/submit">
        <Send />
        投稿
      </NavLink>
    </nav>
  );
}
function Home() {
  const featured = repository.dialects().slice(0, 3),
    talk = repository.conversations()[0];
  return (
    <>
      <section className="hero">
        <div>
          <div className="eyebrow">THE LIVING LANGUAGE ARCHIVE OF JAPAN</div>
          <h1>
            あなたにとっての
            <br />
            <em>「いつものことば」</em>を、未来へ。
          </h1>
          <p>
            方言は、単語の一覧ではありません。土地の記憶、人の声、世代の時間が重なった文化です。47都道府県の使用例を、地域差と確認状態とともにたどります。
          </p>
          <div className="actions">
            <Link className="button" to="/prefectures">
              <MapPin />
              地域からめぐる
            </Link>
            <Link className="button secondary" to="/search">
              <Search />
              ことばを探す
            </Link>
          </div>
          <div className="stats">
            <b>
              47<small>都道府県</small>
            </b>
            <b>
              171<small>地域区分</small>
            </b>
            <b>
              67<small>現在の使用例</small>
            </b>
          </div>
        </div>
        <aside className="speech">
          <span className="tape">今日のことば</span>
          <p>なんしようと？</p>
          <small>何をしているの？</small>
          <div>
            <span className="badge">福岡市周辺</span>
            <button aria-label="音声サンプル未収録">
              <Volume2 />
              声をきく
            </button>
          </div>
          <i>※ デモコンテンツ</i>
        </aside>
      </section>
      <section className="archive-manifesto">
        <div>
          <span className="eyebrow">MORE THAN A DICTIONARY</span>
          <h2>ことばの向こうに、暮らしがある。</h2>
        </div>
        <p>
          県名と意味だけで断定せず、どの地域で、誰が、どんな場面で使うのかを記録します。まだ確認中の内容も隠さず示す。それが、文化を丁寧に残すための出発点です。
        </p>
        <Link to="/editorial-policy">
          編集方針を読む <ArrowRight />
        </Link>
      </section>
      <section className="journey-grid" aria-label="ことばの地図でできること">
        <Link to="/prefectures">
          <MapPin />
          <small>01 / PLACE</small>
          <h2>土地から、たどる</h2>
          <p>
            県境だけでは捉えられない171の地域区分から、暮らしのことばを探します。
          </p>
          <ArrowRight />
        </Link>
        <Link to="/meanings">
          <Layers3 />
          <small>02 / COMPARE</small>
          <h2>同じ気持ちを、くらべる</h2>
          <p>
            「ありがとう」「とても」など、一つの意味が各地でどう響くかを横断します。
          </p>
          <ArrowRight />
        </Link>
        <Link to="/editorial-policy">
          <ShieldCheck />
          <small>03 / TRUST</small>
          <h2>根拠まで、確かめる</h2>
          <p>
            出典、話者確認、収録年、確認状態を、コンテンツの一部として伝えます。
          </p>
          <ArrowRight />
        </Link>
      </section>
      <section className="situation-section" aria-labelledby="situation-title">
        <div className="title">
          <div>
            <small>どんな声を思い出す？</small>
            <h2 id="situation-title">暮らしの場面から聞いてみる</h2>
          </div>
          <Link to="/conversations">会話をすべて見る →</Link>
        </div>
        <div className="situation-scroll">
          {[
            "家族",
            "友人",
            "学校",
            "恋愛",
            "食事",
            "買い物",
            "子どもへの声かけ",
            "おじいちゃん・おばあちゃん",
          ].map((scene) => (
            <Link to={`/search?q=${encodeURIComponent(scene)}`} key={scene}>
              <MessageCircle />
              <span>{scene}</span>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <Title
          eyebrow="ことばとの出会い"
          title="これ、方言だったの？"
          link="/search"
        />
        <div className="card-grid">
          {featured.map((d) => (
            <DialectCard key={d.id} d={d} />
          ))}
        </div>
      </section>
      <section className="warm">
        <Title
          eyebrow="会話から感じる"
          title="人の声が聞こえることば"
          link="/conversations"
        />
        <Link to={`/conversations/${talk.id}`} className="talk-card">
          <div className="video">
            <MessageCircle />
            <span>音声・字幕デモ</span>
          </div>
          <div>
            <span className="badge">
              {prefName(talk.prefectureId)}・{regionName(talk.regionId)}
            </span>
            <h3>{talk.title}</h3>
            <p>{talk.description}</p>
            {talk.lines.slice(0, 2).map((l, i) => (
              <blockquote key={i}>
                <b>{l.speaker}</b>「{l.dialectText}」
              </blockquote>
            ))}
          </div>
        </Link>
      </section>
      <section>
        <Title
          eyebrow="同じ気持ち、ちがう響き"
          title="日本中の言い方をくらべよう"
          link="/compare"
        />
        <div className="compare-preview">
          {repository
            .comparisons()
            .slice(0, 3)
            .map((x) => (
              <Link to="/compare" key={x.id}>
                <small>{x.prompt}</small>
                <strong>{x.entries.map((e) => e.phrase).join("　/　")}</strong>
              </Link>
            ))}
        </div>
      </section>
      <section className="contribute">
        <Sparkles />
        <div>
          <h2>あなたの家のことばも、地図のひとつ。</h2>
          <p>
            正解を決める投稿ではありません。地域・家庭・世代で使われる一つの例として、教えてください。
          </p>
        </div>
        <Link className="button" to="/submit">
          ことばを残す
        </Link>
      </section>
    </>
  );
}
function Title({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string;
  title: string;
  link: string;
}) {
  return (
    <div className="title">
      <div>
        <small>{eyebrow}</small>
        <h2>{title}</h2>
      </div>
      <Link to={link}>もっと見る →</Link>
    </div>
  );
}
function DialectCard({ d }: { d: Dialect }) {
  return (
    <Link className="card" to={`/dialects/${d.id}`}>
      <div>
        <span className="badge">
          {prefName(d.prefectureId)}・{regionName(d.regionId)}
        </span>
        <span className={`verification ${d.verificationStatus}`}>
          {verificationLabel(d.verificationStatus)}
        </span>
      </div>
      <h3>{d.phrase}</h3>
      <p className="translation">「{d.standardJapanese}」</p>
      <p>{d.description}</p>
      <div className="tags">
        {d.emotionTags.map((t) => (
          <span key={t}>#{t}</span>
        ))}
      </div>
      <small>地域・世代・確認状態つきの使用例</small>
    </Link>
  );
}
function Breadcrumb({ children }: { children: React.ReactNode }) {
  return (
    <div className="breadcrumb">
      <Link to="/">
        <ChevronLeft />
        ホーム
      </Link>
      <span>/</span>
      {children}
    </div>
  );
}
function Prefectures() {
  const all = repository.prefectures();
  const mapPrefectures = all.map((prefecture) => ({
    ...prefecture,
    dialectCount: repository.dialects({ prefectureId: prefecture.id }).length,
    regionCount: repository.regions(prefecture.id).length,
  }));
  return (
    <section>
      <div className="page-head">
        <span className="eyebrow">地域からめぐる</span>
        <h1>47都道府県のことば</h1>
        <p>
          同じ県の中にも、たくさんの地域と話し方があります。まずは土地から、ことばに会いにいきましょう。
        </p>
      </div>
      <JapanPrefectureMap prefectures={mapPrefectures} regions={repository.regions()} />
      <div className="prefecture-list-heading">
        <span className="eyebrow">一覧から探す</span>
        <h2>地方別の都道府県一覧</h2>
      </div>
      {[...new Set(all.map((p) => p.area))].map((area) => (
        <div className="pref-group" key={area}>
          <h2>{area}</h2>
          <div className="pref-grid">
            {all
              .filter((p) => p.area === area)
              .map((p) => (
                <Link
                  className={
                    repository.dialects({ prefectureId: p.id }).length
                      ? "active"
                      : ""
                  }
                  key={p.id}
                  to={`/prefectures/${p.id}`}
                >
                  <MapPin />
                  <b>{p.name}</b>
                  <small>
                    {repository.dialects({ prefectureId: p.id }).length}件・
                    {repository.regions(p.id).length}地域
                  </small>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
function Prefecture() {
  const { id } = useParams(),
    p = repository.prefectures().find((x) => x.id === id);
  if (!p) return <NotFound />;
  const rs = repository.regions(p.id),
    ds = repository.dialects({ prefectureId: p.id });
  if (shouldUsePrefectureDetailV2(p.id)) {
    return <PrefectureDetailV2 vm={createPrefectureDetailViewModel(p, rs, ds, repository.cultureItems({ prefectureId: p.id }))} />;
  }
  return (
    <section>
      <Breadcrumb>{p.area}</Breadcrumb>
      <div className="page-head">
        <span className="eyebrow">{p.area}</span>
        <h1>{p.name}のことば</h1>
        <p>
          {p.summary} 地域や世代による違いを、一つひとつの使用例から紹介します。
        </p>
      </div>
      {rs.length ? (
        <>
          <h2>地域から探す</h2>
          <div className="region-grid">
            {rs.map((r) => (
              <Link to={`/regions/${r.id}`} key={r.id}>
                <span>
                  ことば {repository.dialects({ regionId: r.id }).length}件
                </span>
                <h3>{r.name}</h3>
                <p>{r.description}</p>→
              </Link>
            ))}
          </div>
          <h2>この地域のことば</h2>
          <div className="card-grid">
            {ds.map((d) => (
              <DialectCard d={d} key={d.id} />
            ))}
          </div>
        </>
      ) : (
        <Empty text="この県のデモコンテンツは準備中です。あなたの地域のことばを教えてください。" />
      )}
    </section>
  );
}
function Region() {
  const { id } = useParams(),
    r = repository.regions().find((x) => x.id === id);
  const [age, setAge] = useState("すべて");
  if (!r) return <NotFound />;
  const prefecture = repository.prefectures().find((item) => item.id === r.prefectureId);
  if (!prefecture) return <NotFound />;
  if (shouldUseRegionDetailV2(r.id)) {
    const prefectureDialects = repository.dialects({ prefectureId: r.prefectureId });
    return <RegionDetailV2 vm={createRegionDetailViewModel(r, prefecture, repository.regions(r.prefectureId), repository.dialects({ regionId: r.id }), prefectureDialects, repository.cultureItems({ regionId: r.id }))} />;
  }
  const list = repository
    .dialects({ regionId: r.id })
    .filter((d) => age === "すべて" || d.ageGroups.includes(age));
  return (
    <section>
      <Breadcrumb>
        <Link to={`/prefectures/${r.prefectureId}`}>
          {prefName(r.prefectureId)}
        </Link>{" "}
        / {r.name}
      </Breadcrumb>
      <div className="page-head">
        <span className="eyebrow">{prefName(r.prefectureId)}の地域</span>
        <h1>{r.name}のことば</h1>
        <p>
          {r.description}{" "}
          ここで紹介するのは、地域・家庭・世代によって異なる使用例です。
        </p>
      </div>
      <div className="filters">
        <label>
          世代
          <select value={age} onChange={(e) => setAge(e.target.value)}>
            <option>すべて</option>
            <option>10〜30代</option>
            <option>40〜60代</option>
            <option>70代以上</option>
            <option>全年代</option>
          </select>
        </label>
      </div>
      <div className="card-grid">
        {list.map((d) => (
          <DialectCard key={d.id} d={d} />
        ))}
      </div>
      {!list.length && <Empty text="この条件に合う使用例はまだありません。" />}
    </section>
  );
}
function DialectDetail() {
  const { id } = useParams(),
    d = repository.dialect(id ?? "");
  const [, render] = useState(0);
  useEffect(() => {
    if (d) recentDialects.add(d.id);
  }, [d]);
  if (!d) return <NotFound />;
  if (USE_DIALECT_DETAIL_V2) return <DialectDetailV2 dialect={d} />;
  const fav = favorites.has(d.id),
    selected = reactionStore.get(d.id);
  const related = repository
    .dialects({ regionId: d.regionId })
    .filter((x) => x.id !== d.id);
  return (
    <section data-dialect-detail-version={import.meta.env.DEV ? "v1" : undefined}>
      <Breadcrumb>
        <Link to={`/prefectures/${d.prefectureId}`}>
          {prefName(d.prefectureId)}
        </Link>{" "}
        / {d.phrase}
      </Breadcrumb>
      <article className="detail">
        <div className="detail-main">
          <div>
            <span className="badge">
              {prefName(d.prefectureId)}・{regionName(d.regionId)}
            </span>
            <span className={`verification ${d.verificationStatus}`}>
              {verificationLabel(d.verificationStatus)}
            </span>
          </div>
          <h1>{d.phrase}</h1>
          <p className="reading">{d.reading}</p>
          <div className="meaning">
            <small>標準語では</small>
            <strong>{d.standardJapanese}</strong>
          </div>
          <h2>こんなふうに使います</h2>
          <div className="example">
            {d.exampleDialect && d.exampleStandard ? (
              <>
                <b>「{d.exampleDialect}」</b>
                <span>標準語：{d.exampleStandard}</span>
              </>
            ) : (
              <>
                <b>用例は確認中です</b>
                <span>出典で確認できる自然な会話例を収集中です。</span>
              </>
            )}
            {d.exampleDialect && !d.source?.evidenceScopes?.includes("example") && (
              <small>※ この例文は確認・収集中で、出典確認済みの用例ではありません。</small>
            )}
          </div>
          <h2>ことばのニュアンス</h2>
          <p>{d.description}</p>
          <section className="record-meta" aria-labelledby="record-meta-title">
            <div className="record-meta-head">
              <div>
                <small>ARCHIVE RECORD</small>
                <h2 id="record-meta-title">この記録について</h2>
              </div>
              <span className={`verification ${d.verificationStatus}`}>
                {verificationLabel(d.verificationStatus)}
              </span>
            </div>
            <dl>
              <div>
                <dt>使用地域</dt>
                <dd>
                  {prefName(d.prefectureId)}・{regionName(d.regionId)}
                  {d.municipality ? `・${d.municipality}` : ""}
                </dd>
              </div>
              <div>
                <dt>世代の目安</dt>
                <dd>{d.ageGroups.join("、")}</dd>
              </div>
              <div>
                <dt>使われる場面</dt>
                <dd>{d.usageContexts.join("、")}</dd>
              </div>
              <div>
                <dt>使用頻度</dt>
                <dd>{d.usageFrequency}</dd>
              </div>
              <div>
                <dt>収録・記録年</dt>
                <dd>{d.recordingYear ?? "未記録"}</dd>
              </div>
              <div>
                <dt>出典</dt>
                <dd>
                  {d.source?.url && d.source.title ? (
                    <a href={d.source.url} rel="noreferrer" target="_blank">
                      {d.source.title}
                      {d.source.organization ? `（${d.source.organization}）` : ""}
                    </a>
                  ) : (
                    (d.source?.title ?? d.source?.note ?? "出典確認前のデモ使用例")
                  )}
                </dd>
              </div>
              <div>
                <dt>出典で確認できた範囲</dt>
                <dd>
                  {[...(d.source?.evidenceScopes ?? []), ...(d.additionalSources ?? []).flatMap((source) => source.evidenceScopes ?? [])].length
                    ? [...new Set([...(d.source?.evidenceScopes ?? []), ...(d.additionalSources ?? []).flatMap((source) => source.evidenceScopes ?? [])])]
                        .map((scope) =>
                          ({
                            phrase: "語形",
                            reading: "読み",
                            meaning: "意味",
                            region: "地域",
                            example: "例文",
                            usage: "用法",
                            history: "来歴",
                          })[scope],
                        )
                        .join("、")
                    : "未確認"}
                </dd>
              </div>
              {(d.additionalSources ?? []).map((source) => (
                <div key={source.url ?? source.title}>
                  <dt>補助出典</dt>
                  <dd>
                    {source.url ? (
                      <a href={source.url} rel="noreferrer" target="_blank">
                        {source.title ?? source.url}
                        {source.organization ? `（${source.organization}）` : ""}
                      </a>
                    ) : (
                      source.title
                    )}
                  </dd>
                </div>
              ))}
              <div>
                <dt>最終更新</dt>
                <dd>{d.updatedAt}</dd>
              </div>
            </dl>
            <Link to="/editorial-policy">
              確認状態と編集方針について <ArrowRight />
            </Link>
          </section>
          {d.verificationStatus === "needs_review" && (
            <div className="review-notice">
              <b>確認中の候補です</b>
              <p>
                地域内での分布・世代・出典を確認中です。確認済み資料と同じ確度ではありません。
              </p>
            </div>
          )}
          <div className="notice">
            この表現は、{regionName(d.regionId)}
            での使用例です。同じ地域でも年代・家庭・話す相手によって異なることがあります。
          </div>
        </div>
        <aside className="side">
          {hasPublishableAudio(d) ? (
            <div className="audio-record">
              <b>
                <Volume2 /> このことばを聴く
              </b>
              <audio controls preload="none" src={d.audioUrl}>
                音声を再生できないブラウザです。
              </audio>
              <small>
                話者表示:{" "}
                {d.mediaRights?.speakerDisplay === "credited"
                  ? "本人希望の名前"
                  : d.mediaRights?.speakerDisplay === "age_and_region"
                    ? "年代・地域のみ"
                    : "匿名"}
              </small>
            </div>
          ) : (
            <div className="audio-pending">
              <Volume2 />
              <b>音声は準備中です</b>
              <p>収録・公開同意と撤回窓口を確認できた音声だけを掲載します。</p>
            </div>
          )}
          <button
            className="button secondary wide"
            onClick={() => {
              favorites.toggle(d.id);
              render((x) => x + 1);
            }}
          >
            <Heart fill={fav ? "currentColor" : "none"} />
            {fav ? "保存しました" : "お気に入りに保存"}
          </button>
          <Link
            className="correction-link"
            to={`/corrections?dialect=${encodeURIComponent(d.id)}`}
          >
            訂正・権利について知らせる
          </Link>
          <h3>あなたはこのことばを…</h3>
          {[
            ["use", "自分も使う"],
            ["heard", "聞いたことがある"],
            ["new", "初めて知った"],
          ].map(([v, l]) => (
            <button
              className={`reaction ${selected === v ? "selected" : ""}`}
              key={v}
              onClick={() => {
                reactionStore.set(d.id, v);
                render((x) => x + 1);
              }}
            >
              {l}
              <span>
                {d.reactions[v as keyof typeof d.reactions] +
                  (selected === v ? 1 : 0)}
              </span>
            </button>
          ))}
        </aside>
      </article>
      {related.length > 0 && (
        <>
          <h2>同じ地域のことば</h2>
          <div className="card-grid">
            {related.map((x) => (
              <DialectCard key={x.id} d={x} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function DialectDetailV2Preview() {
  const { id } = useParams();
  const dialect = repository.dialect(id ?? "");
  if (!dialect) return <NotFound />;
  return <DialectDetailV2 dialect={dialect} />;
}
function Conversations() {
  return (
    <section>
      <div className="page-head">
        <span className="eyebrow">暮らしの場面から</span>
        <h1>地域の会話</h1>
        <p>
          単語だけでは伝わらない間合いや温度を、短い会話から感じてみましょう。
        </p>
      </div>
      <div className="card-grid">
        {repository.conversations().map((c) => (
          <Link className="card" to={`/conversations/${c.id}`} key={c.id}>
            <span className="badge">
              {prefName(c.prefectureId)}・{regionName(c.regionId)}
            </span>
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <small>
              {c.usageContext}・話者 {c.speakers.length}人
            </small>
          </Link>
        ))}
      </div>
    </section>
  );
}
function ConversationDetail() {
  const { id } = useParams(),
    c = repository.conversation(id ?? "");
  const [standard, setStandard] = useState(true);
  if (!c) return <NotFound />;
  return (
    <section>
      <Breadcrumb>
        <Link to="/conversations">会話</Link> / {c.title}
      </Breadcrumb>
      <div className="page-head">
        <span className="badge">
          {prefName(c.prefectureId)}・{regionName(c.regionId)}
        </span>
        <h1>{c.title}</h1>
        <p>{c.description}</p>
      </div>
      <div className="subtitle-toggle">
        <button
          className={!standard ? "selected" : ""}
          onClick={() => setStandard(false)}
        >
          方言だけ
        </button>
        <button
          className={standard ? "selected" : ""}
          onClick={() => setStandard(true)}
        >
          標準語訳つき
        </button>
      </div>
      <div className="dialogue">
        {c.lines.map((l, i) => (
          <div className={i % 2 ? "right" : ""} key={i}>
            <small>{l.speaker}</small>
            <p>
              {l.dialectId ? (
                <Link to={`/dialects/${l.dialectId}`}>{l.dialectText}</Link>
              ) : (
                l.dialectText
              )}
            </p>
            {standard && <span>{l.standardText}</span>}
          </div>
        ))}
      </div>
      <div className="notice">
        字幕情報を添えたデモ会話です。音声・動画は権利と同意を確認した素材のみ掲載する方針です。
      </div>
      <p className="correction-action">
        <Link to={`/corrections?conversation=${encodeURIComponent(c.id)}`}>
          この会話の訂正・権利について知らせる
        </Link>
      </p>
    </section>
  );
}
function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "",
    pref = params.get("pref") ?? "",
    region = params.get("region") ?? "",
    age = params.get("age") ?? "",
    context = params.get("context") ?? "",
    status = params.get("status") ?? "";
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };
  const all = repository.dialects();
  const contexts = [...new Set(all.flatMap((item) => item.usageContexts))].sort(
    (a, b) => a.localeCompare(b, "ja"),
  );
  const result = repository.dialects({
    q,
    prefectureId: pref,
    regionId: region,
    ageGroup: age,
    context,
    verificationStatus: status
      ? (status as Dialect["verificationStatus"])
      : undefined,
  });
  return (
    <section>
      <div className="page-head">
        <span className="eyebrow">これ、方言だったの？</span>
        <h1>ことばを探す</h1>
        <p>方言・読み・標準語の意味から、地域の使用例を探せます。</p>
      </div>
      <div className="searchbox archive-searchbox">
        <Search />
        <input
          aria-label="検索することば"
          placeholder="例：なおす、かわいい、ほんま"
          value={q}
          onChange={(e) => setFilter("q", e.target.value)}
        />
        <select
          aria-label="都道府県"
          value={pref}
          onChange={(e) => {
            const next = new URLSearchParams(params);
            if (e.target.value) next.set("pref", e.target.value);
            else next.delete("pref");
            next.delete("region");
            setParams(next, { replace: true });
          }}
        >
          <option value="">全国</option>
          {repository.prefectures().map((p) => (
            <option value={p.id} key={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="facet-bar" aria-label="検索条件">
        {pref && <label>
          地域
          <select value={region} onChange={(e) => setFilter("region", e.target.value)}>
            <option value="">すべて</option>
            {repository.regions(pref).map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </label>}
        <label>
          世代
          <select
            value={age}
            onChange={(e) => setFilter("age", e.target.value)}
          >
            <option value="">すべて</option>
            <option>10〜30代</option>
            <option>40〜60代</option>
            <option>70代以上</option>
            <option>全年代</option>
          </select>
        </label>
        <label>
          暮らしの場面
          <select
            value={context}
            onChange={(e) => setFilter("context", e.target.value)}
          >
            <option value="">すべて</option>
            {context && !contexts.includes(context) && (
              <option>{context}</option>
            )}
            {contexts.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          確認状態
          <select
            value={status}
            onChange={(e) => setFilter("status", e.target.value)}
          >
            <option value="">すべて</option>
            <option value="needs_review">要確認候補</option>
            <option value="demo">デモ使用例</option>
            <option value="community_confirmed">地域確認</option>
            <option value="reference_confirmed">参照確認</option>
          </select>
        </label>
        {(q || pref || region || age || context || status) && (
          <button
            className="text-button"
            onClick={() => setParams({}, { replace: true })}
          >
            条件をクリア
          </button>
        )}
      </div>
      <div className="result-summary">
        <p>
          <strong>{result.length}</strong>件の使用例
        </p>
        <span>全{all.length}件から検索・絞り込み</span>
      </div>
      <div className="card-grid">
        {result.map((d) => (
          <DialectCard key={d.id} d={d} />
        ))}
      </div>
      {!result.length && (
        <Empty text="まだ掲載されていないことばです。あなたの地域での使い方を投稿してみませんか？" />
      )}
    </section>
  );
}
function Compare() {
  return (
    <section>
      <div className="page-head">
        <span className="eyebrow">同じ気持ち、ちがう響き</span>
        <h1>全国ことばくらべ</h1>
        <p>
          同じ場面のひとことを、福岡・大阪・青森の使用例で比べてみましょう。
        </p>
      </div>
      <div className="comparison-list">
        {repository.comparisons().map((x) => (
          <article key={x.id}>
            <h2>「{x.prompt}」</h2>
            <div>
              {x.entries.map((e) => (
                <Link
                  to={`/prefectures/${e.prefectureId}`}
                  key={e.prefectureId}
                >
                  <small>{prefName(e.prefectureId)}</small>
                  <strong>{e.phrase}</strong>
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
function Quiz() {
  const qs = repository.quizzes();
  const [index, setIndex] = useState(0),
    [chosen, setChosen] = useState<number>(),
    [score, setScore] = useState(0);
  if (index >= qs.length)
    return (
      <section className="quiz-result">
        <Sparkles />
        <h1>
          {qs.length}問中 {score}問正解！
        </h1>
        <p>ことばの違いを楽しんでくれて、ありがとうございます。</p>
        <button
          className="button"
          onClick={() => {
            setIndex(0);
            setScore(0);
            setChosen(undefined);
          }}
        >
          もう一度あそぶ
        </button>
      </section>
    );
  const q = qs[index];
  return (
    <section className="quiz">
      <span className="eyebrow">
        ことばクイズ　{index + 1} / {qs.length}
      </span>
      <div className="progress">
        <i style={{ width: `${(index / qs.length) * 100}%` }} />
      </div>
      <h1>{q.question}</h1>
      <div className="choices">
        {q.choices.map((c, i) => (
          <button
            disabled={chosen !== undefined}
            className={
              chosen === undefined
                ? ""
                : i === q.answer
                  ? "correct"
                  : i === chosen
                    ? "wrong"
                    : ""
            }
            onClick={() => {
              setChosen(i);
              if (i === q.answer) setScore((s) => s + 1);
            }}
            key={c}
          >
            <span>{"ABCD"[i]}</span>
            {c}
          </button>
        ))}
      </div>
      {chosen !== undefined && (
        <div className="answer">
          <b>{chosen === q.answer ? "正解！" : "おしい！"}</b>
          <p>{q.explanation}</p>
          <button
            className="button"
            onClick={() => {
              setIndex((x) => x + 1);
              setChosen(undefined);
            }}
          >
            次の問題へ
          </button>
        </div>
      )}
    </section>
  );
}
function Favorites() {
  const [, render] = useState(0),
    items = repository.dialects().filter((d) => favorites.has(d.id));
  return (
    <section>
      <div className="page-head">
        <span className="eyebrow">あとでもう一度</span>
        <h1>お気に入り</h1>
        <p>気になったことばを、この端末に保存しています。</p>
      </div>
      {items.length ? (
        <div className="card-grid">
          {items.map((d) => (
            <div key={d.id}>
              <DialectCard d={d} />
              <button
                className="text-button"
                onClick={() => {
                  favorites.toggle(d.id);
                  render((x) => x + 1);
                }}
              >
                保存を解除
              </button>
            </div>
          ))}
        </div>
      ) : (
        <Empty text="まだ保存したことばはありません。ことばの詳細から♡を押してみましょう。" />
      )}
    </section>
  );
}
function Submit() {
  const [pref, setPref] = useState(""),
    [done, setDone] = useState(false),
    [preview, setPreview] = useState<SubmissionInput | null>(null),
    [errors, setErrors] = useState<string[]>([]);
  if (done)
    return (
      <section className="quiz-result">
        <Sparkles />
        <h1>ことばを受け取りました</h1>
        <p>
          投稿は端末内のデモ受付として扱われ、公開はされません。地域のことばを残してくださり、ありがとうございます。
        </p>
        <Link className="button" to="/">
          ホームへ戻る
        </Link>
      </section>
    );
  if (preview)
    return (
      <section>
        <div className="page-head">
          <span className="eyebrow">送信前の確認</span>
          <h1>この「使用例」を残しますか？</h1>
          <p>
            正解を登録するのではなく、あなたが知っている一つの記憶として受け取ります。
          </p>
        </div>
        <div className="submission-preview">
          <span className="badge">{prefName(preview.prefectureId)}</span>
          <h2>{preview.phrase}</h2>
          <p className="translation">
            標準語では「{preview.standardJapanese}」
          </p>
          <dl>
            <div>
              <dt>地域</dt>
              <dd>{regionName(preview.regionId ?? "")}</dd>
            </div>
            <div>
              <dt>使う場面</dt>
              <dd>{preview.usageContext}</dd>
            </div>
            <div>
              <dt>例文・記憶</dt>
              <dd>{preview.example || "記載なし"}</dd>
            </div>
          </dl>
          <div className="actions">
            <button
              className="button secondary"
              onClick={() => setPreview(null)}
            >
              入力に戻る
            </button>
            <button
              className="button"
              onClick={() => {
                submissionStore.save(createSubmission(preview));
                setDone(true);
              }}
            >
              この内容で送る
            </button>
          </div>
        </div>
      </section>
    );
  return (
    <section>
      <div className="page-head">
        <span className="eyebrow">あなたの記憶を、未来へ</span>
        <h1>地域のことばを教えてください</h1>
        <p>
          「正解」を決めるのではなく、あなたの地域・家庭・世代で使われている一つの例としてお聞きします。
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = Object.fromEntries(new FormData(e.currentTarget));
          const parsed = submissionSchema.safeParse({
            type: data.type,
            prefectureId: data.prefectureId,
            regionId: data.regionId,
            phrase: data.phrase,
            standardJapanese: data.standardJapanese,
            example: data.example,
            usageContext: data.usageContext,
            ageGroup: data.ageGroup,
            learnedFrom: data.learnedFrom,
            stillUsed: data.stillUsed === "yes",
            recordingConsent: false,
            rightsOwnershipConfirmed: data.ownership === "on",
            thirdPartyPrivacyConfirmed: data.privacy === "on",
            publicationConsent: data.publication === "on",
            consentVersion: "submission-consent-v1",
          });
          if (!parsed.success) {
            setErrors(parsed.error.issues.map((x) => x.message));
            return;
          }
          setPreview(parsed.data);
        }}
      >
        <label>
          投稿の種類
          <select name="type">
            <option value="dialect">方言・ことば</option>
            <option value="conversation">会話の一場面</option>
          </select>
        </label>
        <div className="form-row">
          <label>
            都道府県 <b>必須</b>
            <select
              name="prefectureId"
              value={pref}
              onChange={(e) => {
                setPref(e.target.value);
                const regionSelect = e.currentTarget.form?.elements.namedItem(
                  "regionId",
                ) as HTMLSelectElement | null;
                if (regionSelect) regionSelect.value = "";
              }}
            >
              <option value="">選択してください</option>
              {repository.prefectures().map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            地域 <b>必須</b>
            <select name="regionId" disabled={!pref}>
              <option value="">
                {pref ? "選択してください" : "先に都道府県を選択"}
              </option>
              {(pref ? repository.regions(pref) : []).map((r) => (
                <option value={r.id} key={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          ことば <b>必須</b>
          <input name="phrase" placeholder="例：なんしようと？" />
        </label>
        <label>
          標準語ではどんな意味？ <b>必須</b>
          <input name="standardJapanese" placeholder="例：何をしているの？" />
        </label>
        <label>
          使い方・例文
          <textarea
            name="example"
            placeholder="どんな相手に、どんな場面で使いますか？"
          />
        </label>
        <label>
          使う場面
          <select name="usageContext">
            <option>日常会話</option>
            <option>家庭</option>
            <option>仕事</option>
            <option>食事</option>
            <option>お祭り・行事</option>
          </select>
        </label>
        <div className="form-row">
          <label>
            主に使う世代
            <select name="ageGroup">
              <option value="">わからない</option>
              <option>10〜30代</option>
              <option>40〜60代</option>
              <option>70代以上</option>
              <option>全年代</option>
            </select>
          </label>
          <label>
            今も使いますか？
            <select name="stillUsed">
              <option value="yes">今も使う</option>
              <option value="no">昔・記憶の中で使う</option>
            </select>
          </label>
        </div>
        <label>
          誰から知りましたか？
          <input
            name="learnedFrom"
            placeholder="例：祖母、地域の友人、自分の家庭"
          />
        </label>
        <div className="upload">
          <Volume2 />
          <b>音声・動画（準備中）</b>
          <span>保存先に接続後、安全なアップロードを提供します。</span>
        </div>
        <fieldset className="consent-fieldset">
          <legend>
            投稿前の確認 <b>すべて必須</b>
          </legend>
          <label className="check">
            <input type="checkbox" name="ownership" />
            この文章は自分の経験・記憶にもとづき、自分が提供できる内容です。
          </label>
          <label className="check">
            <input type="checkbox" name="privacy" />
            第三者の氏名、連絡先、顔、声など、許可のない個人情報を含めていません。
          </label>
          <label className="check">
            <input type="checkbox" name="publication" />
            審査のために保存され、確認状態を付けて公開される可能性があることに同意します。
          </label>
          <p>
            音声・映像の公開同意は別途取得します。この同意だけで音声・映像を公開したり、商用利用したりしません。
          </p>
        </fieldset>
        {errors.length > 0 && (
          <div className="errors" role="alert">
            {errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </div>
        )}
        <button className="button" type="submit">
          内容を確認して送る
        </button>
      </form>
    </section>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      <BookOpen />
      <h2>まだ、ここには余白があります</h2>
      <p>{text}</p>
      <Link className="button secondary" to="/submit">
        ことばを教える
      </Link>
    </div>
  );
}
function NotFound() {
  return (
    <Empty text="お探しのページは見つかりませんでした。地域の一覧から、ことばを探してみてください。" />
  );
}
export default Shell;
