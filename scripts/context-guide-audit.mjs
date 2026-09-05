import { readFile, readdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
const root = process.cwd();
const files = (await readdir(join(root,"src/data/dialects"))).filter((file)=>file.endsWith(".json"));
const dialects=(await Promise.all(files.map(async(file)=>JSON.parse(await readFile(join(root,"src/data/dialects",file),"utf8"))))).flat();
const records=JSON.parse(await readFile(join(root,"src/data/context-guides.json"),"utf8"));
const byId=new Map(dialects.map((item)=>[item.id,item]));
const required=["phrase","reading","meaning","region","example","usage"], confirmed=new Set(["verified","reference_confirmed","community_confirmed"]);
const grounded=(item)=>{const scopes=new Set([...(item?.evidenceScopes??[]),...(item?.additionalSources??[]).flatMap((source)=>source.evidenceScopes??[])]);return Boolean(item&&confirmed.has(item.verificationStatus)&&item.description?.length>=100&&item.description.length<=160&&item.sourceTitle&&item.sourceUrl&&item.sourceCheckedAt&&item.exampleDialect&&item.exampleStandard&&required.every((scope)=>scopes.has(scope)));};
const duplicate=(field)=>{const map=new Map();for(const item of records){const key=String(item[field]??"").normalize("NFKC").replace(/\s/g,"");map.set(key,[...(map.get(key)??[]),item.id]);}return [...map.values()].filter((ids)=>ids.length>1);};
const failures=[];
for(const record of records){const linked=record.dialectIds.map((id)=>byId.get(id));if(!record.id||!record.slug||!record.format||!record.title||!record.searchIntent||!record.introduction||!record.sourceTitle||!record.sourceUrl||!record.sourceCheckedAt)failures.push(`${record.id??"unknown"}: 必須項目不足`);if(record.description?.length<100||record.description?.length>160)failures.push(`${record.id}: descriptionは100〜160文字（現在${record.description?.length??0}）`);if(record.indexStatus==="indexable"&&(linked.length<3||linked.some((item)=>!grounded(item))))failures.push(`${record.id}: indexable文脈記事は品質ゲート済み3例以上が必要`);if(/再現した会話|創作会話です/.test(record.introduction))failures.push(`${record.id}: 創作または再現会話として誤認される記述`);}
for(const field of ["slug","title","description","searchIntent"])if(duplicate(field).length)failures.push(`${field}重複: ${JSON.stringify(duplicate(field))}`);
const report={generatedAt:new Date().toISOString(),total:records.length,indexable:records.filter((item)=>item.indexStatus==="indexable").length,exampleCounts:Object.fromEntries(records.map((item)=>[item.id,item.dialectIds.length])),duplicateTitles:duplicate("title"),duplicateDescriptions:duplicate("description"),duplicateSearchIntents:duplicate("searchIntent"),failures};
await writeFile(join(root,"reports/context-guide-audit.json"),`${JSON.stringify(report,null,2)}\n`);console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
