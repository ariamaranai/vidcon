{
  let d = document;
  let style = d.createElement("style");
  style.textContent = "::-webkit-scrollbar{display:none!important}video{--x:1;width:100%;transform-origin:center}video::-webkit-media-controls{scale:var(--x)}";
  let video;
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
      ((shadowRoot && shadowRoot.contains(video)) ? shadowRoot : d.head ?? d.documentElement).appendChild(style),
      (textTrack = video.addTextTrack("subtitles")).mode = "showing"
    );
  }
  if (getVideo()) {
    let onRateChange = e => e.stopImmediatePropagation();
    let onContextMenu = e => e.stopImmediatePropagation(e.preventDefault());
    let scale;
    let cue;
    let removeCueTimer;
    let onWheel = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      cue &&= (textTrack.removeCue(cue), 0);
      let delta = e.deltaY < 0;
      let vttText;
      if (e.ctrlKey) {
        let videoStyle = video.style;
        videoStyle.scale =
          delta
            ? (videoStyle.setProperty("--x", 100 / scale), vttText = (scale = scale ? scale + 10 : 110) + "%")
            : (scale = +scale) < 111
            ? (videoStyle.removeProperty("--x"), vttText = "100%",  "")
            : (videoStyle.setProperty("--x", 100 / scale), vttText = (scale -= 10) + "%");
      } else {
        let pbr = video.playbackRate;
        vttText = (
          video.playbackRate =
            delta
              ? (pbr = ((pbr + .055) * 20 ^ 0) / 20) < 5 ? pbr : 5
              : (pbr = ((pbr - .055) * 20 ^ 0) / 20) < .1 ? .1 : pbr
        ) + "x";
        clearTimeout(removeCueTimer);
        (removeCueTimer = setTimeout(() => cue &&= (textTrack.removeCue(cue), 0), 2000), !1);
      }
      textTrack.addCue(cue = new VTTCue(0, 2e9, vttText));
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
      delayHoldTimer = setTimeout(() => (
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
    let onKeyDown = e => {
      let keyCode = e.keyCode;
      let t = keyCode === 39 ? video.currentTime += video.playbackRate * 5
            : keyCode === 37 ? video.currentTime += video.playbackRate * -5
            : keyCode === 190 ? video.pause(video.currentTime += .03333333333333333)
            : keyCode === 188 ? video.pause(video.currentTime -= .03333333333333333)
            : keyCode === 38 ? (video.muted ||= 1, video.volume = (keyCode = video.volume + .1) < 1 ? keyCode : 1)
            : keyCode === 40 && (video.muted ||= 1, video.volume = (keyCode = video.volume - .1) < 0 ? 0 : keyCode)
      return !t || e.stopImmediatePropagation(e.preventDefault());
    }
    let onFocusIn = e => e.target === video && video.blur(e.preventDefault());
    let onFullscreenChange = e => {
      (e =
        (!e || getVideo())
          ? addEventListener
          : (style.remove(), removeEventListener)
      )("ratechange", onRateChange, 1);
      e("contextmenu", onContextMenu, 1);
      e("wheel", onWheel, { capture: 1, passive: 0 });
      e("mousedown", onMouseDown, 1);
      e("mouseup", onMouseUp, 1);
      e("keydown", onKeyDown, 1);
      e("focusin", onFocusIn, 1);
    }
    onFullscreenChange();
    addEventListener("fullscreenchange", onFullscreenChange, 1);

  /*
    let brightness = 100;
    let contrast = 100;
    let onWheel = e => {
          ? video.style.filter = "brightness(" + (brightness -= (delta = delta < 0 ? -1 : 1)) + "%)contrast(" + (contrast += delta) + "%)"
    }
  */
  }
}