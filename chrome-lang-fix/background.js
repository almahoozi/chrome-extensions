const targetLanguage = "English";

let isFirstIncognitoWindow = true;
let incognitoWindows = [];
let clicked = false;
let tabIds = [];

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.extensionId !== chrome.runtime.id) {
    return;
  }

  if (!tabIds.includes(sender.tab.id)) {
    return;
  }

  console.log("message", message);

  if (message.action === "ready") {
    sendMessage(sender.tab.id, {
      action: "getLanguageUrl",
      clicked: clicked,
    });
  }

  if (message.action === "foundLanguageUrl") {
    chrome.tabs.remove(sender.tab.id);
    tabIds = tabIds.filter((id) => id !== sender.tab.id);

    if (message.language === targetLanguage && !message.clicked) {
      clicked = true;
      chrome.tabs.create({ url: message.url, active: false }, (tab) => {
        tabIds.push(tab.id);
      });
    } else if (message.language === targetLanguage && message.clicked) {
      console.error("Expected to switch language but it's still the same.");
    }
  }
});

chrome.windows.onCreated.addListener((window) => {
  if (window.incognito) {
    incognitoWindows.push(window.id);
  }

  if (window.incognito && isFirstIncognitoWindow) {
    isFirstIncognitoWindow = false;
    chrome.tabs.create(
      { url: "https://www.google.com", active: false },
      (tab) => {
        tabIds.push(tab.id);
      },
    );
  }
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (incognitoWindows.includes(windowId)) {
    incognitoWindows = incognitoWindows.filter((id) => id !== windowId);
    if (incognitoWindows.length === 0) {
      isFirstIncognitoWindow = true;
      clicked = false;
    }
  }
});

function sendMessage(tabId, payload) {
  payload.extensionId = chrome.runtime.id;
  console.log("sendMessage", tabId, payload);
  chrome.tabs.sendMessage(tabId, payload);
}
