/**
 * 11 LD – JavaScript formos
 * Visi šio laboratorinio darbo JavaScript pakeitimai aprašyti tik šiame faile.
 */
(function () {
  "use strict";

  const form = document.getElementById("contactForm");
  if (!form) return; // kituose puslapiuose forma neegzistuoja

  const submitBtn = document.getElementById("submitBtn");
  const clearBtn = document.getElementById("clearBtn");
  const resultBox = document.getElementById("formResult");

  const fieldNames = ["firstName", "lastName", "email", "phone", "address", "rating1", "rating2", "rating3"];
  const fields = {};
  fieldNames.forEach(function (name) {
    fields[name] = document.getElementById(name);
  });

  /* ---------- Validacijos taisyklės ---------- */

  const NAME_RE = /^\p{L}+$/u;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^\+370 6\d{2} \d{5}$/;

  // Kiekviena funkcija grąžina klaidos tekstą arba "" jei reikšmė teisinga
  const validators = {
    firstName: function (v) {
      if (!v.trim()) return "Įveskite vardą.";
      if (!NAME_RE.test(v.trim())) return "Vardą gali sudaryti tik raidės.";
      return "";
    },
    lastName: function (v) {
      if (!v.trim()) return "Įveskite pavardę.";
      if (!NAME_RE.test(v.trim())) return "Pavardę gali sudaryti tik raidės.";
      return "";
    },
    email: function (v) {
      if (!v.trim()) return "Įveskite el. pašto adresą.";
      if (!EMAIL_RE.test(v.trim())) return "Neteisingas el. pašto formatas (pvz., vardas@pastas.lt).";
      return "";
    },
    phone: function (v) {
      if (!PHONE_RE.test(v)) return "Įveskite numerį formatu +370 6xx xxxxx.";
      return "";
    },
    address: function (v) {
      if (!v.trim()) return "Įveskite adresą.";
      return "";
    },
    rating: function (v) {
      if (!v.trim()) return "Įveskite įvertinimą.";
      if (!/^\d+$/.test(v.trim())) return "Įvertinimas turi būti sveikas skaičius.";
      const n = Number(v);
      if (n < 1 || n > 10) return "Įvertinimas turi būti nuo 1 iki 10.";
      return "";
    }
  };

  function getValidator(name) {
    return name.indexOf("rating") === 0 ? validators.rating : validators[name];
  }

  /* ---------- Klaidų rodymas ---------- */

  function showError(name, message) {
    const input = fields[name];
    const feedback = input.parentElement.querySelector(".invalid-feedback");
    if (message) {
      input.classList.add("is-invalid");
      input.classList.remove("is-valid");
      feedback.textContent = message;
    } else {
      input.classList.remove("is-invalid");
      if (input.value.trim() !== "") input.classList.add("is-valid");
      feedback.textContent = "";
    }
  }

  function validateField(name) {
    const message = getValidator(name)(fields[name].value);
    showError(name, message);
    return message === "";
  }

  // Tikrina visą formą nerodydama klaidų (naudojama mygtuko būsenai)
  function isFormValid() {
    return fieldNames.every(function (name) {
      return getValidator(name)(fields[name].value) === "";
    });
  }

  function updateSubmitState() {
    submitBtn.disabled = !isFormValid();
  }

  /* ---------- Telefono numerio formatavimas ---------- */

  // Palieka tik skaitmenis ir sudaro +370 6xx xxxxx
  function formatPhone(raw) {
    let digits = raw.replace(/\D/g, "");

    if (digits.startsWith("370")) digits = digits.slice(3);       // +370 prefiksas
    else if (digits.startsWith("86")) digits = digits.slice(1);   // 8 6xx xxxxx formatas

    if (digits.length > 0 && digits[0] !== "6") digits = digits.slice(1); // lietuviški mobilieji prasideda 6
    digits = digits.slice(0, 8);

    if (digits.length === 0) return "+370 ";
    let out = "+370 " + digits.slice(0, 3);
    if (digits.length > 3) out += " " + digits.slice(3);
    return out;
  }

  fields.phone.addEventListener("input", function () {
    fields.phone.value = formatPhone(fields.phone.value);
  });

  fields.phone.addEventListener("focus", function () {
    if (fields.phone.value === "") fields.phone.value = "+370 ";
  });

  fields.phone.addEventListener("blur", function () {
    if (fields.phone.value.trim() === "+370") {
      fields.phone.value = "";
      fields.phone.classList.remove("is-invalid", "is-valid");
      fields.phone.parentElement.querySelector(".invalid-feedback").textContent = "";
      if (touched.phone) showError("phone", validators.phone(""));
    }
  });

  /* ---------- Įvykių klausytojai (realiu laiku) ---------- */

  const touched = {};

  fieldNames.forEach(function (name) {
    const input = fields[name];

    input.addEventListener("input", function () {
      touched[name] = true;
      validateField(name);
      updateSubmitState();
    });

    input.addEventListener("blur", function () {
      touched[name] = true;
      if (name === "phone" && input.value === "") return;
      validateField(name);
      updateSubmitState();
    });
  });

  /* ---------- Formos pateikimas ---------- */

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // puslapis neperkraunamas

    // papildoma apsauga, jei mygtukas kaip nors būtų paspaustas su klaidomis
    let valid = true;
    fieldNames.forEach(function (name) {
      if (!validateField(name)) valid = false;
    });
    if (!valid) {
      updateSubmitState();
      return;
    }

    // Surenkame duomenis į objektą
    const data = {
      vardas: fields.firstName.value.trim(),
      pavarde: fields.lastName.value.trim(),
      elPastas: fields.email.value.trim(),
      telefonas: fields.phone.value,
      adresas: fields.address.value.trim(),
      klausimas1: Number(fields.rating1.value),
      klausimas2: Number(fields.rating2.value),
      klausimas3: Number(fields.rating3.value)
    };

    console.log(data);

    const average = (data.klausimas1 + data.klausimas2 + data.klausimas3) / 3;
    renderResult(data, average);
  });

  function renderResult(data, average) {
    const lines = [
      "Vardas: " + data.vardas,
      "Pavardė: " + data.pavarde,
      "El. paštas: " + data.elPastas,
      "Tel. numeris: " + data.telefonas,
      "Adresas: " + data.adresas,
      "1 klausimas: " + data.klausimas1,
      "2 klausimas: " + data.klausimas2,
      "3 klausimas: " + data.klausimas3
    ];

    resultBox.innerHTML = "";

    lines.forEach(function (line) {
      const p = document.createElement("p");
      p.textContent = line; // textContent apsaugo nuo HTML injekcijos
      resultBox.appendChild(p);
    });

    const avg = document.createElement("p");
    avg.className = "result-average";
    avg.textContent = data.vardas + " " + data.pavarde + ": " + average.toFixed(1);
    resultBox.appendChild(avg);

    resultBox.hidden = false;
  }

  /* ---------- Formos išvalymas ---------- */

  function clearForm() {
    form.reset();
    fieldNames.forEach(function (name) {
      touched[name] = false;
      fields[name].classList.remove("is-invalid", "is-valid");
      fields[name].parentElement.querySelector(".invalid-feedback").textContent = "";
    });
    resultBox.innerHTML = "";
    resultBox.hidden = true;
    updateSubmitState();
  }

  clearBtn.addEventListener("click", clearForm);

  updateSubmitState();
})();
