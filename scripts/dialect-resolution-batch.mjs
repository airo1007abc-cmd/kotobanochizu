import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const dialects = fs.readdirSync(path.join(root, "src/data/dialects"))
  .filter((file) => file.endsWith(".json"))
  .flatMap((file) => read(`src/data/dialects/${file}`));
const byId = new Map(dialects.map((item) => [item.id, item]));
const ids = ["jp-16-toyama-001", "jp-24-mie-001", "jp-47-okinawa-001", "jp-35-yamaguchi-002"];
const snapshots = Object.fromEntries(ids.map((id) => {
  const d = byId.get(id);
  return [id, {
    id:d.id, word:d.phrase, meaning:d.standardJapanese, description:d.description,
    region:d.regionName, municipality:d.municipality, verificationStatus:d.verificationStatus,
    indexStatus:"indexable", sourceTitle:d.sourceTitle, sourceUrl:d.sourceUrl
  }];
}));

const pages = [
  {
    ...snapshots["jp-16-toyama-001"],
    decision:"APPROVE_REFINE", confidence:"high", exactFormMatch:"exact",
    changeType:"meaning_refinement",
    proposedChanges:[
      {field:"standardJapanese",before:snapshots["jp-16-toyama-001"].meaning,after:"新鮮な・生きがいい／元気で活力がある",reason:"AND表現を避け、一次資料で確認できる鮮度用法と活力用法を分ける。"},
      {field:"description",before:snapshots["jp-16-toyama-001"].description,after:"富山の「きときと」は、魚介などが新鮮で生きがいい状態を表します。富山県資料には、人や心身が元気で活力のある状態を表す用法もあります。行政の名称や企画では「輝かしい未来」などのイメージを重ねた例がありますが、これは基本語義と区別して扱います。",reason:"食物、人・心身、名称・広告上の比喩を資料の強さに応じて区別する。"}
    ],
    evidence:[
      {title:"すしのまち とやま",organization:"富山市",year:"2024公開",url:"https://www.city.toyama.lg.jp/bunka/kanko/1015608.html",sourceTier:1,exactFormMatch:"exact",supports:["新鮮な","ピチピチとした","魚介","コピー上のイメージ"]},
      {title:"みんなで参加しよう Q&A質問コーナー",organization:"富山県",year:null,url:"https://www.pref.toyama.jp/1021/kensei/kenseiunei/kensei/naruhodo/qa.html",sourceTier:1,exactFormMatch:"exact",supports:["新鮮な","いきいきした"]},
      {title:"元気とやまマスコット きときと君",organization:"富山県",year:"2026更新",url:"https://www.pref.toyama.jp/1021/kensei/kouhou/public/kitokitokun.html",sourceTier:1,exactFormMatch:"exact",supports:["新鮮","生きがいい","心と体"]},
      {title:"生涯スポーツ推進の手引き・スポレクとやま2010ハンドブック",organization:"富山県関係スポーツ機関",year:"2010",url:"https://www.sportsnet.pref.toyama.jp/contents/sporec_hand/2-1.html",sourceTier:1,exactFormMatch:"exact",supports:["新鮮","元気","活力"]},
      {title:"中学校国語科における言語単元の開発研究",organization:"富山大学",year:"2013",url:"https://cerp.u-toyama.ac.jp/file/bulletin/bulletin2013.pdf",sourceTier:2,exactFormMatch:"exact",supports:["新鮮な","ぴちぴち","活きがいい","元気な"]}
    ],
    unresolved:["呉東という現行地域区分の直接的な分布根拠","活力用法の現在頻度"]
  },
  {
    ...snapshots["jp-24-mie-001"],
    decision:"KEEP", confidence:"high", exactFormMatch:"exact",
    changeType:"verification", proposedChanges:[],
    evidence:[
      {title:"みえの仕事さがしch. 県内企業インタビュー",organization:"三重県",year:"2024",url:"https://www.shigotosagashi.pref.mie.lg.jp/interview_post/%E6%B8%85%E7%94%B0%E8%BB%8C%E9%81%93%E5%B7%A5%E6%A5%AD%E6%A0%AA%E5%BC%8F%E4%BC%9A%E7%A4%BE%EF%BC%88%E5%B7%9D%E8%B6%8A%E7%94%BA%EF%BC%89%E3%80%80%E3%80%80%E6%B5%A6%E6%A9%8B-%E5%88%A9%E5%85%B8/",sourceTier:1,exactFormMatch:"exact",supports:["川越町所在企業のインタビュー文脈","三重で3日後を指す用法"]},
      {title:"三重の方言関係資料",organization:"三重県立図書館",year:null,url:"https://www.library.pref.mie.lg.jp/collection/folder/post-1.html",sourceTier:1,exactFormMatch:"uncertain",supports:["川越町史の方言章","川越町が北勢資料区分に属すること"]}
    ],
    reason:"municipalityは『川越町（使用例）』と限定済みで、公的な川越町所在企業記事に当該用法がある。北勢は実用地域区分として整合するが、北勢全域の言語分布を断定しない現行方針を維持する。",
    unresolved:["川越町生育話者による用例ではない","北勢全域の使用率・別形分布"]
  },
  {
    ...snapshots["jp-47-okinawa-001"],
    decision:"SPLIT_CONTEXT", confidence:"high", exactFormMatch:"exact",
    changeType:"region_refinement",
    proposedChanges:[{field:"description",before:snapshots["jp-47-okinawa-001"].description,after:"首里・中南部の地域語としての根拠と、海洋博以降に歓迎表現として広域的に認知・使用された経緯を別段落・別claimで説明する。region自体は沖縄本島中南部を維持する。",reason:"伝統的地域語の分布と、観光・行政による現代の広域使用を混同しない。"}],
    evidence:[
      {title:"しまくとぅば教室",organization:"沖縄県",year:"2024更新",url:"https://www.pref.okinawa.lg.jp/kyoiku/kodomo/1002688/1002689/1002690.html",sourceTier:1,exactFormMatch:"exact",supports:["首里のことば","いらっしゃい","音声"]},
      {title:"しまくとぅば読本 小学生",organization:"沖縄県",year:null,url:"https://www.pref.okinawa.lg.jp/_res/projects/default_project/_page_/001/011/776/tokuhonsyoup18-51.pdf",sourceTier:1,exactFormMatch:"variant",supports:["中南部の買い物会話","めんそーれー"]},
      {title:"沖縄県議会会議録",organization:"沖縄県議会",year:"1986相当",url:"https://www2.pref.okinawa.jp/oki/Gikairep1.nsf/481e05e7edaca1db49256f540004c033/424a296377bce4ab4925719200247dae?Click=&OpenDocument=",sourceTier:1,exactFormMatch:"variant",supports:["海洋博時の県民の合い言葉","県広報・那覇市・空港での広域使用","表記差"]}
    ],
    unresolved:["中南部内の詳細な伝統分布","現代の日常会話頻度"]
  },
  {
    ...snapshots["jp-35-yamaguchi-002"],
    decision:"REFINE_REGION", confidence:"high", exactFormMatch:"exact",
    changeType:"correction",
    proposedChanges:[{field:"regionName",before:snapshots["jp-35-yamaguchi-002"].region,after:"周南地方",reason:"主要資料は『山口弁（周南地方）辞典』の増補改訂版であり、現行municipalityとも一致する。県東部（岩国・柳井など）という範囲は当該見出しの直接根拠になっていない。"}],
    evidence:[
      {title:"てれんこぽれんこ山口弁",organization:"阿部啓治編・萩市立図書館公開",year:"2024",url:"https://hagilib.city.hagi.lg.jp/hagilib-archive/image/863.pdf",sourceTier:3,exactFormMatch:"exact",supports:["あなた","周南地方辞典の増補改訂版","用例","同形別義への別項参照"]},
      {title:"山口弁（周南地方）辞典 書誌説明",organization:"萩市立図書館公開資料内書誌",year:"2016",url:"https://hagilib.city.hagi.lg.jp/hagilib-archive/image/863.pdf",sourceTier:3,exactFormMatch:"exact",supports:["資料対象が周南地方","1950～60年代生まれのメンバーが使用した語彙"]}
    ],
    entrySplitReview:{decision:"HOLD",changeType:"entry_split_review",candidateMeaning:"飽きた",reason:"資料自身が『あいた』項目へ記載した別語として相互参照しているため、現在の二人称ページへ詰め込まない。別レコード化には該当項目の語形・意味・例文・地域を追加確認する。"},
    unresolved:["女性形『あぇーた』の独立分布","編者観察による世代差の外部追認","同形別義の別レコード要件"]
  }
];

const output = {
  generatedAt:"2026-09-04", status:"research_and_proposals_only", productionDataChanged:false,
  policy:"reports/dialect-editorial-policy.md",
  summary:{pages:4,approveCandidates:3,keep:1,holdClaims:1,corrections:1},
  pages,
  safeguards:["high confidence + exact match + current record correspondence only","no production dialect writes","modern broad recognition is not treated as traditional distribution"]
};
fs.writeFileSync(path.join(root,"reports/dialect-resolution-batch.json"),JSON.stringify(output,null,2)+"\n");

const lines=["# 方言 Resolution Batch","","本番方言データ変更: **なし**","",...pages.flatMap(p=>[
  `## ${p.word} — ${p.decision}`,
  "",
  `- confidence: ${p.confidence}`,
  `- exactFormMatch: ${p.exactFormMatch}`,
  `- changeType: ${p.changeType}`,
  ...(p.proposedChanges||[]).flatMap(c=>["",`### ${c.field}`,`- before: ${c.before}`,`- after: ${c.after}`,`- reason: ${c.reason}`]),
  ...(p.reason?["",p.reason]:[]),
  ...(p.entrySplitReview?["",`別義: **${p.entrySplitReview.decision}** — ${p.entrySplitReview.reason}`]:[]),
  "","### Evidence",...p.evidence.map(e=>`- [${e.title}](${e.url}) — ${e.organization} / Tier ${e.sourceTier} / ${e.exactFormMatch} / ${e.supports.join("、")}`),
  "","### 未解決",...p.unresolved.map(x=>`- ${x}`),""
])];
fs.writeFileSync(path.join(root,"reports/dialect-resolution-batch.md"),lines.join("\n")+"\n");

const priority = read("reports/dialect-content-priority.json").records;
const excluded = new Set([
  ...ids,
  "jp-46-kagoshima-022","jp-46-kagoshima-049","jp-06-yamagata-001","jp-05-akita-001","jp-05-akita-002",
  ...read("reports/dialect-research-batch-2-candidates.json").candidates.map(x=>x.id)
]);
const scored = priority.filter(r=>r.priority==="P1"&&r.indexStatus==="indexable"&&!excluded.has(r.id)).map(r=>{
  const descriptionGap = r.description.length<100?25:r.description.length<140?18:8;
  const sourcePotential = r.sourceCount>0?20:6;
  const ambiguity = Math.min(20,r.issues.length*6);
  const uniquePotential = r.hasExample?12:18;
  const score = Math.min(100,25+descriptionGap+sourcePotential+ambiguity+uniquePotential);
  return {...r,score};
}).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
const selected=[]; const prefectureCount=new Map();
for(const maxPerPrefecture of [1,2,3]){
  for(const r of scored){
    if(selected.length>=30) break;
    if(selected.some(x=>x.id===r.id)) continue;
    if((prefectureCount.get(r.prefecture)||0)>=maxPerPrefecture) continue;
    selected.push(r); prefectureCount.set(r.prefecture,(prefectureCount.get(r.prefecture)||0)+1);
  }
}
const candidates = selected.map(r=>({
  id:r.id,word:r.word,prefecture:r.prefecture,
  currentQuality:r.qualityGrade,
  currentIssues:r.issues,
  researchPotential:r.sourceCount>0?"high":"medium",
  editorialImpact:r.score,
  selectionReason:`indexable/P1。説明${r.description.length}文字、出典${r.sourceCount}件。既存の${r.issues.join("・")}をclaim単位で確認する余地がある。`
}));
const searchConsoleFiles = fs.readdirSync(root,{recursive:true}).map(String).filter(f=>/search.?console|gsc|impression|clicks|average.?position/i.test(f)&&!f.startsWith("node_modules")&&!f.startsWith("dist")&&!f.startsWith(".chrome-audit"));
fs.writeFileSync(path.join(root,"reports/dialect-research-batch-3-candidates.json"),JSON.stringify({
  generatedAt:"2026-09-04",status:"selection_only_research_not_started",count:candidates.length,
  scoring:{indexable:25,descriptionGap:"8–25",trustedSourcePotential:"6–20",ambiguity:"最大20",uniqueInformationPotential:"12–18"},
  searchConsoleDataUsed:searchConsoleFiles.length>0,searchConsoleFiles,
  candidates
},null,2)+"\n");
console.log(JSON.stringify({resolution:output.summary,batch3:candidates.length,searchConsoleFiles},null,2));
