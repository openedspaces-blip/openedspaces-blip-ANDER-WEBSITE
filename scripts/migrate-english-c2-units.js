#!/usr/bin/env node
require('dotenv').config();
const {Client}=require('pg');
const seedLessons=require('../lib/seed-lessons.json');
const seedUnits=require('../lib/seed-units.json');
const lessons=seedLessons.filter(x=>x.target_language==='english'&&x.level==='C2');
const units=seedUnits.filter(x=>x.target_language==='english'&&x.level==='C2');
async function main(){
  if(units.length!==12||lessons.length!==36)throw new Error(`Build C2 first; found ${units.length} units/${lessons.length} lessons.`);
  const c=new Client({connectionString:process.env.SUPABASE_DATABASE_URL,ssl:{rejectUnauthorized:false}});
  await c.connect();
  try{
    await c.query('begin');
    const language=(await c.query(`insert into languages(code,name) values('english','English') on conflict(code) do update set name=excluded.name returning id`)).rows[0];
    const level=(await c.query(`insert into levels(code,name,sort_order) values('C2','C2 - Mastery',6) on conflict(code) do update set name=excluded.name,sort_order=excluded.sort_order returning id`)).rows[0];
    const course=(await c.query(`insert into courses(language_id,level_id,title,description) values($1,$2,'English C2','Mastery-level English through extended interdisciplinary essays, conceptual vocabulary and advanced grammatical control.') on conflict(language_id,level_id) do update set title=excluded.title,description=excluded.description returning id`,[language.id,level.id])).rows[0];
    const ids={};
    for(const u of units)ids[u.slug]=(await c.query(`insert into course_units(course_id,slug,title,description,order_index) values($1,$2,$3,$4,$5) on conflict(slug) do update set course_id=excluded.course_id,title=excluded.title,description=excluded.description,order_index=excluded.order_index returning id`,[course.id,u.slug,u.title,u.description||'',u.order_index])).rows[0].id;
    for(const row of lessons){
      const x=row.content_json||{};
      const lessonId=(await c.query(`insert into course_lessons(course_id,unit_id,slug,skill,title,description,order_index,xp_reward,access_tier,estimated_minutes,is_published,grammar_note,phrases,extra) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true,$11,$12::jsonb,$13::jsonb) on conflict(slug) do update set course_id=excluded.course_id,unit_id=excluded.unit_id,skill=excluded.skill,title=excluded.title,description=excluded.description,order_index=excluded.order_index,xp_reward=excluded.xp_reward,access_tier=excluded.access_tier,estimated_minutes=excluded.estimated_minutes,is_published=true,grammar_note=excluded.grammar_note,phrases=excluded.phrases,extra=excluded.extra returning id`,[course.id,ids[row.unit_slug],row.slug,row.skill,row.title,row.description||'',row.order_index,x.xp_reward||50,row.access_tier,row.estimated_minutes||24,x.grammar||null,JSON.stringify(x.phrases||null),JSON.stringify(x.extra||null)])).rows[0].id;
      await c.query('delete from lesson_sections where lesson_id=$1',[lessonId]);
      if(x.reading)await c.query(`insert into lesson_sections(lesson_id,type,order_index,reading_title,reading_text,reading_questions) values($1,'reading',0,$2,$3,$4::jsonb)`,[lessonId,x.reading.title||null,x.reading.text||'',JSON.stringify(x.reading.questions||[])]);
      for(const [i,v] of (x.vocabulary||[]).entries())await c.query(`insert into lesson_sections(lesson_id,type,order_index,word,translation,example,line) values($1,'vocabulary_item',$2,$3,$4,$5,$6)`,[lessonId,i,v.word,v.translation||'',v.example||'',v.definition||null]);
      await c.query('delete from exercises where lesson_id=$1',[lessonId]);
      for(const [i,e] of (x.exercises||[]).entries()){
        const eid=(await c.query(`insert into exercises(lesson_id,type,prompt,order_index) values($1,$2,$3,$4) returning id`,[lessonId,e.type,e.prompt,i])).rows[0].id;
        for(const [j,o] of (e.options||[]).entries())await c.query(`insert into exercise_options(exercise_id,option_text,is_correct,order_index) values($1,$2,$3,$4)`,[eid,o,j===Number(e.answer),j]);
      }
    }
    await c.query(`delete from course_lessons where course_id=$1 and not(slug=any($2::text[]))`,[course.id,lessons.map(x=>x.slug)]);
    await c.query(`delete from course_units where course_id=$1 and not(slug=any($2::text[]))`,[course.id,units.map(x=>x.slug)]);
    await c.query('commit');
    const result=(await c.query(`select count(distinct unit_id)::int units,count(*)::int lessons,count(*) filter(where skill='reading')::int reading,count(*) filter(where skill='vocabulary')::int vocabulary,count(*) filter(where skill='grammar')::int grammar from course_lessons where course_id=$1`,[course.id])).rows[0];
    console.log('English C2 migration complete:',result);
  }catch(e){await c.query('rollback').catch(()=>{});throw e}finally{await c.end()}
}
main().catch(e=>{console.error(e);process.exit(1)});
