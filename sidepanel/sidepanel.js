const options = {
    noteNum: 7,
    fontSize: 14,
    textColor: "#424242",
    noteColor: "#ECEFF7",
    scrollToBottom: false,
    sendToTop: false,
    appendUrl: false,
    addEmptyLine: false,
    softWrap: true
}

const header = document.getElementById("header");
const content = document.getElementById("content");

const addNote = (num) => {
    const div = document.createElement("div");
    div.id = "tab" + num;
    div.className = "tab";
    const input = document.createElement("input");
    input.type = "radio";
    input.id = "note" + num;
    input.className = "note";
    input.name = "note";
    const label = document.createElement("label");
    label.htmlFor = "note" + num;
    label.title = "Note " + num;
    label.textContent = num;
    div.appendChild(input);
    div.appendChild(label);
    header.appendChild(div);
}

const refreshNotes = (num) => {
    getContent("note1", "open");
    [...document.getElementsByClassName("tab")].forEach((div) => {
        let divNum = parseInt(div.id.match(/(\d+)/)[0]);
        if (divNum > num) {
            chrome.storage.local.remove(["note" + divNum]);
            div.remove();
        }
    });
    for (let i = 1; i <= num; i++) {
        if (!document.getElementById("note" + i)) {
            addNote(i);
        }
    }
    document.getElementById("note1").checked = true;
    getContent("note1", "open");
}

const getContent = (id, event) => {
    chrome.storage.local.get({ ...options, [id]: null }, (items) => {
        content.value = items[id];
        if (event === "send") {
            content.scrollTop = items.sendToTop ? 0 : content.scrollHeight;
        } else {
            if (items.scrollToBottom) content.scrollTop = content.scrollHeight;
            if (event === "select") content.focus();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(options, (items) => {
        document.body.style.color = items.textColor;
        document.body.style.backgroundColor = items.noteColor;
        content.style.fontSize = items.fontSize + "px";
        content.style.whiteSpace = items.softWrap ? "pre-wrap" : "pre";
        refreshNotes(parseInt(items.noteNum));
    });
});

header.addEventListener("click", (event) => {
    if (event.target.classList.contains("note")) {
        getContent(event.target.id, "select");
    }
});

content.addEventListener("input", () => {
    let activeNote = document.querySelector(".note:checked").id;
    chrome.storage.local.set({
        [activeNote]: content.value
    });
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.refresh) {
        let activeNote = document.querySelector(".note:checked").id;
        if (activeNote == message.refresh) {
            getContent(activeNote, "send");
        }
    }
});

chrome.storage.onChanged.addListener((items) => {
    if (items.textColor) {
        document.body.style.color = items.textColor.newValue;
    } else if (items.noteColor) {
        document.body.style.backgroundColor = items.noteColor.newValue;
    } else if (items.fontSize) {
        content.style.fontSize = items.fontSize.newValue + "px";
    } else if (items.softWrap) {
        content.style.whiteSpace = items.softWrap.newValue ? "pre-wrap" : "pre";
    } else if (items.noteNum) {
        refreshNotes(parseInt(items.noteNum.newValue));
    }
});
