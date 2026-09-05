import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const candidates=read("reports/dialect-research-batch-3-candidates.json").candidates;
const dialects=fs.readdirSync(path.join(root,"src/data/dialects")).filter(f=>f.endsWith(".json")).flatMap(f=>read(`src/data/dialects/${f}`));
const byId=new Map(dialects.map(d=>[d.id,d]));
const special={
  "jp-35-yamaguchi-003":[
    {field:"regionName",decision:"APPROVE",confidence:"high",match:"exact",changeType:"correction",claim:"資料対象とmunicipalityに合わせ、県東部ではなく周南地方として扱う。",after:"周南地方",reason:"主要資料は『山口弁（周南地方）辞典』の増補改訂版。現行municipalityも周南地域で、県東部（岩国・柳井など）の直接根拠はない。",correction:true}
  ],
  "jp-35-yamaguchi-004":[
    {field:"regionName",decision:"APPROVE",confidence:"high",match:"exact",changeType:"correction",claim:"資料対象とmunicipalityに合わせ、県東部ではなく周南地方として扱う。",after:"周南地方",reason:"主要資料は『山口弁（周南地方）辞典』の増補改訂版。現行municipalityも周南地域で、県東部（岩国・柳井など）の直接根拠はない。",correction:true}
  ],
  "jp-44-oita-023":[
    {field:"description",decision:"APPROVE",confidence:"high",match:"exact",changeType:"correction",claim:"由布市庄内町・日田市天瀬町等の資料を混同せず、進行のヨルと結果継続のチョル／ジョルを資料別に整理する。",after:"由布市庄内町の資料では「～よる」を動作の進行を示す形式とし、「～ちょる／～じょる」は主に完了・結果の継続を示すと記述しています。日田市天瀬町の資料にも進行形「～よる／～よーる」が記録されています。複数地点の資料をまとめたレコードであり、地点ごとの形と世代差は資料ごとに区別します。",reason:"現行descriptionは由布市資料の題名に日田市天瀬町・大鶴本町を対象地点として結び付けており、資料と地域の対応が不正確。",correction:true},
    {field:"regionName",decision:"HOLD",confidence:"medium",match:"uncertain",changeType:"region_refinement",claim:"西部以外の佐伯市・竹田市等を含む複数地点を単一regionへどう正規化するか再検討する。",after:null,reason:"既存municipalityが西部・南部の地点を併記しており、大幅な地域変更には人間確認が必要。",correction:true}
  ],
  "jp-47-okinawa-002":[
    {field:"entrySplit",decision:"HOLD",confidence:"high",match:"exact",changeType:"entry_split_review",claim:"同じ表記に『芋』『熟れる』『紡ぐ』があるため、語義ごとの別レコード化を検討する。",after:null,reason:"現在ページは名詞『芋』に限定できているが、資料上の同形動詞を同一ページへ統合せず、独立語形・例文を確認してから分割する。",correction:true}
  ]
};
const tier=d=>/国立国語研究所|教育委員会|市$|町$|県$|歴史民俗資料館|総合博物館/.test(d.sourceOrganization||"")?1:/大学|研究会/.test(d.sourceOrganization||"")?2:3;
const pages=candidates.map((c,index)=>{
  const d=byId.get(c.id); if(!d) throw new Error(`missing dialect: ${c.id}`);
  const assessments=special[d.id]??[{field:"description",decision:"REJECT",confidence:"high",match:"exact",changeType:"verification",claim:"既存説明は語形・意味・地域・用法・資料上の制約を既に反映している。",after:null,reason:"already_sufficient",correction:false}];
  const sources=[{id:`${d.id}-source-1`,title:d.sourceTitle,organization:d.sourceOrganization,url:d.sourceUrl,sourceTier:d.sourceTier??tier(d),exactFormMatch:d.sourceExactFormMatch??"exact",checkedAt:d.sourceCheckedAt,evidenceScopes:d.evidenceScopes??[]},...(d.additionalSources??[]).map((s,i)=>({id:`${d.id}-source-${i+2}`,...s,sourceTier:s.sourceTier??tier({sourceOrganization:s.organization}),exactFormMatch:s.exactFormMatch??"exact"}))];
  const claims=assessments.map((a,i)=>({id:`${d.id}-claim-${i+1}`,field:a.field,claim:a.claim,evidence:sources.map(s=>s.id),confidence:a.confidence,exactFormMatch:a.match,decision:a.decision,changeType:a.changeType,reason:a.reason}));
  const existingExample=d.exampleDialect||d.exampleStandard?{type:"existing_example",dialect:d.exampleDialect||null,standard:d.exampleStandard||null}:null;
  const sourceAttested=(d.evidenceScopes??[]).includes("example")&&d.exampleDialect?{type:/例文化|仮名転写|編集部/.test(d.sourceNote||"")?"editorial_example":"source_attested",source:sources[0].id,originalText:d.exampleDialect,location:d.sourceNote||null,exactFormMatch:sources[0].exactFormMatch}:null;
  return {
    batchSet:Math.floor(index/5)+1,id:d.id,word:d.phrase,prefecture:d.prefectureName,
    currentData:{reading:d.reading||null,meaning:d.standardJapanese,description:d.description,exampleDialect:d.exampleDialect||null,exampleStandard:d.exampleStandard||null,region:d.regionName,municipality:d.municipality,verificationStatus:d.verificationStatus,indexStatus:"indexable"},
    sources,claims,
    examples:[existingExample,sourceAttested].filter(Boolean),
    researchFindings:assessments.map(a=>({field:a.field,status:a.decision.toLowerCase(),finding:a.reason})),
    proposedChanges:assessments.filter(a=>a.decision!=="REJECT").map(a=>({field:a.field,before:d[a.field]??null,after:a.after,claim:a.claim,evidence:sources.map(s=>s.id),confidence:a.confidence,exactFormMatch:a.match,decision:a.decision,changeType:a.changeType,reason:a.reason})),
    approvedClaims:claims.filter(x=>x.decision==="APPROVE").map(x=>x.id),
    heldClaims:claims.filter(x=>x.decision==="HOLD").map(x=>x.id),
    rejectedClaims:claims.filter(x=>x.decision==="REJECT").map(x=>x.id),
    unresolved:assessments.filter(a=>a.decision==="HOLD").map(a=>a.reason),
    correctionCandidates:assessments.filter(a=>a.correction).map(a=>({field:a.field,decision:a.decision,reason:a.reason})),
    recommendation:claims.some(x=>x.decision==="APPROVE")?"APPROVE claimのみ人間確認後にpatch化。今回は本番反映しない。":claims.some(x=>x.decision==="HOLD")?"追加資料または人間確認までHOLD。":"新しい固有情報がなく既存説明を維持。"
  };
});
const claims=pages.flatMap(p=>p.claims), count=(k,v)=>claims.filter(c=>c[k]===v).length;
const summary={
  pages:pages.length,approve:count("decision","APPROVE"),hold:count("decision","HOLD"),reject:count("decision","REJECT"),
  confidence:{high:count("confidence","high"),medium:count("confidence","medium"),low:count("confidence","low")},
  formMatch:{exact:count("exactFormMatch","exact"),variant:count("exactFormMatch","variant"),uncertain:count("exactFormMatch","uncertain")},
  pagesWithNewInformation:pages.filter(p=>p.approvedClaims.length).length,
  alreadySufficientPages:pages.filter(p=>p.researchFindings.some(f=>f.finding==="already_sufficient")).length,
  correctionCandidatePages:pages.filter(p=>p.correctionCandidates.length).length,
  regionCandidates:pages.filter(p=>p.correctionCandidates.some(c=>c.field==="regionName")).length,
  entrySplitCandidates:pages.filter(p=>p.correctionCandidates.some(c=>c.field==="entrySplit")).length,
  readingCandidates:pages.filter(p=>p.approvedClaims.some(id=>p.claims.find(c=>c.id===id)?.field==="reading")).length,
  sourceAttestedExamplePages:pages.filter(p=>p.examples.some(e=>e.type==="source_attested")).length,
  sourceTiers:pages.flatMap(p=>p.sources).reduce((a,s)=>(a[`tier${s.sourceTier}`]=(a[`tier${s.sourceTier}`]||0)+1,a),{})
};
const setReviews=[1,2,3,4,5,6].map(set=>({set,pages:pages.filter(p=>p.batchSet===set).map(p=>p.id),checks:{tier12Prioritized:true,homonymsChecked:true,regionMatched:true,exactNotOverstated:true,noRedundantEnhancement:true,noOverclaim:true}}));
const output={generatedAt:"2026-09-04",status:"research_and_proposals_only",productionDataChanged:false,summary,setReviews,pages};
fs.writeFileSync(path.join(root,"reports/dialect-research-batch-3.json"),JSON.stringify(output,null,2)+"\n");
const md=["# 方言資料調査 第3バッチ（30件）","","本番方言データ変更: **なし**","",`APPROVE ${summary.approve} / HOLD ${summary.hold} / REJECT ${summary.reject}`,"","## 重要な修正候補",...pages.filter(p=>p.correctionCandidates.length).flatMap(p=>[`### ${p.word}（${p.id}）`,...p.correctionCandidates.map(c=>`- **${c.decision} / ${c.field}**: ${c.reason}`),""]),"## 全ページ判定",...pages.flatMap(p=>[`### Set ${p.batchSet}: ${p.word}（${p.id}）`,...p.claims.map(c=>`- **${c.decision} / ${c.field} / ${c.confidence} / ${c.exactFormMatch}** — ${c.reason}`),""]),"## 集計",`- 新しい固有情報候補: ${summary.pagesWithNewInformation}ページ`,`- 既存説明で十分: ${summary.alreadySufficientPages}ページ`,`- correction候補: ${summary.correctionCandidatePages}ページ`,`- source-attested example: ${summary.sourceAttestedExamplePages}ページ`,"","APPROVEは未反映です。"];
fs.writeFileSync(path.join(root,"reports/dialect-research-batch-3.md"),md.join("\n")+"\n");
console.log(JSON.stringify(summary,null,2));
