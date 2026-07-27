# Curriculum Mapping Layer

ANDERGO keeps the learner experience and academic reporting as separate projections of the same activities.

## Student projection

The normal route reads `courses`, `course_units`, `course_lessons`, progress and rewards. It shows a journey title, a communicative mission, useful outcomes, progress and XP. It does not query or expose curriculum tables.

## Teacher/reporting projection

Server-side reporting may join an activity with:

- CEFR descriptors;
- MINERD fundamental and specific competencies;
- achievement indicators;
- communicative functions;
- learning objectives;
- conceptual, procedural and attitudinal content;
- expected evidence and alignment strength.

The tables `curriculum_frameworks`, `curriculum_outcomes` and `curriculum_activity_mappings` have no anonymous or student RLS policy. Only the service role can access them. A future teacher endpoint must authorize the teacher before returning a purpose-built report; it must never attach raw curriculum mappings to the student course payload.

## Mapping rule

Each mapping targets exactly one course, unit or lesson. Use:

- `primary` when the activity directly teaches the outcome;
- `supporting` when it reinforces the outcome;
- `assessed` when it produces evidence used to measure the outcome.

This separation preserves a task-based, communicative learner experience while allowing complete MINERD and CEFR reporting behind the scenes.
