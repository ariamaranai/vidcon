L: {
  if (self.vidcon)
    break L;
  let d = document;
  let style = d.createElement("style");
  style.textContent = "::-webkit-scrollbar{display:none!important}video{--x:1;width:100%;transform-origin:center;transition-property:translate,scale;transition-duration:.1s}video:not([controls]):fullscreen::-webkit-media-controls{display:none!important}video::-webkit-media-controls{scale:var(--x)}::cue{background-color:#0000;font-size:calc(16px * var(--x));line-height:2}";
  let video;
  let videoStyle;
  let controls;
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
      controls = video.controls,
      ((shadowRoot && shadowRoot.contains(video)) ? shadowRoot : d.head ?? d.documentElement).appendChild(style),
      (textTrack = video.addTextTrack("subtitles")).mode = "showing"
    );
  }
  if (!getVideo())
    break L;
  self.vidcon = 1;
  let mouseDownX = 0;
  let mouseDownY = 0;
  let translateX = 0;
  let translateY = 0;
  let border = screen.height * .8;
  let scale = 100;
  let scaleFactor = 0;
  let cue;
  let removeCueTimer;
  let delayHoldTimer;
  let mouseHoldIntervalTimer;
  let onRateChange = e => e.stopImmediatePropagation();
  let onContextMenu = e => (
    e.stopImmediatePropagation(),
    e.preventDefault(),
    e.x === mouseDownX && e.y === mouseDownY
  );
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
      scaleFactor = 10 / scale;
    } else {
      let pbr = video.playbackRate;
      vttText = (
        video.playbackRate =
          delta
            ? (pbr = ((pbr + .055) * 20 ^ 0) / 20) < 5 ? pbr : 5
            : (pbr = ((pbr - .055) * 20 ^ 0) / 20) < .1 ? .1 : pbr
      ) + "x";
    }
    (cue = new VTTCue(0, 2e9, vttText)).snapToLines = !1;
    cue.line = 48;
    textTrack.addCue(cue);
    clearTimeout(removeCueTimer);
    (removeCueTimer = setTimeout(() => cue &&= (textTrack.removeCue(cue), 0), 800), !1);
    return !1;
  }
  let onMouseDown = e => {
    let button = e.button;
    if (!button)
      return scale > 100 && border > (mouseDownY = e.y) && (
        e.stopImmediatePropagation(),
        mouseDownX = e.x,
        addEventListener("mousemove", onMouseMove, 1),
        !1
      );
    else if (button < 3)
      return !1;
    e.preventDefault();
    delayHoldTimer && clearTimeout(delayHoldTimer);
    mouseHoldIntervalTimer && clearInterval(mouseHoldIntervalTimer);
    mouseHoldIntervalTimer = 0;
    let t = video.playbackRate * (button === 3 ? -5 : 5);
    video.currentTime += t;
    return (
      delayHoldTimer = setTimeout(() => (
        video.currentTime += t,
        mouseHoldIntervalTimer === 0 && (
          mouseHoldIntervalTimer = setInterval(() => video.currentTime += t, 127)
        )
      ), 500),
      !1
    );
  }
  let onMouseMove = e =>
    videoStyle.translate =
      (translateX += (e.x - mouseDownX) * scaleFactor) + "px " +
      (translateY += (e.y - mouseDownY) * scaleFactor) + "px";
  let onMouseUp = e => {
    let button = e.button;
    return button
      ? button > 2 && (
        e.stopImmediatePropagation(),
        removeEventListener("mousemove", onMouseMove, 1),
        delayHoldTimer &&= (clearTimeout(delayHoldTimer), 0),
        mouseHoldIntervalTimer &&= (clearInterval(mouseHoldIntervalTimer), 0),
        !1
      )
      : scale > 100 && e.y < border && (
        e.stopImmediatePropagation(),
        removeEventListener("mousemove", onMouseMove, 1),
        !1
      );
  }
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
          : keyCode === 38 ? (video.muted &&= 0, video.volume = (keyCode = video.volume + .1) < 1 ? keyCode : 1)
          : keyCode === 40 ? (video.muted &&= 0, video.volume = (keyCode = video.volume - .1) < 0 ? 0 : keyCode)
          : keyCode === 46 && controls && (video.removeAttribute("controls"))
    return !t || e.stopImmediatePropagation(e.preventDefault());
  }
  let onFullscreenChange = e => (
    (e && e.timeStamp === lastTimeStamp) || (
      (e = (!e || (lastTimeStamp = e.timeStamp, getVideo()))
        ? addEventListener
        : (
          removeEventListener("mousemove", onMouseMove, 1),
          videoStyle.translate = "",
          videoStyle.removeProperty("--x"),
          style.remove(),
          controls && (video.controls = 1),
          scale = 100,
          scaleFactor = translateX = translateY = 0,
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