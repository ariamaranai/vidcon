L: {
  if (self.vidcon)
    break L;
  let d = document;
  let style = d.createElement("style");
  style.textContent = "::-webkit-scrollbar{display:none!important}video{--x:1;width:100%;transform-origin:center}video:not([controls]):fullscreen::-webkit-media-controls{display:none!important}video::-webkit-media-controls{scale:var(--x)}::cue{background-color:#0000;font-size:calc(16px * var(--x));line-height:2}";
  let video;
  let videoStyle;
  let textTrack;
  let getVideo = () => {
    let fullscreenElement = d.fullscreenElement;
    if (!fullscreenElement)
      return;
    let shadowRoot;
    if (fullscreenElement.localName === "video")
      video = fullscreenElement;
    else {
      let videos = fullscreenElement.getElementsByTagName("video");
      (shadowRoot = fullscreenElement.shadowRoot) && (
        (shadowRoot = shadowRoot.querySelectorAll("video")).length &&
        (videos = [...videos, ...shadowRoot])
      );
      let maxSize = 0;
      let size = 0;
      let i = videos.length;
      while (i)
        (maxSize < (size = (element = videos[--i]).offsetWidth * element.offsetHeight)) && (
          maxSize = size,
          video = element
        );
    }
    return video && (
      self.vidcon = 1,
      videoStyle = video.style,
      ((shadowRoot && shadowRoot.contains(video)) ? shadowRoot : d.head ?? d.documentElement).appendChild(style),
      (textTrack = video.addTextTrack("subtitles")).mode = "showing"
    );
  }
  if (!getVideo())
    break L;
  self.vidcon = 1;
  let onRateChange = e => e.stopImmediatePropagation();
  let onContextMenu = e => (e.stopImmediatePropagation(), !0);
  let scale = 100;
  let cue;
  let removeCueTimer;
  let onWheel = e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    cue &&= (textTrack.removeCue(cue), 0);
    let delta = e.deltaY < 0;
    let vttText;
    if (e.ctrlKey) {
      videoStyle.scale =
        delta
          ? (videoStyle.setProperty("--x", 100 / (scale += 10)), vttText = scale + "%")
          : (scale = +scale) < 111
            ? (videoStyle.removeProperty("--x"), vttText = "100%",  "")
            : (videoStyle.setProperty("--x", 100 / (scale -= 10)), vttText = scale + "%");
    } else {
      let pbr = video.playbackRate;
      vttText = (
        video.playbackRate =
          delta
            ? (pbr = ((pbr + .055) * 20 ^ 0) / 20) < 5 ? pbr : 5
            : (pbr = ((pbr - .055) * 20 ^ 0) / 20) < .1 ? .1 : pbr
      ) + "x";
    }
    cue = new VTTCue(0, 2e9, vttText);
    cue.snapToLines = !1;
    cue.line = 48;
    textTrack.addCue(cue);
    clearTimeout(removeCueTimer);
    (removeCueTimer = setTimeout(() => cue &&= (textTrack.removeCue(cue), 0), 800), !1);
    return !1;
  }
  let delayHoldTimer;
  let mouseHoldIntervalTimer;
  let onMouseDown = e => {
    let button = e.button;
    if (button < 3)
      return !1;
    e.preventDefault();
    delayHoldTimer && clearTimeout(delayHoldTimer);
    mouseHoldIntervalTimer && clearInterval(mouseHoldIntervalTimer);
    mouseHoldIntervalTimer = 0;
    let t = video.playbackRate * (button === 3 ? -5 : 5);
    video.currentTime += t;
    return delayHoldTimer = setTimeout(() => (
      video.currentTime += t,
      mouseHoldIntervalTimer === 0 && (
        mouseHoldIntervalTimer = setInterval(() => video.currentTime += t, 127)
      )
    ), 500);
  }
  let onMouseUp = e =>
    e.button > 2 && (
      e.preventDefault(),
      delayHoldTimer &&= (clearTimeout(delayHoldTimer), 0),
      mouseHoldIntervalTimer &&= (clearInterval(mouseHoldIntervalTimer), 0)
    );
  let lastTimeStamp = 0;
  let onKeyDown = e => {
    let timeStamp = e.timeStamp;
    if (timeStamp === lastTimeStamp)
      return !0;
    lastTimeStamp = timeStamp;
    let keyCode = e.keyCode;
    let t = keyCode === 39 ? video.currentTime += video.playbackRate * 5
          : keyCode === 37 ? video.currentTime += video.playbackRate * -5
          : keyCode === 190 ? video.pause(video.currentTime += .03333333333333333)
          : keyCode === 188 ? video.pause(video.currentTime -= .03333333333333333)
          : keyCode === 38 ? (video.muted ||= 1, video.volume = (keyCode = video.volume + .1) < 1 ? keyCode : 1)
          : keyCode === 40 ? (video.muted ||= 1, video.volume = (keyCode = video.volume - .1) < 0 ? 0 : keyCode)
          : keyCode === 46 && (video.controls ? video.removeAttribute("controls") : video.controls = 1)
    return !t || e.stopImmediatePropagation(e.preventDefault());
  }
  let onFullscreenChange = e => (
    (e && e.timeStamp === lastTimeStamp) || (
      (e = (!e || (lastTimeStamp = e.timeStamp, getVideo()))
        ? addEventListener
        : (
          videoStyle.removeProperty("--x"),
          style.remove(),
          video.controls = scale = 100,
          delete vidcon.vidcon,
          removeEventListener
        )
      )("ratechange", onRateChange, 1),
      e("contextmenu", onContextMenu, 1),
      e("wheel", onWheel, { capture: 1, passive: 0 }),
      e("mousedown", onMouseDown, 1),
      e("mouseup", onMouseUp, 1),
      e("keydown", onKeyDown, 1)
    )
  );
  onFullscreenChange();
  addEventListener("fullscreenchange", onFullscreenChange, 1);
  addEventListener("webkitfullscreenchange", onFullscreenChange, 1);
}