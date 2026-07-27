const { getSupabaseAdmin } = require('./supabaseClient');

const OUTCOME_LABELS = {
  cefr_descriptor: 'Descriptores MCER',
  fundamental_competency: 'Competencias fundamentales',
  specific_competency: 'Competencias específicas',
  achievement_indicator: 'Indicadores de logro',
  communicative_function: 'Funciones comunicativas',
  learning_objective: 'Objetivos de aprendizaje',
  conceptual_content: 'Contenidos conceptuales',
  procedural_content: 'Contenidos procedimentales',
  attitudinal_content: 'Contenidos actitudinales'
};

async function getCurriculumSummary() {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return { frameworks: [], totals: { outcomes: 0, mappings: 0, assessedMappings: 0 } };
  }

  const [frameworkResult, outcomeResult, mappingResult] = await Promise.all([
    admin
      .from('curriculum_frameworks')
      .select('id, code, name, jurisdiction, version, source_url, is_active')
      .eq('is_active', true)
      .order('code'),
    admin
      .from('curriculum_outcomes')
      .select('id, framework_id, outcome_type, cefr_level'),
    admin
      .from('curriculum_activity_mappings')
      .select('outcome_id, alignment_strength, evidence_type')
  ]);

  const error = frameworkResult.error || outcomeResult.error || mappingResult.error;
  if (error) {
    const wrapped = new Error('No se pudo consultar la capa curricular.');
    wrapped.cause = error;
    wrapped.status = 503;
    throw wrapped;
  }

  const outcomes = outcomeResult.data || [];
  const mappings = mappingResult.data || [];
  const mappingsByOutcome = new Map();
  mappings.forEach((mapping) => {
    const current = mappingsByOutcome.get(mapping.outcome_id) || [];
    current.push(mapping);
    mappingsByOutcome.set(mapping.outcome_id, current);
  });

  const frameworks = (frameworkResult.data || []).map((framework) => {
    const frameworkOutcomes = outcomes.filter((item) => item.framework_id === framework.id);
    const typeCounts = Object.entries(OUTCOME_LABELS)
      .map(([type, label]) => ({
        type,
        label,
        count: frameworkOutcomes.filter((item) => item.outcome_type === type).length
      }))
      .filter((item) => item.count > 0);
    const frameworkMappings = frameworkOutcomes.flatMap(
      (outcome) => mappingsByOutcome.get(outcome.id) || []
    );
    return {
      code: framework.code,
      name: framework.name,
      jurisdiction: framework.jurisdiction,
      version: framework.version,
      sourceUrl: framework.source_url,
      outcomesCount: frameworkOutcomes.length,
      mappingsCount: frameworkMappings.length,
      assessedMappingsCount: frameworkMappings.filter(
        (mapping) => mapping.alignment_strength === 'assessed'
      ).length,
      outcomeTypes: typeCounts
    };
  });

  return {
    frameworks,
    totals: {
      outcomes: outcomes.length,
      mappings: mappings.length,
      assessedMappings: mappings.filter(
        (mapping) => mapping.alignment_strength === 'assessed'
      ).length
    }
  };
}

module.exports = { getCurriculumSummary };
