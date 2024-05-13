import { options } from '../util.js';

const populateSelectOptions = () => {
    document.querySelectorAll("select").forEach((select) => {
        for (var i = 1; i <= 100; i++) {
            let option = document.createElement("option");
            option.value = i;
            option.textContent = i;
            select.appendChild(option);
        }
    });
}

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
}

const updateOption = (option) => {
    option.addEventListener("change", () => {
        if (option.type === "checkbox") {
            chrome.storage.local.set({
                [option.id]: option.checked
            });
        } else {
            chrome.storage.local.set({
                [option.id]: option.value
            });
        }
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);

document.querySelectorAll(".option").forEach((option) => {
    updateOption(option);
});
