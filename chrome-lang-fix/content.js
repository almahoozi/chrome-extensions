const interval = 50;
if (window.location.href.includes("google.com")) {
  chrome.runtime.sendMessage({
    extensionId: chrome.runtime.id,
    action: "ready",
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.extensionId !== chrome.runtime.id) {
    return;
  }

  if (
    message.action === "getLanguageUrl" &&
    window.location.href.includes("google.com")
  ) {
    sendOrWait(message.clicked);
  }
});

function sendOrWait(clicked, maxTimeout = 10000) {
  const links = document.querySelectorAll(
    'a[href^="https://www.google.com/setprefs"][href*="&hl="]',
  );
  for (let link of links) {
    const url = new URL(link.href);
    const hl = url.searchParams.get("hl");
    if (link.textContent.trim()) {
      chrome.runtime.sendMessage({
        extensionId: chrome.runtime.id,
        action: "foundLanguageUrl",
        url: link.href,
        language: link.textContent.trim(),
        locale: hl,
        clicked: clicked,
      });
      return;
    }
  }
  setTimeout(() => {
    sendOrWait(clicked, maxTimeout - interval);
  }, interval);
}
