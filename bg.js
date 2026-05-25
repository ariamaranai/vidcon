chrome.runtime.onMessage.addListener((m, s, r) => {
  m ?? chrome.system.display.getInfo(infos => r(infos[0].bounds));
  let tabId = s.tab.id;
  let title;
  chrome.action.disable(tabId);
  chrome.action.setIcon({ tabId, path: m ? (title = "vidcon", "off.png") : (title = " " , "on.png") });
  chrome.action.setTitle({ tabId, title });
  return !0;
});
{
  let actionOnClicked = a => {
    let tabId = a.id;
    return chrome.action.getTitle({ tabId }, async title => {
      try {
        let target = { tabId, allFrames: !0 };
        title == "vidcon" && (
          await chrome.scripting.insertCSS({
            target,
            files: ["main.css"]
          }),
          await chrome.scripting.executeScript({
            target,
            files: ["main.js"]
          })
        )
      } catch {}
    })
  }
  chrome.action.onClicked.addListener(actionOnClicked);
  chrome.windows.onBoundsChanged.addListener(window =>
    window.state == "fullscreen" &&
    chrome.tabs.query({ active: !0, windowId: window.id }, tabs =>
      tabs.length && actionOnClicked(tabs[0])
    )
  );
  let onStartup = () => {
    chrome.scripting.getRegisteredContentScripts(scripts =>
      scripts.length || (
        chrome.scripting.registerContentScripts([{
          id: "0",
          css: ["main.css"],
          js: ["main.js"],
          matches: ["https://*/*.mp4*", "file://*.mp4*"],
          runAt: "document_end"
        }]),
        chrome.runtime.onStartup.removeListener(onStartup) 
      )
    );
  }
  chrome.runtime.onStartup.addListener(onStartup);
  chrome.runtime.onInstalled.addListener(onStartup);
}