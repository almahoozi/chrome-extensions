chrome.webNavigation.onHistoryStateUpdated.addListener(
  function(details) {
    let url = new URL(details.url);
    if (
      url.hostname === "github.com" &&
      url.pathname.includes("/pull/") &&
      url.pathname.includes("/files")
    ) {
      let params = url.searchParams;
      if (!params.has("w")) {
        params.set("w", "1");
        let newUrl =
          url.origin + url.pathname + "?" + params.toString() + url.hash;
        chrome.tabs.update(details.tabId, { url: newUrl });
      }
    }
  },
  { url: [{ urlMatches: "https://github.com/" }] },
);
