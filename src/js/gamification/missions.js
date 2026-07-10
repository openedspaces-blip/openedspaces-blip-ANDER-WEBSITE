// src/js/gamification/missions.js
// Daily mission pool and progress tracking for the client-side gamification engine.
(function () {
  const G = window.__andergoGamification;

  const MISSION_POOL = [
    { id: 'complete-lesson', label: 'Completa 1 lección hoy', target: 1, xpReward: 15 },
    { id: 'correct-answers', label: 'Responde 3 ejercicios correctamente', target: 3, xpReward: 15 },
    { id: 'practice-skills', label: 'Practica 2 habilidades distintas', target: 2, xpReward: 15 },
    { id: 'explore-language', label: 'Explora otro idioma', target: 1, xpReward: 10 }
  ];

  G.ensureDailyMissions = function ensureDailyMissions() {
    const today = G.todayIso();
    if (G.state.missions?.date === today) return;

    // Reset "today" counters and pick 3 fresh missions.
    G.state.skillsTouchedToday = [];
    G.state.correctAnswersToday = 0;
    G.state.languagesTouchedToday = [];
    const shuffled = [...MISSION_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    G.state.missions = {
      date: today,
      items: shuffled.map((mission) => ({ ...mission, progress: 0, done: false }))
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
