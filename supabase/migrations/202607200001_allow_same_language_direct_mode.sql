-- =========================================================
-- 202607200001_allow_same_language_direct_mode.sql
-- =========================================================
-- Allows bridge_language to equal preferred_language (spec: "PERMITIR L1 =
-- L2"). This is the direct/immersion learning mode (e.g. English->English,
-- French->French, Spanish->Spanish) - the platform interface and support
-- text stay in that one language instead of bridging to a different L1.
-- Safe to run more than once.

alter table public.profiles
  drop constraint if exists profiles_bridge_not_target_check;

comment on column public.profiles.bridge_language is
  'Language the learner wants the platform/explanations in. May equal preferred_language (the target language being learned) for direct/immersion mode - see src/js/language-pair.js getLearningMode().';
