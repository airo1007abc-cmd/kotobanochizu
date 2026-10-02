import {
  ArrowRight,
  Gift,
  House,
  Snowflake,
  Soup,
  ToyBrick,
  DoorOpen,
} from "lucide-react";
import { Link } from "react-router-dom";
import { homeScenes, type SceneIllustration } from "./homeDiscovery";

function JourneyIllustration({
  kind,
}: {
  kind: "place" | "compare" | "stories";
}) {
  return (
    <svg
      className="journey-illustration"
      viewBox="0 0 240 148"
      fill="none"
      aria-hidden="true"
    >
      <ellipse
        cx="120"
        cy="130"
        rx="87"
        ry="7"
        fill="currentColor"
        opacity=".06"
      />
      {kind === "place" && (
        <>
          <circle cx="169" cy="36" r="21" fill="#d9a56e" opacity=".4" />
          <path
            d="m39 49 52-15 55 18 53-16v81l-53 15-55-18-52 15Z"
            fill="#fffaf0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M91 34v80m55-62v80"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity=".35"
          />
          <path
            d="M51 99c19-34 36 10 63-14s38 7 72-29"
            stroke="#b94e2d"
            strokeWidth="2"
            strokeDasharray="4 5"
            strokeLinecap="round"
          />
          <path
            d="M139 36a19 19 0 0 0-38 0c0 16 19 30 19 30s19-14 19-30Z"
            fill="#315c49"
          />
          <circle cx="120" cy="35" r="6" fill="#fffaf0" />
          <path
            d="m61 61 6-8 6 8m101 37 6-8 6 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {kind === "compare" && (
        <>
          <circle cx="62" cy="96" r="29" fill="#d9a56e" opacity=".25" />
          <path
            d="M47 28h111a14 14 0 0 1 14 14v45a14 14 0 0 1-14 14H93l-24 18v-18H47a14 14 0 0 1-14-14V42a14 14 0 0 1 14-14Z"
            fill="#fffaf0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M132 72h61a13 13 0 0 1 13 13v23a13 13 0 0 1-13 13h-8v14l-20-14h-33a13 13 0 0 1-13-13V85a13 13 0 0 1 13-13Z"
            fill="#315c49"
          />
          <path
            d="M58 51h89M58 64h61M58 77h39"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".5"
          />
          <path
            d="M141 93h43m-43 12h28"
            stroke="#fffaf0"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="m190 33 4-11m8 20 11-3"
            stroke="#b94e2d"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
      {kind === "stories" && (
        <>
          <circle cx="167" cy="43" r="26" fill="#d9a56e" opacity=".3" />
          <path
            d="M40 54c31-14 52-12 80 2 28-14 49-16 80-2v75c-31-14-52-12-80 2-28-14-49-16-80-2Z"
            fill="#fffaf0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M120 56v75M55 100l49 7M55 113l29 4m52-12 48-6m-48 18 32-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity=".4"
          />
          <path d="m60 64 21-17 21 17v27H60Z" fill="#315c49" />
          <path d="M77 91V77h9v14" stroke="#fffaf0" strokeWidth="2" />
          <path
            d="M148 70h24c0 14-6 21-12 21s-12-7-12-21Zm24 3h5a6 6 0 0 1 0 12h-8"
            stroke="#b94e2d"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M155 61c-6-5 4-8 0-13m10 13c-6-5 4-8 0-13"
            stroke="#b94e2d"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

const sceneIcons = {
  home: House,
  food: Soup,
  visit: DoorOpen,
  winter: Snowflake,
  play: ToyBrick,
  gift: Gift,
};
function ScenePicture({ kind }: { kind: SceneIllustration }) {
  const Icon = sceneIcons[kind];
  return (
    <span className={`scene-picture scene-picture-${kind}`} aria-hidden="true">
      <Icon strokeWidth={1.35} />
      <span className="scene-spark">✦</span>
    </span>
  );
}

export function HomeDiscovery() {
  return (
    <>
      <section className="home-discovery" aria-labelledby="discovery-title">
        <div className="title">
          <div>
            <small>ことばの入口</small>
            <h2 id="discovery-title">今日は、どこから？</h2>
          </div>
          <p>気になるところから、ひとめぐり。</p>
        </div>
        <div className="journey-grid">
          {(
            [
              {
                kind: "place",
                path: "/prefectures",
                kicker: "土地から",
                title: "土地をめぐる",
                description: "ふるさとや、気になる町から。",
                action: "地域を選ぶ",
              },
              {
                kind: "compare",
                path: "/meanings",
                kicker: "意味から",
                title: "ことばをくらべる",
                description: "同じ意味も、土地が変われば。",
                action: "言い方をくらべる",
              },
              {
                kind: "stories",
                path: "/conversations",
                kicker: "暮らしから",
                title: "暮らしをのぞく",
                description: "食卓、遊び、季節のひとこま。",
                action: "読み物をひらく",
              },
            ] as const
          ).map((journey) => (
            <Link
              className={`journey-card journey-card-${journey.kind}`}
              to={journey.path}
              key={journey.path}
            >
              <span className="journey-kicker">{journey.kicker}</span>
              <JourneyIllustration kind={journey.kind} />
              <h3>{journey.title}</h3>
              <p>{journey.description}</p>
              <span className="journey-action">
                {journey.action}
                <ArrowRight size={18} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      {homeScenes.length > 0 && (
        <section
          className="situation-section"
          aria-labelledby="situation-title"
        >
          <div className="title">
            <div>
              <small>あの場面の、あのことば</small>
              <h2 id="situation-title">暮らしの場面から</h2>
            </div>
            <Link to="/conversations">
              読み物をすべて見る <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="situation-grid">
            {homeScenes.map((scene) => (
              <Link className="scene-card" to={scene.path} key={scene.slug}>
                <ScenePicture kind={scene.illustration} />
                <div className="scene-copy">
                  <small>{scene.place}</small>
                  <h3>{scene.title}</h3>
                  <p>{scene.detail}</p>
                </div>
                <span className="scene-meta">
                  用例を{scene.count}件読む{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
