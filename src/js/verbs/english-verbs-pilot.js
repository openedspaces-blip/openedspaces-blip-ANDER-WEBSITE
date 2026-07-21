// src/js/verbs/english-verbs-pilot.js
// Fase 2 pilot data: the 10 most frequent English verbs (be, have, do, go,
// come, make, take, get, see, know). Plain <script> global, same loading
// pattern as src/worlds/*/content.js - no bundler, no build step.
//
// Conjugations/examples are hand-authored, not AI-generated at runtime (see
// the Fase 1 plan: "no uses IA para generar conjugaciones en tiempo real").
// conjugationExamples is authored now (even though Conjugador itself is a
// placeholder until a later phase) so this data file doesn't need a rewrite
// later - only src/js/verbs/verbs-view.js needs to grow.
(function () {
  window.ANDERGO_VERBS_PILOT = window.ANDERGO_VERBS_PILOT || {};

  window.ANDERGO_VERBS_PILOT.english = [
    {
      id: 'verb-english-be',
      infinitive: 'be',
      isIrregular: true,
      cefr: 'A1',
      frequencyRank: 1,
      phonetic: '/biː/',
      translation: { spanish: 'ser / estar', french: 'être' },
      simpleDefinition: 'To exist, or to have a particular identity, quality, or state.',
      forms: {
        base: 'be',
        presentSimple: 'am / is / are',
        thirdPersonSingular: 'is',
        pastSimple: 'was / were',
        pastParticiple: 'been',
        presentParticiple: 'being'
      },
      example: 'She is a teacher.',
      conjugationExamples: {
        affirmative: 'She is a teacher.',
        negative: 'She is not a teacher.',
        interrogative: 'Is she a teacher?'
      }
    },
    {
      id: 'verb-english-have',
      infinitive: 'have',
      isIrregular: true,
      cefr: 'A1',
      frequencyRank: 2,
      phonetic: '/hæv/',
      translation: { spanish: 'tener', french: 'avoir' },
      simpleDefinition: 'To possess, own, or hold something.',
      forms: {
        base: 'have',
        presentSimple: 'have / has',
        thirdPersonSingular: 'has',
        pastSimple: 'had',
        pastParticiple: 'had',
        presentParticiple: 'having'
      },
      example: 'I have a car.',
      conjugationExamples: {
        affirmative: 'I have a car.',
        negative: 'I do not have a car.',
        interrogative: 'Do you have a car?'
      }
    },
    {
      id: 'verb-english-do',
      infinitive: 'do',
      isIrregular: true,
      cefr: 'A1',
      frequencyRank: 3,
      phonetic: '/duː/',
      translation: { spanish: 'hacer', french: 'faire' },
      simpleDefinition: 'To perform an action or task.',
      forms: {
        base: 'do',
        presentSimple: 'do / does',
        thirdPersonSingular: 'does',
        pastSimple: 'did',
        pastParticiple: 'done',
        presentParticiple: 'doing'
      },
      example: 'They do their homework every day.',
      conjugationExamples: {
        affirmative: 'They do their homework every day.',
        negative: 'They do not do their homework every day.',
        interrogative: 'Do they do their homework every day?'
      }
    },
    {
      id: 'verb-english-go',
      infinitive: 'go',
      isIrregular: true,
      cefr: 'A1',
      frequencyRank: 4,
      phonetic: '/ɡoʊ/',
      translation: { spanish: 'ir', french: 'aller' },
      simpleDefinition: 'To move or travel from one place to another.',
      forms: {
        base: 'go',
        presentSimple: 'go / goes',
        thirdPersonSingular: 'goes',
        pastSimple: 'went',
        pastParticiple: 'gone',
        presentParticiple: 'going'
      },
      example: 'He goes to school by bus.',
      conjugationExamples: {
        affirmative: 'He goes to school by bus.',
        negative: 'He does not go to school by bus.',
        interrogative: 'Does he go to school by bus?'
      }
    },
    {
      id: 'verb-english-come',
      infinitive: 'come',
      isIrregular: true,
      cefr: 'A1',
      frequencyRank: 5,
      phonetic: '/kʌm/',
      translation: { spanish: 'venir', french: 'venir' },
      simpleDefinition: 'To move toward the speaker or a particular place.',
      forms: {
        base: 'come',
        presentSimple: 'come / comes',
        thirdPersonSingular: 'comes',
        pastSimple: 'came',
        pastParticiple: 'come',
        presentParticiple: 'coming'
      },
      example: 'She comes to class early.',
      conjugationExamples: {
        affirmative: 'She comes to class early.',
        negative: 'She does not come to class early.',
        interrogative: 'Does she come to class early?'
      }
    },
    {
      id: 'verb-english-make',
      infinitive: 'make',
      isIrregular: true,
      cefr: 'A1',
      frequencyRank: 6,
      phonetic: '/meɪk/',
      translation: { spanish: 'hacer / fabricar', french: 'faire / fabriquer' },
      simpleDefinition: 'To create, produce, or cause something to exist.',
      forms: {
        base: 'make',
        presentSimple: 'make / makes',
        thirdPersonSingular: 'makes',
        pastSimple: 'made',
        pastParticiple: 'made',
        presentParticiple: 'making'
      },
      example: 'We make dinner together.',
      conjugationExamples: {
        affirmative: 'We make dinner together.',
        negative: 'We do not make dinner together.',
        interrogative: 'Do you make dinner together?'
      }
    },
    {
      id: 'verb-english-take',
      infinitive: 'take',
      isIrregular: true,
      cefr: 'A1',
      frequencyRank: 7,
      phonetic: '/teɪk/',
      translation: { spanish: 'tomar / llevar', french: 'prendre' },
      simpleDefinition: 'To get hold of something, or to move it from one place to another.',
      forms: {
        base: 'take',
        presentSimple: 'take / takes',
        thirdPersonSingular: 'takes',
        pastSimple: 'took',
        pastParticiple: 'taken',
        presentParticiple: 'taking'
      },
      example: 'I take the bus to work.',
      conjugationExamples: {
        affirmative: 'I take the bus to work.',
        negative: 'I do not take the bus to work.',
        interrogative: 'Do you take the bus to work?'
      }
    },
    {
      id: 'verb-english-get',
      infinitive: 'get',
      isIrregular: true,
      cefr: 'A2',
      frequencyRank: 8,
      phonetic: '/ɡet/',
      translation: { spanish: 'obtener / conseguir', french: 'obtenir / recevoir' },
      simpleDefinition: 'To obtain, receive, or become something.',
      forms: {
        base: 'get',
        presentSimple: 'get / gets',
        thirdPersonSingular: 'gets',
        pastSimple: 'got',
        pastParticiple: 'gotten / got',
        presentParticiple: 'getting'
      },
      example: 'You get good grades.',
      conjugationExamples: {
        affirmative: 'You get good grades.',
        negative: 'You do not get good grades.',
        interrogative: 'Do you get good grades?'
      }
    },
    {
      id: 'verb-english-see',
      infinitive: 'see',
      isIrregular: true,
      cefr: 'A1',
      frequencyRank: 9,
      phonetic: '/siː/',
      translation: { spanish: 'ver', french: 'voir' },
      simpleDefinition: 'To notice or become aware of something using your eyes.',
      forms: {
        base: 'see',
        presentSimple: 'see / sees',
        thirdPersonSingular: 'sees',
        pastSimple: 'saw',
        pastParticiple: 'seen',
        presentParticiple: 'seeing'
      },
      example: 'I see my friends on weekends.',
      conjugationExamples: {
        affirmative: 'I see my friends on weekends.',
        negative: 'I do not see my friends on weekends.',
        interrogative: 'Do you see your friends on weekends?'
      }
    },
    {
      id: 'verb-english-know',
      infinitive: 'know',
      isIrregular: true,
      cefr: 'A2',
      frequencyRank: 10,
      phonetic: '/noʊ/',
      translation: { spanish: 'saber / conocer', french: 'savoir / connaître' },
      simpleDefinition: 'To have information about something, or to be familiar with something or someone.',
      forms: {
        base: 'know',
        presentSimple: 'know / knows',
        thirdPersonSingular: 'knows',
        pastSimple: 'knew',
        pastParticiple: 'known',
        presentParticiple: 'knowing'
      },
      example: 'They know the answer.',
      conjugationExamples: {
        affirmative: 'They know the answer.',
        negative: 'They do not know the answer.',
        interrogative: 'Do they know the answer?'
      }
    }
  ];
})();
