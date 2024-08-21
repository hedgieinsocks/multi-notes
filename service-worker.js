import { options } from "./util.js";

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: "Send to Multi Notes",
    contexts: ["selection"],
    id: "parent",
  });
  chrome.storage.local.get(options, (items) => {
    for (let i = 1; i <= parseInt(items.noteNum); i++) {
      chrome.contextMenus.create({
        title: i.toString(),
        contexts: ["selection"],
        parentId: "parent",
        id: "note" + i,
      });
    }
  });
});

chrome.storage.onChanged.addListener((data) => {
  if (typeof data.noteNum === "undefined") return;
  let newValue = parseInt(data.noteNum.newValue);
  let oldValue = parseInt(data.noteNum.oldValue ?? options.noteNum);

  if (newValue > oldValue) {
    for (let i = oldValue + 1; i <= newValue; i++) {
      chrome.contextMenus.create({
        title: i.toString(),
        contexts: ["selection"],
        parentId: "parent",
        id: "note" + i,
      });
    }
  } else if (newValue < oldValue) {
    for (let i = newValue + 1; i <= oldValue; i++) {
      chrome.contextMenus.remove("note" + i);
    }
  }
});

chrome.contextMenus.onClicked.addListener((data) => {
  let menuItemId = data.menuItemId;
  let pageUrl = data.pageUrl;
  let selectionText = data.selectionText;

  chrome.storage.local.get({ ...options, [menuItemId]: null }, (items) => {
    let newLine = items.addEmptyLine ? "\n\n" : "\n";
    let newText = items.appendUrl
      ? selectionText + " (" + pageUrl + ")"
      : selectionText;
    let oldText = items[menuItemId];
    let newNote = oldText
      ? items.sendToTop
        ? newText + newLine + oldText
        : oldText + newLine + newText
      : newText;
    chrome.storage.local.set({
      [menuItemId]: newNote,
    });
    chrome.runtime.sendMessage({ refresh: [menuItemId] }, () => {
      if (chrome.runtime.lastError) return;
    });
  });
});
