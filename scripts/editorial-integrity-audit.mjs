import fs from "node:fs";
import path from "node:path";

const root=process.cwd(), read=f=>JSON.parse(fs.readFileSync(path.join(root,f),"utf8"));
const dialects=fs.readdirSync(path.join(root,"src/data/dialects")).filter(f=>f.endsWith(".json")).flatMap(f=>read(`src/data/dialects/${f}`));
const ids=new Set(dialects.map(d=>d.id));
const reports=["reports/dialect-research-batch-2.json","reports/dialect-resolution-batch.json","reports/dialect-research-batch-3.json"].filter(f=>fs.existsSync(path.join(root,f))).map(read);
const changelog=read("reports/dialect-editorial-changelog.json");
const allowed={
  sourceTier:new Set([1,2,3,4]),
  exactFormMatch:new Set(["exact","variant","uncertain"]),
  confidence:new Set(["high","medium","low"]),
  changeType:new Set(["enhancement","correction","verification","source_addition","region_refinement","meaning_refinement","entry_split_review"])
};
const errors=[], warnings=[];
const nonempty=v=>Array.isArray(v)?v.length>0:v!==null&&v!==undefined&&String(v).trim()!=="";
for(const report of reports){
  for(const page of report.pages??[]){
    if(!ids.has(page.id)) errors.push({type:"missing_dialect_id",id:page.id});
    const sourceIds=new Set((page.sources??[]).map(s=>s.id));
    for(const s of page.sources??[]){
      if(!nonempty(s.url)) errors.push({type:"empty_source_url",id:page.id,source:s.id});
      if(!allowed.sourceTier.has(s.sourceTier)) errors.push({type:"invalid_source_tier",id:page.id,source:s.id,value:s.sourceTier});
      if(!allowed.exactFormMatch.has(s.exactFormMatch)) errors.push({type:"invalid_source_match",id:page.id,source:s.id,value:s.exactFormMatch});
    }
    for(const c of page.claims??[]){
      if(!allowed.confidence.has(c.confidence)) errors.push({type:"invalid_confidence",id:page.id,claim:c.id,value:c.confidence});
      if(!allowed.exactFormMatch.has(c.exactFormMatch)) errors.push({type:"invalid_claim_match",id:page.id,claim:c.id,value:c.exactFormMatch});
      if(c.changeType&&!allowed.changeType.has(c.changeType)) errors.push({type:"invalid_change_type",id:page.id,claim:c.id,value:c.changeType});
      if(c.decision==="APPROVE"&&(!c.evidence?.length||c.evidence.some(e=>!sourceIds.has(e)))) errors.push({type:"approve_without_valid_evidence",id:page.id,claim:c.id});
      if(c.decision==="APPROVE"&&["reading","meaning","standardJapanese","region","regionName"].includes(c.field)&&c.confidence!=="high") errors.push({type:"critical_approve_not_high",id:page.id,claim:c.id});
    }
    const urls=(page.sources??[]).map(s=>s.url).filter(Boolean);
    if(new Set(urls).size!==urls.length) warnings.push({type:"duplicate_source_in_report",id:page.id});
  }
}
for(const d of dialects){
  const urls=[d.sourceUrl,...(d.additionalSources??[]).map(s=>s.url)].filter(Boolean);
  if(new Set(urls).size!==urls.length) warnings.push({type:"duplicate_source_in_production",id:d.id});
}
for(const change of changelog.changes??[]){
  if(!ids.has(change.id)) errors.push({type:"changelog_missing_dialect_id",id:change.id});
  if(change.before===undefined||change.before===null||!nonempty(change.after)) errors.push({type:"empty_changelog_before_after",id:change.id,field:change.field});
  if(change.changeType&&!allowed.changeType.has(change.changeType)) errors.push({type:"invalid_changelog_change_type",id:change.id,value:change.changeType});
  if(!change.changeType) warnings.push({type:"legacy_changelog_missing_change_type",id:change.id,field:change.field});
  if(!change.updatedAt) warnings.push({type:"legacy_changelog_missing_updated_at",id:change.id,field:change.field});
}
const rawTokens=[];
for(const d of dialects){
  for(const [field,value] of Object.entries(d)){
    if(typeof value==="string"&&/^(undefined|null|NaN)$/i.test(value.trim())) rawTokens.push({id:d.id,field,value});
  }
}
if(rawTokens.length) errors.push(...rawTokens.map(x=>({type:"raw_forbidden_token",...x})));
const result={generatedAt:new Date().toISOString(),status:errors.length?"FAILED":"PASSED",dialects:dialects.length,reports:reports.length,checks:{idsExist:true,sourceUrls:true,enums:true,approveEvidence:true,criticalConfidence:true,changelogBeforeAfter:true,duplicateSources:true,rawTokens:true},errors,warnings};
fs.writeFileSync(path.join(root,"reports/editorial-integrity-audit.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({status:result.status,dialects:result.dialects,errors:errors.length,warnings:warnings.length,warningTypes:Object.fromEntries([...new Set(warnings.map(w=>w.type))].map(t=>[t,warnings.filter(w=>w.type===t).length]))},null,2));
if(errors.length) process.exitCode=1;
