"use strict";
////////////////////////////////////////////
// import helper functions
////////////////////////////////////////////
import * as helpers from "./helpers.js";

////////////////////////////////////////////
// start global varianles and DOM selections
////////////////////////////////////////////
//global variables
export let data = [];
let config = {
  showOnly: "all",
  sort: "time",
};
let filteredData, formImportanceValue, formTimescaleValue;
let filteredAndSortedData = [];
let now = Date.now();

//now date update every second function
setInterval(function () {
  now = Date.now();
}, 1000);

//date format options object
export const dateFormatOptions = {
  hour: "numeric",
  minute: "numeric",
  day: "numeric",
  month: "numeric", // numeric,long, 2-digit
  year: "numeric", //numeric, 2-digit,
  weekday: "short", //long, short, narrow
};

//form strucutre string to be re-rendered after displaying success message
const formHTML = `
<i class="fa-solid fa-xmark close-modal"></i>
<textarea
  name="add-task"
  id="add-task"
  placeholder="write your task here"
  required
></textarea>
<div class="add-info">
  <div class="add-timescale">
    <label for="add-timescale">Choose timescale:</label>
    <select
      class="timescale-dropdown"
      name="add-timescale"
      id="add-timescale"
      required
    >
      <option selected="true" value="daily">daily</option>
      <option value="weekly">weekly</option>
      <option value="monthly">monthly</option>
    </select>
  </div>
  <div class="add-importance-change">
    <label for="add-importance">Choose Importance:</label>
    <select
      class="add-select-dropdown"
      name="add-importance"
      id="add-importance"
      required
    >
      <option  value="1">not important</option>
      <option selected="true" value="2">important</option>
      <option value="3">highly important</option>
    </select>
  </div>

  <input type="submit" value="Add" />
</div>
`;

//selections from the DOM
const container = document.querySelector(".container");
const parentAddForm = document.querySelector("form");
const overlay = document.querySelector(".overlay");
const closeModal = document.querySelector(".close-modal");
const textarea = document.querySelector("textarea");
const options = document.querySelector(".options");
const clear = document.querySelector(".clear");
const optionsShowOnlyDropdown = [
  ...document.querySelector(".show-only-dropdown").querySelectorAll("option"),
];
const optionsSortDropdown = [
  ...document.querySelector(".sort-dropdown").querySelectorAll("option"),
];

////////////////////////////////////////////
// sort and filter data function
////////////////////////////////////////////

export function filterDataFunction() {
  if (config.showOnly === "all") {
    filteredData = data;
  } else if (
    config.showOnly === "Important" ||
    config.showOnly === "Highly Important"
  ) {
    filteredData = data.filter((sample) => {
      return sample.importanceStatement === config.showOnly;
    });
  } else if (config.showOnly === "done" || config.showOnly === "not done") {
    if (config.showOnly === "done") {
      filteredData = data.filter((sample) => {
        return sample.state === config.showOnly;
      });
    } else if (config.showOnly === "not done") {
      filteredData = data.filter((sample) => {
        return sample.state === "yet";
      });
    }
  } else if (
    config.showOnly === "daily" ||
    config.showOnly === "weekly" ||
    config.showOnly === "monthly"
  ) {
    filteredData = data.filter((sample) => {
      return sample.timescale === config.showOnly;
    });
  }
  helpers.removeAllSelectAttributesAndAddActive(
    optionsShowOnlyDropdown,
    config.showOnly
  );
}

export function sortDatafunction() {
  if (config.sort === "time") {
    filteredAndSortedData = filteredData.sort(
      (current, next) => current.creationDate - next.creationDate
    );
  } else if (config.sort === "importance") {
    filteredAndSortedData = filteredData.sort(
      (current, next) => next.importance - current.importance
    );
  }
  helpers.removeAllSelectAttributesAndAddActive(
    optionsSortDropdown,
    config.sort
  );
}

////////////////////////////////////////////
// start event handlers
////////////////////////////////////////////

//show only options change event handler
options.addEventListener("change", function (event) {
  const showOnlyDropdown = event.target.closest(".show-only-dropdown");
  if (!showOnlyDropdown) return;
  config.showOnly = showOnlyDropdown.value;
  filterDataFunction();
  storeData();
  showAndSortFunction();
});

// sort options change event handler
options.addEventListener("change", function (event) {
  const sortDropdown = event.target.closest(".sort-dropdown");
  if (!sortDropdown) return;
  const options = [...sortDropdown.querySelectorAll("option")];
  config.sort = sortDropdown.value;
  sortDatafunction();
  storeData();
  showAndSortFunction();
});

//remove button event listener
container.addEventListener("click", function (event) {
  helpers.cancelBtnHandler(event);
  storeData();
});
//done button event listener
container.addEventListener("click", function (event) {
  helpers.doneBtnHandler(event);
  storeData();
});
//change importance dropdown event listener
container.addEventListener("change", function (event) {
  helpers.changeImportanceBtnHandler(event);
  storeData();
  showAndSortFunction();
});
//show  and hide form event listeners
document.querySelector(".add-btn").addEventListener("click", function () {
  parentAddForm.classList.remove("hidden");
  overlay.classList.remove("hidden");
});
overlay.addEventListener("click", helpers.hideForm);
closeModal.addEventListener("click", helpers.hideForm);

//change in form dropdowns values listeners
parentAddForm.addEventListener("change", function () {
  const addSelectDropdown = this.querySelector(".add-select-dropdown");
  const timeScaleDropdown = this.querySelector(".timescale-dropdown");
  if (!addSelectDropdown && !timeScaleDropdown) return;
  formImportanceValue = addSelectDropdown.value;
  formTimescaleValue = timeScaleDropdown.value;
});

//form submit event listener
parentAddForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const successMessage = " 🎉✔✔✔🎉 task added successfully!";
  const task = makeTask(
    textarea.value,
    +formImportanceValue,
    formTimescaleValue,
    "yet"
  );
  data.push(task);

  parentAddForm.innerHTML = `<span class="success-message">${successMessage}</span>`;
  setTimeout(function () {
    helpers.hideForm();
    setTimeout(function () {
      parentAddForm.innerHTML = formHTML;
    }, 1000);
  }, 1000);
  storeData();
});
//clear all button event listener
clear.addEventListener("click", function () {
  const option = window.confirm("Are You Sure? all data will be deleted");
  if (!option) return;
  localStorage.clear();
  container.innerHTML = "";
  location.reload();
});
////////////////////////////////////////////
// making tasks and rendering them to the DOM
////////////////////////////////////////////
//the core functionality of making tasks and rendering them to the page
function makeTask(task, importance, timescale, state, id = 0) {
  const dataSample = {
    id: id ? +id : +Date.now(),
    task: task,
    importance: importance,
    importanceStatement: helpers.makeImportanceStatement(importance),
    timescale: timescale,
    state: state,
  };
  dataSample.creationDate = +Date.now();
  dataSample.endDate = helpers.endDateCreator(
    dataSample.timescale,
    dataSample.creationDate
  );

  function renderBox() {
    const html = `
      <div class="box" id="${dataSample.id}">
      <i class="fa-solid fa-circle-check done-icon"></i>

          <div class="btns">
              <div class="cancel btn">👎⛔ remove!</div>
              <div class="accomplished btn">💪🎉 Done!</div>
          </div>
          <div class="importance-change">
              <label for="importance">Choose Importance:</label>
              <select class="select-dropdown" name="importance" id="importance">
              <option value="1" >not important</option>
              <option value="2">important</option>
              <option value="3">highly important</option>
              </select>
          </div>  
          <p class="task">${dataSample.task}</p>
          <div class="info">
              <div class="state">state: ${dataSample.state}</div>
              <div class="importance">${dataSample.importanceStatement}</div>
              <div class="remain-time">${dataSample.timescale}</div>
          </div>
          <div class="timer">
          remaining time:
          <span class="timeEl">wait, calculating...</span>
          </div>
      </div>
      `;
    container.insertAdjacentHTML("beforeend", html);
    const el = document.getElementById(`${dataSample.id}`);
    helpers.setSelectedImportance(importance, el);
    helpers.changeTheme(importance, el);
  }
  renderBox();
  return dataSample;
}

////////////////////////////////////////////
// main function to be implemented at first
// initialize function
////////////////////////////////////////////
function init() {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const userConfig = JSON.parse(localStorage.getItem("userConfig"));
  if (!userData) return;
  data = userData;
  config = userConfig;
  filterDataFunction();
  sortDatafunction();
  // container.innerHTML = "";
  for (const task of filteredAndSortedData) {
    if (task.state === "yet" || task.state === "expired") {
      makeTask(task.task, task.importance, task.timescale, task.state, task.id);
    } else if (task.state === "done") {
      makeTask(task.task, task.importance, task.timescale, task.state, task.id);
      const box = document.getElementById(`${task.id}`);
      const doneBtn = box.querySelector(".accomplished");
      const icon = box.querySelector(".done-icon");
      const timer = box.querySelector(".timer");
      const stateEl = box.querySelector(".state");
      const importanceDropdown = box.querySelector(".select-dropdown");
      const accomplishDate = task.accomplishDate;
      const state = task.state;
      importanceDropdown.setAttribute("disabled", "");
      doneBtn.remove();
      stateEl.textContent = `state: ${state}`;
      timer.innerHTML = ` accomplished on: <span class="timeEl">${new Intl.DateTimeFormat(
        "en-GB",
        dateFormatOptions
      ).format(accomplishDate)}</span>`;
      helpers.changeDoneTheme(box);
      icon.style.display = "block";
    }
  }
}
//calling the init function
init();

////////////////////////////////////////////
// main function to change view when sort and filter functionality is used
////////////////////////////////////////////
export function showAndSortFunction() {
  filterDataFunction();
  sortDatafunction();
  container.innerHTML = "";
  for (const task of filteredAndSortedData) {
    if (task.state === "yet" || task.state === "expired") {
      makeTask(task.task, task.importance, task.timescale, task.state, task.id);
    } else if (task.state === "done") {
      makeTask(task.task, task.importance, task.timescale, task.state, task.id);
      const box = document.getElementById(`${task.id}`);
      const doneBtn = box.querySelector(".accomplished");
      const icon = box.querySelector(".done-icon");
      const timer = box.querySelector(".timer");
      const stateEl = box.querySelector(".state");
      const importanceDropdown = box.querySelector(".select-dropdown");
      const accomplishDate = task.accomplishDate;
      const state = task.state;
      importanceDropdown.setAttribute("disabled", "");
      doneBtn.remove();
      stateEl.textContent = `state: ${state}`;
      timer.innerHTML = ` accomplished on: <span class="timeEl">${new Intl.DateTimeFormat(
        "en-GB",
        dateFormatOptions
      ).format(accomplishDate)}</span>`;
      helpers.changeDoneTheme(box);
      icon.style.display = "block";
    }
  }
}
////////////////////////////////////////////
// function to update the timers
////////////////////////////////////////////
//update timer every 100 milliseconds
setInterval(function () {
  filteredAndSortedData.forEach((sample) => {
    if (sample.state === "done") return;
    sample.remainingTime = sample.endDate - now;
    const box = document.getElementById(`${sample.id}`);
    if (sample.remainingTime > 0) {
      const timeEl = box.querySelector(".timeEl");
      const remainDays = Math.trunc(
        sample.remainingTime / (1000 * 60 * 60 * 24)
      );
      const remainHours = Math.trunc(
        (sample.remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const remainMinutes = Math.trunc(
        (sample.remainingTime % (1000 * 60 * 60)) / (1000 * 60)
      );
      const text = `
    ${remainDays} d : ${remainHours} h : ${remainMinutes} min
`;
      timeEl.textContent = text;
    } else {
      const timer = box.querySelector(".timer");
      const stateEl = box.querySelector(".state");
      const doneBtn = box.querySelector(".accomplished");
      const importanceDropdown = box.querySelector(".select-dropdown");
      sample.expiryDate = sample.endDate;
      sample.state = "expired";
      const expiryDate = sample.expiryDate;
      const state = sample.state;
      importanceDropdown.setAttribute("disabled", "");
      doneBtn?.remove();
      stateEl.textContent = `state: ${state}`;
      timer.innerHTML = ` Expired on: <span class="timeEl">${new Intl.DateTimeFormat(
        "en-GB",
        dateFormatOptions
      ).format(expiryDate)}</span>`;
      helpers.changeDoneTheme(box);
    }
  });
}, 100);

////////////////////////////////////////////
// store data function
////////////////////////////////////////////
const storeData = function () {
  localStorage.setItem("userData", JSON.stringify(data));
  localStorage.setItem("userConfig", JSON.stringify(config));
};
