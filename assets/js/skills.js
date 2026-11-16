
/* 10. IGUDZIU PROGRESO LENTA */

(() => {
  "use strict";

  /* 1. IGUDZIU DUOMENYS */

  const skills = [
    { name: "HTML", status: "Atlikta", xp: 50 },
    { name: "CSS", status: "Mokomasi", xp: 45 },
    { name: "JavaScript", status: "Mokomasi", xp: 35 },
    { name: "Bootstrap", status: "Planuojama", xp: 20 },
    { name: "Git ir GitHub", status: "Atlikta", xp: 40 },
    { name: "MATLAB", status: "Atlikta", xp: 60 },
    { name: "KiCad", status: "Mokomasi", xp: 55 },
    { name: "ESP32", status: "Planuojama", xp: 25 }
  ];

  /* 2. IGUDZIU BUSENOS */

  const statuses = [
    "Planuojama",
    "Mokomasi",
    "Atlikta"
  ];

  /* 3. LYGIAI IR RANGAI */

  const levels = [
    { min: 0, level: 1, rank: "Pradedantysis" },
    { min: 50, level: 2, rank: "Praktikantas" },
    { min: 150, level: 3, rank: "Specialistas" },
    { min: 300, level: 4, rank: "Profesionalas" }
  ];

  /* 4. BENDRA XP SUMA */

  const totalXP = skills.reduce(
    (sum, skill) => sum + skill.xp,
    0
  );

  const current = [...levels]
    .reverse()
    .find(item => totalXP >= item.min);

  const next = levels.find(
    item => item.min > totalXP
  );

  /* 5. STATISTIKA */

  const completed = skills.filter(
    skill => skill.status === "Atlikta"
  ).length;

  const percentCompleted = Math.round(
    (completed / skills.length) * 100
  );

  document.getElementById("total-xp").textContent =
    `${totalXP} XP`;

  document.getElementById("current-level").textContent =
    current.level;

  document.getElementById("current-rank").textContent =
    current.rank;

  document.getElementById("skill-level-label").textContent =
   `${current.level} lygis – ${current.rank}`;

  document.getElementById("skill-count").textContent =
    skills.length;

  document.getElementById("completed-count").textContent =
    completed;

  document.getElementById("progress-percent").textContent =
    `${percentCompleted}%`;

  /* 6. XP PROGRESO JUOSTA */

  const track = document.getElementById("xp-progress-track");
  const fill = document.getElementById("xp-progress-fill");
  const label = document.getElementById("xp-progress-label");

  if (next) {
    const progress = totalXP - current.min;
    const needed = next.min - current.min;

    const pct = Math.min(
      100,
      Math.round((progress / needed) * 100)
    );

    fill.style.width = `${pct}%`;

    label.textContent =
      `${progress} / ${needed} XP (iki ${next.level} lygio)`;

    track.setAttribute("aria-valuenow", String(pct));
  } else {
    fill.style.width = "100%";
    label.textContent = "Pasiektas aukščiausias lygis";
    track.setAttribute("aria-valuenow", "100");
  }

  /* 7. KANBAN LENTOS KURIMAS */

  const board = document.getElementById("skill-board");

  statuses.forEach(status => {
    const column = document.createElement("section");
    column.className = "skill-column";

    const items = skills.filter(
      skill => skill.status === status
    );

    const heading = document.createElement("h2");
    heading.textContent = `${status} (${items.length})`;

    column.appendChild(heading);

    items.forEach(skill => {
      const card = document.createElement("article");
      card.className = "skill-kanban-card";

      const name = document.createElement("h3");
      name.textContent = skill.name;

      const meta = document.createElement("p");
      meta.className = "skill-meta";

      const state = document.createElement("span");
      state.textContent = skill.status;

      const xp = document.createElement("strong");
      xp.textContent = `${skill.xp} XP`;

      meta.append(state, xp);
      card.append(name, meta);
      column.appendChild(card);
    });

    board.appendChild(column);
  });

})();
