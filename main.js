L: {
  if (self.vidcon)
    break L;
  let d = document;
  let style = d.createElement("style");
  style.textContent = "::-webkit-scrollbar{display:none!important}video{--x:0;--y:0;--z:100;width:100%;translate:calc(var(--x) * 1px) calc(var(--y) * 1px))!important;scale:calc(var(--z) / 100)!important;transform-origin:center}video:not([controls]):fullscreen::-webkit-media-controls{display:none!important}video::-webkit-media-controls{translate:calc(var(--x) * -1px),calc(var(--y) * -1px)!important;scale:var(--z)!important}::cue{background-color:#0000!important;font-size:calc(16px / (var(--z) / 100))!important;line-height:2!important}";
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
  let centerX = screen.width >> 1;
  let centerY = screen.height;
  let border = centerY * .8;
  centerY >>= 1;
  let scale = 100;
  let cue;
  let removeCueTimer;
  let delayHoldTimer;
  let mouseHoldIntervalTimer;
  let mouseDownInZoom;
  let onRateChange = e => e.stopImmediatePropagation();
  let onWheel = e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    cue &&= (textTrack.removeCue(cue), 0);
    let text =
      e.ctrlKey
        ? (videoStyle.setProperty("--z", scale = e.deltaY < 0 ? scale + 5 : scale < 106 ? 100 : scale - 5), scale + "%")
        : (video.playbackRate =
          e.deltaY < 0
            ? (e = (((e = video.playbackRate) + .055) * 20 ^ 0) / 20) < 5 ? e : 5
            : (e = (((e = video.playbackRate) - .055) * 20 ^ 0) / 20) < .1 ? .1 : e
        ) + "x";
    (cue = new VTTCue(0, 2e9, text)).snapToLines = 0;
    cue.line = 48;
    textTrack.addCue(cue);
    clearTimeout(removeCueTimer);
    return removeCueTimer = setTimeout(() => cue &&= (textTrack.removeCue(cue), 0), 800);
  }
  let onMouseDown = e => {
    let $0 = e.button;
    return $0 && $0 > 2
      ? (
        e.stopImmediatePropagation(),
        delayHoldTimer && clearTimeout(delayHoldTimer),
        mouseHoldIntervalTimer && clearInterval(mouseHoldIntervalTimer),
        mouseHoldIntervalTimer = 0,
        video.currentTime += ($0 = video.playbackRate * ($0 === 3 ? -5 : 5)),
        delayHoldTimer = setTimeout(() => (
          video.currentTime += $0,
          mouseHoldIntervalTimer === 0 && (
            mouseHoldIntervalTimer = setInterval(() => video.currentTime += $0, 127)
          )
        ), 500)
      )
      : scale > 100 && border > (mouseDownY = e.y) && (
        mouseDownX = e.x,
        //e.stopImmediatePropagation(),
        addEventListener("mousemove", onMouseMove, mouseDownInZoom = 1)
      );
  }
  let onMouseMove = e => {
    let factor = 8 / scale;
    videoStyle.setProperty("--x", translateX += (e.x - mouseDownX) * factor);
    videoStyle.setProperty("--y", translateY += (e.y - mouseDownY) * factor);
    return videoStyle.transformOrigin =
      (centerX - (translateX >> 1)) + "px " +
      (centerY - (translateY >> 1)) + "px";
  }
  let onMouseUp = e =>
    e.button > 2 && (
      e.preventDefault(),
      e.stopImmediatePropagation(),
      clearTimeout(delayHoldTimer),
      clearInterval(mouseHoldIntervalTimer),
      delayHoldTimer = mouseHoldIntervalTimer = 0
    );
  let onClick = e =>
    mouseDownInZoom &&= (
      removeEventListener("mousemove", onMouseMove, 1),
      (e.x === mouseDownX && e.y === mouseDownY) || (
        e.preventDefault(),
        e.stopImmediatePropagation()
      ),
      0
    );
  let lastTimeStamp = 0;
  let onKeyDown = e => {
    let timeStamp = e.timeStamp;
    if (timeStamp === lastTimeStamp)
      return;
    lastTimeStamp = timeStamp;
    let keyCode = e.keyCode;
    let t = keyCode === 39 ? video.currentTime += video.playbackRate * 5
          : keyCode === 37 ? video.currentTime += video.playbackRate * -5
          : keyCode === 190 ? video.pause(video.currentTime += .03333333333333333)
          : keyCode === 188 ? video.pause(video.currentTime -= .03333333333333333)
          : keyCode === 38 ? (video.muted &&= 0, video.volume = (keyCode = video.volume + .1) < 1 ? keyCode : 1)
          : keyCode === 40 ? (video.muted &&= 0, video.volume = (keyCode = video.volume - .1) < 0 ? 0 : keyCode)
          : keyCode === 46 && controls && (video.removeAttribute("controls"))
    return t && e.stopImmediatePropagation(e.preventDefault());
  }
  let onFullscreenChange = e =>
    (e && e.timeStamp === lastTimeStamp) || (
      (e = (!e || (lastTimeStamp = e.timeStamp, getVideo()))
        ? addEventListener
        : (
          removeEventListener("mousemove", onMouseMove, 1),
          videoStyle.transformOrigin =
          videoStyle.removeProperty("--x"),
          videoStyle.removeProperty("--y"),
          videoStyle.removeProperty("--z"),
          style.remove(),
          controls && (video.controls = 1),
          scale = 100,
          video =
          textTrack =
          cue =
          translateX =
          translateY =
          mouseDownInZoom = 0,
          delete vidcon.vidcon,
          removeEventListener
        )
      )("ratechange", onRateChange, 1),
      e("contextmenu", onRateChange, 1),
      e("wheel", onWheel, { capture: 1, passive: 0 }),
      e("mousedown", onMouseDown, 1),
      e("mouseup", onMouseUp, 1),
      e("click", onClick, 1),
      e("keydown", onKeyDown, 1)
    );
  onFullscreenChange();
  addEventListener("fullscreenchange", onFullscreenChange, 1);
  addEventListener("webkitfullscreenchange", onFullscreenChange, 1);
}