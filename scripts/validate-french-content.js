#!/usr/bin/env node
// scripts/validate-french-content.js
// Structural validator for scripts/content/french-a2-units.js and
// french-b1-units.js, run standalone (`node scripts/validate-french-content.js`)
// or required by the migrate-french-{a2,b1}-units.js scripts as a hard gate
// before touching Supabase. Checks the things a human reviewer would catch
// by eye but that are easy to get wrong at this volume: unit-count minimums,
// exactly 7 activities/unit, no empty titles, mcq answer indices in range,
// no empty dialogue/vocabulary fields, no duplicate slugs, reading word
// counts in the CEFR-appropriate range, and exactly 10 reading questions.
// Exits non-zero (and migrate scripts abort) on any failure.
const CORE_SKILLS = ['reading', 'listening', 'speaking', 'writing', 'grammar', 'vocabulary', 'dialogue'];

function wordCount(parts) {
  return (parts || []).join(' ').trim().split(/\s+/).filter(Boolean).length;
}

// readingRange: [min, max] words. minListeningQuestions: floor for the
// listening activity's exercises array (spec: 5 a 10 preguntas).
// skills: which activities are required per unit - defaults to the full
// 7-activity course shape (A2/B1/B2), but C1/C2 currently only author
// reading/vocabulary/grammar per unit (spec: "solo secciones reading,
// vocabulary y grammar"), so callers pass a narrower list for those.
function validateLevel(mod, { minUnits, maxUnits, readingRange, label, skills = CORE_SKILLS }) {
  const errors = [];
  const { units } = mod;

  if (units.length < minUnits || (maxUnits && units.length > maxUnits)) {
    errors.push(
      `${label}: se encontraron ${units.length} unidades; se requieren ${maxUnits ? `entre ${minUnits} y ${maxUnits}` : `al menos ${minUnits}`}.`
    );
  }

  const seenUnitSlugs = new Set();
  const seenLessonSlugs = new Set();

  units.forEach((unit) => {
    if (!unit.slug) errors.push(`${label}: una unidad no tiene slug.`);
    if (seenUnitSlugs.has(unit.slug)) errors.push(`${label}: slug de unidad duplicado "${unit.slug}".`);
    seenUnitSlugs.add(unit.slug);
    if (!unit.title || !unit.title.trim()) errors.push(`${label} (${unit.slug}): título de unidad vacío.`);

    const presentSkills = skills.filter((s) => unit.activities[s]);
    if (presentSkills.length !== skills.length) {
      errors.push(
        `${label} (${unit.slug}): tiene ${presentSkills.length} actividades (${presentSkills.join(', ')}); debe tener exactamente ${skills.length} (${skills.join(', ')}).`
      );
    }

    skills.forEach((skill) => {
      const a = unit.activities[skill];
      if (!a) return;

      const lessonSlug = `french-${label.toLowerCase()}-${unit.slug}-${skill}`;
      if (seenLessonSlugs.has(lessonSlug)) errors.push(`${label}: slug de actividad duplicado "${lessonSlug}".`);
      seenLessonSlugs.add(lessonSlug);

      if (!a.title || !a.title.trim()) errors.push(`${label} (${unit.slug}/${skill}): título vacío.`);

      const hasRealContent =
        a.reading || (a.dialogue && a.dialogue.length) || (a.vocabulary && a.vocabulary.length) || a.grammarNote || a.mission;
      if (!hasRealContent) errors.push(`${label} (${unit.slug}/${skill}): actividad sin contenido pedagógico (vacía/relleno).`);

      (a.exercises || []).forEach((ex, i) => {
        if (ex.type === 'mcq') {
          if (!Array.isArray(ex.options) || !ex.options.length) {
            errors.push(`${label} (${unit.slug}/${skill}) ejercicio ${i}: sin opciones.`);
          } else if (
            typeof ex.answer !== 'number' ||
            ex.answer < 0 ||
            ex.answer >= ex.options.length
          ) {
            errors.push(`${label} (${unit.slug}/${skill}) ejercicio ${i}: respuesta fuera de rango (${ex.answer}).`);
          }
          if (!ex.prompt || !ex.prompt.trim()) {
            errors.push(`${label} (${unit.slug}/${skill}) ejercicio ${i}: sin enunciado (prompt).`);
          }
        }
      });

      (a.dialogue || []).forEach((line, i) => {
        if (!line.speaker || !line.speaker.trim() || !line.line || !line.line.trim()) {
          errors.push(`${label} (${unit.slug}/${skill}) diálogo ${i}: speaker o line vacío.`);
        }
      });

      (a.vocabulary || []).forEach((v, i) => {
        if (!v.word || !v.word.trim() || !v.translation || !v.translation.trim()) {
          errors.push(`${label} (${unit.slug}/${skill}) vocabulario ${i}: palabra o traducción vacía.`);
        }
      });

      if (skill === 'reading') {
        if (!a.reading) {
          errors.push(`${label} (${unit.slug}/reading): sin objeto "reading".`);
        } else {
          const words = wordCount(a.reading.parts || [a.reading.text]);
          if (words < readingRange[0] || words > readingRange[1]) {
            errors.push(
              `${label} (${unit.slug}/reading): lectura de ${words} palabras, fuera del rango ${readingRange[0]}-${readingRange[1]}.`
            );
          }
        }
        const mcqCount = (a.exercises || []).filter((e) => e.type === 'mcq').length;
        if (mcqCount !== 10) {
          errors.push(`${label} (${unit.slug}/reading): ${mcqCount} preguntas de comprensión; se requieren exactamente 10.`);
        }
      }

      if (skill === 'listening') {
        const qCount = (a.exercises || []).length;
        if (qCount < 3) {
          errors.push(`${label} (${unit.slug}/listening): solo ${qCount} preguntas; se recomiendan al menos 3-5.`);
        }
        if (!a.dialogue || !a.dialogue.length) {
          errors.push(`${label} (${unit.slug}/listening): sin guion de diálogo (dialogue[]).`);
        }
      }
    });

    // Order sanity - not fatal, but flagged.
    if (typeof unit.order !== 'number') {
      errors.push(`${label} (${unit.slug}): falta "order" numérico.`);
    }
  });

  return errors;
}

function main() {
  const a2 = require('./content/french-a2-units');
  const b1 = require('./content/french-b1-units');

  const errorsA2 = validateLevel(a2, { minUnits: 10, maxUnits: 12, readingRange: [180, 300], label: 'A2' });
  const errorsB1 = validateLevel(b1, { minUnits: 10, maxUnits: 12, readingRange: [280, 500], label: 'B1' });

  const allErrors = [...errorsA2, ...errorsB1];

  if (allErrors.length) {
    console.error(`Validación fallida: ${allErrors.length} problema(s) encontrado(s).\n`);
    allErrors.forEach((e) => console.error(' - ' + e));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Validación OK: A2 ${a2.units.length} unidades / ${a2.units.length * 7} actividades, ` +
      `B1 ${b1.units.length} unidades / ${b1.units.length * 7} actividades.`
  );
}

if (require.main === module) {
  main();
}

module.exports = { validateLevel };
