// src/js/gamification/missions.js
// Daily mission pool and progress tracking for the client-side gamification engine.
(function () {
  const G = window.__andergoGamification;

  const DAILY_MISSIONS = [
    { id: 'complete-lesson', label: 'Completa la actividad recomendada', target: 1, xpReward: 15 },
    {
      id: 'correct-answers',
      label: 'Responde 3 ejercicios correctamente',
      target: 3,
      xpReward: 15
    },
    { id: 'practice-skills', label: 'Practica 2 habilidades distintas', target: 2, xpReward: 15 }
  ];

  G.ensureDailyMissions = function ensureDailyMissions() {
    const today = G.todayIso();
    if (G.state.missions?.date === today && G.state.missions?.version === 2) return;

    // Keep the goals predictable and pedagogical: continuity, successful
    // practice and variety. Navigation by itself should not earn a reward.
    G.state.skillsTouchedToday = [];
    G.state.correctAnswersToday = 0;
    G.state.languagesTouchedToday = [];
    G.state.missions = {
      date: today,
      version: 2,
      items: DAILY_MISSIONS.map((mission) => ({ ...mission, progress: 0, done: false }))
    };
    G.persist();
  };

  G.updateMissionProgress = function updateMissionProgress(missionId, incrementBy = 1) {
    const mission = G.state.missions.items.find((item) => item.id === missionId);
    if (!mission || mission.done) return;
    mission.progress = Math.min(mission.target, mission.progress + incrementBy);
    if (mission.progress >= mission.target) {
      mission.done = true;
      G.addXp(mission.xpReward, `Misión completada: ${mission.label}`);
      G.notify('mission-complete', mission);
    }
    G.persist();
    G.render();
  };
})();
