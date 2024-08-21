import { options } from "../util.js";

const populateSelectOptions = () => {
  document.querySelectorAll("select").forEach((select) => {
    for (var i = 1; i <= 99; i++) {
      let option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      select.appendChild(option);
    }
  });
};

const restoreOptions = () => {
  populateSelectOptions();
  chrome.storage.local.get(options, (items) => {
    for (let key in items) {
      let option = document.getElementById(key);
      if (option.type === "checkbox") {
        option.checked = items[key];
      } else {
        option.value = items[key];
      }
    }
  });
};

const updateOption = (option) => {
  option.addEventListener("change", () => {
    if (option.type === "checkbox") {
      chrome.storage.local.set({
        [option.id]: option.checked,
      });
    } else {
      chrome.storage.local.set({
        [option.id]: option.value,
      });
    }
  });
};

const exportData = () => {
  chrome.storage.local.get(null, (items) => {
    let json = JSON.stringify(items);
    let blob = new Blob([json], { type: "application/json" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.setAttribute("download", "multi-notes.json");
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });
};

const importData = (event) => {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = (e) => {
      let json = JSON.parse(e.target.result);
      chrome.storage.local.set(json, () => {
        chrome.runtime.sendMessage({ refresh: "0" }, () => {
          if (chrome.runtime.lastError) return;
        });
      });
    };
    reader.readAsText(file);
  }
};

document.addEventListener("DOMContentLoaded", restoreOptions);

document.querySelectorAll(".option").forEach((option) => {
  updateOption(option);
});

document.getElementById("exportAll").addEventListener("click", () => {
  exportData();
});

document.getElementById("importAll").addEventListener("click", () => {
  document.getElementById("pickFile").click();
});

document.getElementById("pickFile").addEventListener("change", (event) => {
  importData(event);
});
