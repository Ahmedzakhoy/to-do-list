const parentAddForm = document.querySelector("form");
const overlay = document.querySelector(".overlay");
import { data, dateFormatOptions, showAndSortFunction } from "./script.js";

////////////////////////////////////////////
// helper functions exported to be used in main script
////////////////////////////////////////////

export function removeAllSelectAttributesAndAddActive(options, value) {
  options.forEach((el) => {
    el.removeAttribute("selected");
  });
  [...options.filter((el) => el.value === value)][0].setAttribute(
    "selected",
    "true"
  );
}

export function setSelectedImportance(importance, el) {
  el.querySelectorAll("option").forEach((el) => el.removeAttribute("selected"));

  const selectedBoxOption = el.querySelector(`option[value="${importance}"]`);
  selectedBoxOption.setAttribute("selected", "true");
}

export function makeImportanceStatement(importance) {
  if (importance === 1) {
    return "Not Important";
  } else if (importance === 2) {
    return "Important";
  } else if (importance === 3) {
    return "Highly Important";
  }
}

export function changeTheme(importance, el) {
  if (importance === 1) {
    changeThemeNotImportant(el);
  } else if (importance === 2) {
    changeThemeImportant(el);
  } else if (importance === 3) {
    changeThemeHighlyImportant(el);
  }
}

export function changeDoneTheme(el) {
  removeImportantClass(el);
  removeHighlyImportantClass(el);
  removeNotImportantClass(el);
  const infoBoxes = [...el.querySelector(".info").children];
  el.classList.add("done-main-border-color", "done-main-bg-color");
  infoBoxes.forEach((el) => el.classList.add("done-main-bg-color"));
}

export const doneBtnHandler = function (event) {
  const doneBtn = event.target.closest(".accomplished");
  if (!doneBtn) return;
  const box = event.target.closest(".box");
  const icon = box.querySelector(".done-icon");
  const timer = box.querySelector(".timer");
  const stateEl = box.querySelector(".state");
  const importanceDropdown = box.querySelector(".select-dropdown");
  const id = +box.getAttribute("id");
  const index = data.findIndex((x) => x.id === id);
  data[index].state = "done";
  data[index].accomplishDate = Date.now();
  const accomplishDate = data[index].accomplishDate;
  const state = data[index].state;
  importanceDropdown.setAttribute("disabled", "");
  doneBtn.remove();
  stateEl.textContent = `state: ${state}`;
  timer.innerHTML = ` accomplished on: <span class="timeEl">${new Intl.DateTimeFormat(
    "en-GB",
    dateFormatOptions
  ).format(accomplishDate)}</span>`;
  changeDoneTheme(box);
  icon.style.display = "block";
  showAndSortFunction();
};

export const cancelBtnHandler = function (event) {
  const cancelBtn = event.target.closest(".cancel");
  if (!cancelBtn) return;
  const box = event.target.closest(".box");
  const id = +box.getAttribute("id");
  data.splice(
    data.findIndex((x) => x.id === id),
    1
  );
  box.remove();
};
export function changeImportanceBtnHandler(event) {
  const dropdown = event.target.closest(".select-dropdown");
  if (!dropdown) return;
  const box = event.target.closest(".box");
  const importanceEl = box.querySelector(".importance");
  const id = +box.getAttribute("id");
  const value = +dropdown.value;
  const importanceStatement = makeImportanceStatement(value);
  data.find((x) => x.id === id).importance = value;
  data.find((x) => x.id === id).importanceStatement = importanceStatement;
  importanceEl.textContent = importanceStatement;
  changeTheme(value, box);
  setSelectedImportance(value, box);
}
export const endDateCreator = function (timescale, date) {
  const oneDay = 1000 * 60 * 60 * 24;
  if (timescale === "daily") {
    return +date + oneDay;
  } else if (timescale === "weekly") {
    return +date + oneDay * 7;
  } else if (timescale === "monthly") {
    return +date + oneDay * 30;
  }
};

export function hideForm() {
  overlay.classList.add("hidden");
  parentAddForm.classList.add("hidden");
}

function changeThemeImportant(el) {
  const infoBoxes = [...el.querySelector(".info").children];

  removeNotImportantClass(el);
  removeHighlyImportantClass(el);
  el.classList.add("important-main-bg-color", "important-main-border-color");
  infoBoxes.forEach((el) => el.classList.add("important-main-border-color"));
}
function changeThemeHighlyImportant(el) {
  const infoBoxes = [...el.querySelector(".info").children];

  removeImportantClass(el);
  removeNotImportantClass(el);
  el.classList.add(
    "highly-important-main-bg-color",
    "highly-important-main-border-color"
  );
  infoBoxes.forEach((el) =>
    el.classList.add("highly-important-main-border-color")
  );
}

function changeThemeNotImportant(el) {
  const infoBoxes = [...el.querySelector(".info").children];
  removeImportantClass(el);
  removeHighlyImportantClass(el);
  el.classList.add(
    "not-important-main-bg-color",
    "not-important-main-border-color"
  );
  infoBoxes.forEach((el) =>
    el.classList.add("not-important-main-border-color")
  );
}

function removeImportantClass(el) {
  const infoBoxes = [...el.querySelector(".info").children];
  el.classList.remove("important-main-bg-color", "important-main-border-color");
  infoBoxes.forEach((el) => el.classList.remove("important-main-border-color"));
}
function removeNotImportantClass(el) {
  const infoBoxes = [...el.querySelector(".info").children];

  el.classList.remove(
    "not-important-main-bg-color",
    "not-important-main-border-color"
  );
  infoBoxes.forEach((el) =>
    el.classList.remove("not-important-main-border-color")
  );
}
function removeHighlyImportantClass(el) {
  const infoBoxes = [...el.querySelector(".info").children];
  el.classList.remove(
    "highly-important-main-bg-color",
    "highly-important-main-border-color"
  );
  infoBoxes.forEach((el) =>
    el.classList.remove("highly-important-main-border-color")
  );
}
