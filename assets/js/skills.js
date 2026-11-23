/* 12 LD. IGUDZIU PROGRESO LENTA (JavaScript) */

(() => {
  "use strict";

  /* 1. IGUDZIU DUOMENYS (pradines busenos) */

  const initialSkills = [
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

  const statuses = ["Planuojama", "Mokomasi", "Atlikta"];

  /* 3. LYGIAI IR RANGAI */

  const levels = [
    { min: 0, level: 1, rank: "Pradedantysis" },
    { min: 50, level: 2, rank: "Praktikantas" },
    { min: 150, level: 3, rank: "Specialistas" },
    { min: 300, level: 4, rank: "Profesionalas" }
  ];

  /* 4. LOCAL STORAGE */

  const STORAGE_KEY = "skillStatuses";

  // Issaugo tik busenas (pagal igudzio pavadinima)
  function saveStatuses() {
    try {
      const data = {};
      skills.forEach(skill => {
        data[skill.name] = skill.status;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Nepavyko issaugoti i Local Storage:", error);
    }
  }

  // Atkuria busenas; jei duomenu nera ar jie blogi – lieka pradines
  function loadSkills() {
    const loaded = initialSkills.map(skill => ({ ...skill }));

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return loaded;

      const saved = JSON.parse(raw);

      loaded.forEach(skill => {
        if (statuses.includes(saved[skill.name])) {
          skill.status = saved[skill.name];
        }
      });
    } catch (error) {
      console.warn("Nepavyko nuskaityti Local Storage:", error);
    }

    return loaded;
  }

  const skills = loadSkills();

  /* 5. DOM ELEMENTAI */

  const board = document.getElementById("skill-board");
  const totalXpEl = document.getElementById("total-xp");
  const levelEl = document.getElementById("current-level");
  const rankEl = document.getElementById("current-rank");
  const levelLabelEl = document.getElementById("skill-level-label");
  const track = document.getElementById("xp-progress-track");
  const fill = document.getElementById("xp-progress-fill");
  const progressLabel = document.getElementById("xp-progress-label");
  const skillCountEl = document.getElementById("skill-count");
  const completedCountEl = document.getElementById("completed-count");
  const percentEl = document.getElementById("progress-percent");

  /* 6. FUNKCIJOS */

  // Bendra XP – tik "Atlikta" busenos igudziai
  function calculateTotalXP() {
    return skills
      .filter(skill => skill.status === "Atlikta")
      .reduce((sum, skill) => sum + skill.xp, 0);
  }

  // Esamas ir kitas lygis pagal XP
  function getLevelInfo(totalXP) {
    const current = [...levels].reverse().find(item => totalXP >= item.min);
    const next = levels.find(item => item.min > totalXP) || null;
    return { current, next };
  }

  // Igudzio busenos keitimas
  function changeStatus(skillName, newStatus) {
    const skill = skills.find(item => item.name === skillName);

    if (!skill || !statuses.includes(newStatus)) return;

    skill.status = newStatus;
    saveStatuses();
    updateAll();
  }

  // Vienos korteles sukurimas
  function createSkillCard(skill) {
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

    const selectId = `status-${skill.name.replace(/\s+/g, "-")}`;

    const selectLabel = document.createElement("label");
    selectLabel.className = "skill-status-label";
    selectLabel.htmlFor = selectId;
    selectLabel.textContent = "Keisti būseną:";

    const select = document.createElement("select");
    select.className = "skill-status-select";
    select.id = selectId;

    statuses.forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = status === skill.status;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      changeStatus(skill.name, select.value);
    });

    card.append(name, meta, selectLabel, select);
    return card;
  }

  // Kanban lentos atvaizdavimas pagal masyvo duomenis
  function renderBoard() {
    board.innerHTML = "";

    statuses.forEach(status => {
      const column = document.createElement("section");
      column.className = "skill-column";

      const items = skills.filter(skill => skill.status === status);

      const heading = document.createElement("h2");
      heading.textContent = `${status} (${items.length})`;
      column.appendChild(heading);

      items.forEach(skill => {
        column.appendChild(createSkillCard(skill));
      });

      board.appendChild(column);
    });
  }

  // XP, lygio ir rango atnaujinimas
  function updateXPInfo(totalXP, current) {
    totalXpEl.textContent = `${totalXP} XP`;
    levelEl.textContent = current.level;
    rankEl.textContent = current.rank;
    levelLabelEl.textContent = `${current.level} lygis – ${current.rank}`;
  }

  // Progreso juostos atnaujinimas
  function updateProgressBar(totalXP, current, next) {
    if (next) {
      const gained = totalXP - current.min;
      const needed = next.min - current.min;
      const pct = Math.min(100, Math.round((gained / needed) * 100));

      fill.style.width = `${pct}%`;
      progressLabel.textContent =
        `${gained} / ${needed} XP (iki ${next.level} lygio)`;
      track.setAttribute("aria-valuenow", String(pct));
    } else {
      fill.style.width = "100%";
      progressLabel.textContent = "Pasiektas aukščiausias lygis";
      track.setAttribute("aria-valuenow", "100");
    }
  }

  // Statistikos atnaujinimas
  function updateStatistics() {
    const total = skills.length;
    const completed = skills.filter(skill => skill.status === "Atlikta").length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    skillCountEl.textContent = total;
    completedCountEl.textContent = completed;
    percentEl.textContent = `${percent}%`;
  }

  // Visko perskaiciavimas ir perpiesimas
  function updateAll() {
    const totalXP = calculateTotalXP();
    const { current, next } = getLevelInfo(totalXP);

    renderBoard();
    updateXPInfo(totalXP, current);
    updateProgressBar(totalXP, current, next);
    updateStatistics();
  }

  /* 7. PRADZIA */

  updateAll();
})();
