(function(root){
'use strict';
const leagues=[['en.1','Premier League'],['es.1','La Liga'],['it.1','Serie A'],['de.1','Bundesliga'],['fr.1','Ligue 1']];
const sources=leagues.flatMap(([code,league])=>['2025-26','2026-27'].map(season=>({league,season,url:`https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${code}.json`})));
function convert(data,league,today=new Date().toISOString().slice(0,10)){
 if(!Array.isArray(data.matches))throw Error('รูปแบบข้อมูลไม่ถูกต้อง');
 return data.matches.filter(m=>m.date<=today&&Array.isArray(m.score?.ft)&&m.score.ft.length===2&&m.score.ft.every(v=>Number.isInteger(v)&&v>=0&&v<=30)).map(m=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(m.date)||!Number.isFinite(Date.parse(m.date))||new Date(m.date).toISOString().slice(0,10)!==m.date||typeof m.team1!=='string'||typeof m.team2!=='string'||!m.team1||!m.team2||m.team1===m.team2)throw Error('แมตช์มีวันที่หรือชื่อทีมไม่ถูกต้อง');return {date:m.date,league,home:m.team1,away:m.team2,hg:m.score.ft[0],ag:m.score.ft[1]}});
}
async function load(fetcher=fetch){const results=await Promise.allSettled(sources.map(async s=>{const r=await fetcher(s.url,{signal:AbortSignal.timeout(20000),cache:'no-cache'});if(!r.ok)throw Error('HTTP '+r.status);return {...s,rows:convert(await r.json(),s.league)}}));const failures=[],loaded=[];results.forEach((r,i)=>{if(r.status==='fulfilled')loaded.push(r.value);else failures.push(sources[i].league+' '+sources[i].season)});for(const [,league]of leagues)if(!loaded.some(s=>s.league===league&&s.season==='2025-26'&&s.rows.length>=40))throw Error('โหลดข้อมูลพื้นฐานไม่ครบ: '+league+' • โปรดลองอีกครั้ง');const seen=new Set(),rows=[];for(const s of loaded)for(const r of s.rows){const id=JSON.stringify([r.date,r.league,r.home,r.away]);if(!seen.has(id)){seen.add(id);rows.push(r)}}rows.sort((a,b)=>a.date.localeCompare(b.date));return {provider:'OpenFootball',license:'CC0-1.0',retrievedAt:new Date().toISOString(),sources:loaded.map(({rows,...s})=>({...s,completed:rows.length})),failures,rows}}
root.MatchData={sources,convert,load};if(typeof module!=='undefined')module.exports=root.MatchData;
})(typeof window!=='undefined'?window:globalThis);
