// src/js/verbs/verb-conjugation-engine.js
// Deterministic English tense-conjugation engine - Fase 3 ("Desarrollar
// conjugador de inglés"). Pure grammar rules applied to each verb's own
// hand-authored forms (thirdPersonSingular/pastSimple/pastParticiple/
// presentParticiple, src/js/verbs/english-verbs-data.js) - NEVER an AI call
// at runtime (spec: "no generar conjugaciones mediante IA en tiempo real").
// English tense formation (auxiliary + base/participle, do-support for
// negatives/questions) is fully rule-based once those 4 forms are known;
// this computes the same table a print grammar reference would, just
// programmatically instead of hand-typed for 100 verbs x 9 tenses x 5
// persons (4,500 cells) - hand-authoring that would be impractical and far
// more error-prone than a small, reviewable rule set.
//
// Deliberately produces bare verb PHRASES ("she doesn't go", "did they
// go?"), not full invented sentences with an object - correct for every
// verb regardless of transitivity, unlike a templated "I VERB it." would be
// for an intransitive verb (go, arrive, sit...). Real, natural full-sentence
// examples already exist per verb (raw.examples.affirmative/negative/
// interrogative, present simple only, hand-authored) - this engine covers
// the other 8 tenses, which have no hand-authored examples of their own.
(function () {
  // "He / She / It" is the table's display label (left column); `subject`
  // is the single representative pronoun actually used inside each
  // generated phrase - "He" reads more naturally as a sentence subject than
  // the slash-separated label would.
  const PERSONS = [
    { label: 'I', subject: 'I', third: false, be: 'am', was: 'was' },
    { label: 'You', subject: 'You', third: false, be: 'are', was: 'were' },
    { label: 'He / She / It', subject: 'He', third: true, be: 'is', was: 'was' },
    { label: 'We', subject: 'We', third: false, be: 'are', was: 'were' },
    { label: 'They', subject: 'They', third: false, be: 'are', was: 'were' }
  ];

  function cap(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
  }

  // Every subject stays capitalized mid-sentence except "I", which is
  // always capitalized anyway - so this only ever needs to lowercase
  // everything else (used right after a fronted auxiliary in questions:
  // "Does he go?", not "Does He go?").
  function subjectLower(subject) {
    return subject === 'I' ? 'I' : subject.toLowerCase();
  }

  function presentSimple(raw, p) {
    if (raw.infinitive === 'be') {
      return {
        affirmative: `${p.subject} ${p.be}`,
        negative: `${p.subject} ${p.be} not`,
        interrogative: `${cap(p.be)} ${subjectLower(p.subject)}?`
      };
    }
    const verbForm = p.third ? raw.forms.thirdPersonSingular : raw.infinitive;
    const doWord = p.third ? 'does' : 'do';
    return {
      affirmative: `${p.subject} ${verbForm}`,
      negative: `${p.subject} ${doWord} not ${raw.infinitive}`,
      interrogative: `${cap(doWord)} ${subjectLower(p.subject)} ${raw.infinitive}?`
    };
  }

  function presentContinuous(raw, p) {
    return {
      affirmative: `${p.subject} ${p.be} ${raw.forms.presentParticiple}`,
      negative: `${p.subject} ${p.be} not ${raw.forms.presentParticiple}`,
      interrogative: `${cap(p.be)} ${subjectLower(p.subject)} ${raw.forms.presentParticiple}?`
    };
  }

  function pastSimple(raw, p) {
    if (raw.infinitive === 'be') {
      return {
        affirmative: `${p.subject} ${p.was}`,
        negative: `${p.subject} ${p.was} not`,
        interrogative: `${cap(p.was)} ${subjectLower(p.subject)}?`
      };
    }
    return {
      affirmative: `${p.subject} ${raw.forms.pastSimple}`,
      negative: `${p.subject} did not ${raw.infinitive}`,
      interrogative: `Did ${subjectLower(p.subject)} ${raw.infinitive}?`
    };
  }

  function pastContinuous(raw, p) {
    return {
      affirmative: `${p.subject} ${p.was} ${raw.forms.presentParticiple}`,
      negative: `${p.subject} ${p.was} not ${raw.forms.presentParticiple}`,
      interrogative: `${cap(p.was)} ${subjectLower(p.subject)} ${raw.forms.presentParticiple}?`
    };
  }

  function presentPerfect(raw, p) {
    const aux = p.third ? 'has' : 'have';
    return {
      affirmative: `${p.subject} ${aux} ${raw.forms.pastParticiple}`,
      negative: `${p.subject} ${aux} not ${raw.forms.pastParticiple}`,
      interrogative: `${cap(aux)} ${subjectLower(p.subject)} ${raw.forms.pastParticiple}?`
    };
  }

  function pastPerfect(raw, p) {
    return {
      affirmative: `${p.subject} had ${raw.forms.pastParticiple}`,
      negative: `${p.subject} had not ${raw.forms.pastParticiple}`,
      interrogative: `Had ${subjectLower(p.subject)} ${raw.forms.pastParticiple}?`
    };
  }

  function futureSimple(raw, p) {
    return {
      affirmative: `${p.subject} will ${raw.infinitive}`,
      negative: `${p.subject} will not ${raw.infinitive}`,
      interrogative: `Will ${subjectLower(p.subject)} ${raw.infinitive}?`
    };
  }

  function futureGoingTo(raw, p) {
    return {
      affirmative: `${p.subject} ${p.be} going to ${raw.infinitive}`,
      negative: `${p.subject} ${p.be} not going to ${raw.infinitive}`,
      interrogative: `${cap(p.be)} ${subjectLower(p.subject)} going to ${raw.infinitive}?`
    };
  }

  // Verbs that are grammatically fine but pragmatically rare in continuous
  // tenses (classic ESL "stative verb" list, restricted to this dataset's
  // 100 verbs) - the continuous tables still compute correctly for them
  // (that's just applying the same rule), but the UI surfaces this as a
  // usage note instead of presenting "I am knowing" as equally natural as
  // "I am going".
  const STATIVE_VERBS = new Set([
    'be', 'have', 'know', 'think', 'want', 'need', 'feel', 'mean', 'seem',
    'believe', 'understand', 'hear', 'see', 'love', 'remember', 'hope', 'agree'
  ]);

  const TENSES = [
    { id: 'presentSimple', label: 'Presente simple', build: presentSimple },
    { id: 'presentContinuous', label: 'Presente continuo', build: presentContinuous, stativeCheck: true },
    { id: 'pastSimple', label: 'Pasado simple', build: pastSimple },
    { id: 'pastContinuous', label: 'Pasado continuo', build: pastContinuous, stativeCheck: true },
    { id: 'presentPerfect', label: 'Presente perfecto', build: presentPerfect },
    { id: 'pastPerfect', label: 'Pasado perfecto', build: pastPerfect },
    { id: 'futureSimple', label: 'Futuro simple (will)', build: futureSimple },
    { id: 'futureGoingTo', label: 'Futuro próximo (going to)', build: futureGoingTo },
    { id: 'imperative', label: 'Imperativo', build: null }
  ];

  // { rows: [{ label, affirmative, negative, interrogative }], note }
  // Imperative has exactly one row (no person distinction in English) and
  // no interrogative form - callers should render an empty interrogative
  // cell rather than treat this as an error.
  function conjugateTense(raw, tenseId) {
    const tense = TENSES.find((t) => t.id === tenseId);
    if (!tense || !raw?.infinitive || !raw?.forms) return null;

    if (tenseId === 'imperative') {
      return {
        rows: [
          {
            label: '(you)',
            affirmative: cap(raw.infinitive),
            negative: `Don't ${raw.infinitive}`,
            interrogative: ''
          }
        ],
        note: null
      };
    }

    return {
      rows: PERSONS.map((p) => ({ label: p.label, ...tense.build(raw, p) })),
      note:
        tense.stativeCheck && STATIVE_VERBS.has(raw.infinitive)
          ? `"${raw.infinitive}" es un verbo de estado - estas formas continuas son gramaticalmente correctas pero poco frecuentes en el habla natural.`
          : null
    };
  }

  window.AndergoVerbConjugation = { TENSES, conjugateTense };
})();
