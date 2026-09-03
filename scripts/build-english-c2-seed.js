#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const {units,language,level,courseTitle}=require('./content/english-c2-units');
const root=path.join(__dirname,'..');
const lessonsPath=path.join(root,'lib','seed-lessons.json');
const unitsPath=path.join(root,'lib','seed-units.json');
const skills=['reading','listening','speaking','writing','grammar','vocabulary'];
function row(unit,skill,index){
  const a=unit.activities[skill],extra={};
  if(a.grammarTest)extra.grammarTest=a.grammarTest;
  if(a.listeningComprehension)extra.listeningComprehension=a.listeningComprehension;
  if(a.grammarProfile)extra.grammarProfile=a.grammarProfile;
  if(a.reading?.references?.length)extra.readingReferences=a.reading.references;
  if(a.listeningType)extra.listeningType=a.listeningType;
  if(a.difficulty)extra.difficulty=a.difficulty;
  if(a.durationSeconds)extra.durationSeconds=a.durationSeconds;
  if(a.speakers)extra.speakers=a.speakers;
  if(a.phoneticSupport)extra.phoneticSupport=a.phoneticSupport;
  if(a.communicationGuide)extra.communicationGuide=a.communicationGuide;
  if(a.writingGuide)extra.writingGuide=a.writingGuide;
  return {slug:`english-c2-${unit.slug}-${skill}`,target_language:language,level,skill,unit_slug:unit.slug,title:a.title,description:a.description||'',order_index:unit.order*10+index,estimated_minutes:a.duration,is_free:unit.accessTier!=='premium',access_tier:unit.accessTier,content_json:{language:'English',language_key:language,level_title:courseTitle,intro:a.intro||'',mission:a.mission||'',grammar:a.grammarNote||'',phrases:a.phrases||[],vocabulary:a.vocabulary||[],dialogue:a.dialogue||[],reading:a.reading||null,transcript:a.transcript||'',dictation:a.dictation||null,exercises:a.exercises||[],extra:Object.keys(extra).length?extra:null,xp_reward:a.xp}};
}
const oldLessons=JSON.parse(fs.readFileSync(lessonsPath,'utf8')).filter(x=>!(x.target_language===language&&x.level===level));
const nextLessons=units.flatMap(u=>skills.map((s,i)=>row(u,s,i)));
fs.writeFileSync(lessonsPath,`${JSON.stringify([...oldLessons,...nextLessons],null,2)}\n`,'utf8');
const oldUnits=JSON.parse(fs.readFileSync(unitsPath,'utf8')).filter(x=>!(x.target_language===language&&x.level===level));
const nextUnits=units.map(u=>({slug:u.slug,target_language:language,level,title:u.title,title_es:u.titleEs||u.title,description:u.description,order_index:u.order,unit_overview:u.unitOverview}));
fs.writeFileSync(unitsPath,`${JSON.stringify([...oldUnits,...nextUnits],null,2)}\n`,'utf8');
console.log(`Built ${nextUnits.length} English C2 units and ${nextLessons.length} activities.`);
