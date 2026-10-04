onunhandledrejection = e => e.preventDefault();
{
  let { action, runtime, scripting, system, tabs, windows } = chrome;
  let actionOnClicked = a => {
    let tabId = a.id;
    return action.getTitle({ tabId }, title => {
      let target = { tabId, allFrames: !0 };
      title == "vidcon" && (
        scripting.insertCSS({
          target,
          files: ["main.css"]
        }),
        scripting.executeScript({
          target,
          files: ["main.js"]
        })
      );
    });
  }
  runtime.onMessage.addListener((m, s, r) => {
    m ?? system.display.getInfo(infos => r(infos[0].bounds));
    let tabId = s.tab.id;
    let title;
    action.disable(tabId);
    action.setIcon({ tabId, path: m ? (title = "vidcon", "off.png") : (title = " " , "on.png") });
    action.setTitle({ tabId, title });
    return !0;
  });
  let onStartup = () =>
    scripting.getRegisteredContentScripts(scripts =>
      scripts.length || (
        scripting.registerContentScripts([{
          id: "0",
          css: ["main.css"],
          js: ["main.js"],
          matches: ["https://*/*.mp4*", "file://*.mp4*"],
          runAt: "document_end"
        }]),
        runtime.onStartup.removeListener(onStartup)
      )
    );
  windows.onBoundsChanged.addListener(window =>
    window.state == "fullscreen" &&
    tabs.query({ active: !0, windowId: window.id }, tabs =>
      tabs.length && actionOnClicked(tabs[0])
    )
  );
  action.onClicked.addListener(actionOnClicked);
  runtime.onStartup.addListener(onStartup);
  runtime.onInstalled.addListener(onStartup);
}
