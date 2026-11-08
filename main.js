L: {
  if (self.vidcon)
    break L;
  let d = document;
  let style = d.createElement("style");
  style.textContent = "::-webkit-scrollbar{display:none!important}video{--x:0;--y:0;--z:1;width:100%;translate:calc(var(--x) * 1px) calc(var(--y) * 1px))!important;scale:var(--z)!important;transform-origin:center}video:not([controls]):fullscreen::-webkit-media-controls{display:none!important}video::-webkit-media-controls{translate:calc(var(--x) * -1px),calc(var(--y) * -1px)!important;scale:var(--z)!important}";
  let dpr = devicePixelRatio;
  let cvsBuf = {};
  let cvs = new OffscreenCanvas(dpr * 50, dpr * 16);
  let ctx = cvs.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.font = "600 20px bahnschrift";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.shadowColor = "#000";
  ctx.shadowBlur =
  ctx.shadowOffsetX =
  ctx.shadowOffsetY = 1;
  let video;
  let videoStyle;
  let controls;
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
      ((shadowRoot && shadowRoot.contains(video)) ? shadowRoot : d.head ?? d.documentElement).appendChild(style)
    );
  }
  if (!getVideo())
    break L;
  self.vidcon = 1;
  let mouseDownX = 0;
  let mouseDownY = 0;
  let translateX = 0;
  let translateY = 0;
  let centerX = screen.width / 2;
  let centerY = screen.height;
  let border = centerY * .8;
  centerY /= 2;
  let scale = 100;
  let cursorSwitchTimer = 0;
  let delayHoldTimer;
  let mouseHoldIntervalTimer;
  let isMouseMoving;
  let onRateChange = e => e.stopImmediatePropagation();
  let onContextMenu = e => e.stopImmediatePropagation();
  let onWheel = e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    ctx.clearRect(0, 0, 64, 16);
    let $0 = e.deltaY < 0;
    let text =
      e.ctrlKey
        ? $0
          ? (videoStyle.setProperty("--z", $0 = (scale += 5) + "%"), $0)
          : (scale = +scale) < 106
            ? (videoStyle.removeProperty("--z"), "")
            : (videoStyle.setProperty("--z", $0 = (scale -= 5) + "%"), $0)
        : (video.playbackRate =
          $0
            ? ($0 = ((($0 = video.playbackRate) + .055) * 20 ^ 0) / 20) < 5 ? $0 : 5
            : ($0 = ((($0 = video.playbackRate) - .055) * 20 ^ 0) / 20) < .1 ? .1 : $0
        ) + "x";
    let url = cvsBuf[text];
    url
      ? videoStyle.cursor = url
      : (
        ctx.fillText(text, 25, 15),
        cvs.convertToBlob().then(r => videoStyle.cursor = cvsBuf[text] = "url(" + URL.createObjectURL(r) + ")+0+0,auto")
      );
    cursorSwitchTimer && clearTimeout(cursorSwitchTimer);
    cursorSwitchTimer = setTimeout(() => videoStyle.cursor = "", 1000);
    return !1;
  }
  let onMouseDown = e => {
    let button = e.button;
    if (!button)
      return scale > 100 && border > (mouseDownY = e.y) && (
        isMouseMoving = 1,
        e.stopImmediatePropagation(),
        mouseDownX = e.x,
        addEventListener("mousemove", onMouseMove, isMouseMoving = 1),
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
  let onMouseMove = e => {
    let factor = 5 / scale;
    videoStyle.setProperty("--x", translateX += (e.x - mouseDownX) * factor),
    videoStyle.setProperty("--y", translateY += (e.y - mouseDownY) * factor),
    videoStyle.transformOrigin =
      (centerX - translateX / 2) + "px " +
      (centerY - translateY / 2) + "px"
  }
  let onMouseUp = e => {
    let button = e.button;
    return button
      ? button > 2 && (
        e.preventDefault(),
        clearTimeout(delayHoldTimer),
        clearInterval(mouseHoldIntervalTimer),
        delayHoldTimer = mouseHoldIntervalTimer = 0,
        !1
      )
      : (scale < 101 && e.y > border) || (e.stopImmediatePropagation(), !1)
  }
  let onClick = e =>
    isMouseMoving &&= (
      removeEventListener("mousemove", onMouseMove, 1),
      e.preventDefault(),
      e.stopImmediatePropagation(),
      0
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
          : keyCode === 38 ? (video.muted &&= 0, video.volume = (keyCode = video.volume + .1) < 1 ? keyCode : 1)
          : keyCode === 40 ? (video.muted &&= 0, video.volume = (keyCode = video.volume - .1) < 0 ? 0 : keyCode)
          : keyCode === 46 && controls && (video.removeAttribute("controls"))
    return !t || e.stopImmediatePropagation(e.preventDefault());
  }
  let onFullscreenChange = e =>
    (e && e.timeStamp === lastTimeStamp) || (
      (e = (!e || (lastTimeStamp = e.timeStamp, getVideo()))
        ? addEventListener
        : (
          removeEventListener("mousemove", onMouseMove, 1),
          videoStyle.transformOrigin =
          videoStyle.cursor = "",
          videoStyle.removeProperty("--x"),
          videoStyle.removeProperty("--y"),
          videoStyle.removeProperty("--z"),
          style.remove(),
          controls && (video.controls = 1),
          scale = 100,
          video = translateX = translateY = isMouseMoving = 0,
          delete vidcon.vidcon,
          removeEventListener
        )
      )("ratechange", onRateChange, 1),
      e("contextmenu", onContextMenu, 1),
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