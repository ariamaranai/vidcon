onunhandledrejection = e => e.preventDefault();
{
  let { scripting, tabs, windows } = chrome;
  windows.onBoundsChanged.addListener(window =>
    window.state === "fullscreen" &&
    tabs.query({ active: !0, windowId: window.id }, t =>
      t.length && (t = t[0].id) > 0 &&
      scripting.executeScript({
        target: { tabId: t, allFrames: !0 },
        world: "MAIN",
        files: ["main.js"]
      })
    )
  );
}
