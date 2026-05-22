{
  let d = document;
  let video;
  let track;
  let getVideo = () => {
    if (!((video = d.fullscreenElement || d.scrollingElement) instanceof HTMLVideoElement)) {
      let videos = video.getElementsByTagName("video");
      let wndW = innerWidth;
      let wndH = innerHeight;
      let maxVisibleSize = 0;
      let i = videos.length;
      while (i) {
        let _video = videos[--i];
        if (_video.readyState) {
          let { right, x, bottom, y } = _video.getBoundingClientRect();        
          let visibleW = (right < wndW ? right : wndW) - (x < 0 ? 0 : x);
          let visibleH = (bottom < wndH ? bottom : wndH) - (y < 0 ? 0 : y);
          let visibleSize = visibleW * visibleH;
          maxVisibleSize < visibleSize && (
            maxVisibleSize = visibleSize,
            video = _video
          );
        }
      }
      video?.readyState || (video = video.shadowRoot?.querySelector("video"));
    }
    video?.readyState ? (track = video.addTextTrack("subtitles")).mode = "showing" : video = 0;
    return video;
  }
  if (getVideo()) {
    let cue;
    let brightness = 100;
    let contrast = 100;
    let timer0;
    let timer1;
    let timer2;
    let rightClick;
    let showContextMenu;
    let onContextMenu = e => showContextMenu || e.stopImmediatePropagation(e.preventDefault());
    let onMouseDown = e => {
      let button = e.button;
      return button > 1 && (
        e.preventDefault(),
        onMouseHold(button)
      );
    }
    let onMouseUp = e => (
      e.button > 2 && e.preventDefault(),
      timer0 &&= clearTimeout(timer0),
      timer1 &&= clearInterval(timer1),
      rightClick &&= (showContextMenu = performance.now() - rightClick < 300, 0)
    );
    let onMouseHold = button => {
      if (!(rightClick = button == 2 && performance.now())) {
        let t = video.playbackRate * (button < 4 ? -5 : 5);
        video.currentTime += t;
        timer1 = -1;
        timer0 = setTimeout(() => (
          video.currentTime += t,
          timer1 &&= setInterval(() => video.currentTime += t, 127)),
          500
        );
      }
    }
    let onWheel = e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      let delta = Math.sign(e.deltaY);
      return rightClick
        ? video.style.filter = "brightness(" + (brightness -= delta) + "%) contrast(" + (contrast += delta) + "%)"
        : addCue(delta);
    }
    let addCue = delta => {
      cue &&= (track.removeCue(cue), 0);
      let pbr = video.playbackRate;
      track.addCue(
        cue = new VTTCue(
          0,
          2147483647,
          (video.playbackRate =
            delta < 0
              ? (pbr = ((pbr + .055) * 20 ^ 0) / 20) < 5 ? pbr : 5
              : (pbr = ((pbr - .055) * 20 ^ 0) / 20) < .1 ? .1 : pbr
          ) + "x"
        )
      );
      clearTimeout(timer2);
      return timer2 = setTimeout(() => cue &&= (track.removeCue(cue), 0), 2000);
    }
    if (d.head?.childElementCount == 1) {
      chrome.runtime.sendMessage(0);
      oncontextmenu = onContextMenu;
      onkeydown = e => {
        let k = e.keyCode;
        if (k == 122 && !d.fullscreenElement)
          video.requestFullscreen(e.preventDefault());
        else {
          let t =
              k == 39 ? video.playbackRate * 5
            : k == 37 ? video.playbackRate * -5
            : k == 190 ? .03333333333333333
            : k == 188 && -.03333333333333333;
          t ? (e.preventDefault(), k > 39 && video.pause(), video.currentTime += t)
            : (t = k == 38 ? .1 : k == 40 && -.1) && (video.volume = (k = video.volume + t) < 0 ? 0 : k < 1 ? k : 1);
        }
        return !0;
      }
      onmousedown = onMouseDown;
      onmouseup = onMouseUp;
      addEventListener("wheel", onWheel, { passive: !1 });
    } else {
      chrome.runtime.sendMessage(null, ({ width: fullscreenWidth, height: fullscreenHeight }) => {
        let onKeyDown = e => {
          let k = e.keyCode;
          let t = k == 39 ? video.playbackRate * 5
                : k == 37 ? video.playbackRate * -5
                : k == 190 ? .03333333333333333
                : k == 188 && -.03333333333333333;
          return !t || (
            e.stopImmediatePropagation(e.preventDefault()),
            k > 39 && video.pause(),
            video.currentTime += t
          )
        }
        let onRateChange = e => e.stopImmediatePropagation();
        let listener;
        let observer = new ResizeObserver(() => {
          return (listener =
            listener == addEventListener
              ? (video = observer.unobserve(video), chrome.runtime.sendMessage(1), removeEventListener)
              : (!listener || innerWidth == fullscreenWidth && innerHeight == fullscreenHeight)
                && ((video || getVideo()) && observer.observe(video), addEventListener)
          ) &&
          video == 0 || (
            listener("contextmenu", onContextMenu, 1),
            listener("keydown", onKeyDown, 1),
            listener("mousedown", onMouseDown, 1),
            listener("mouseup", onMouseUp, 1),
            listener("wheel", onWheel, { capture: !0, passive: !1 }),
            listener("ratechange", onRateChange, 1)
          );
        });
        observer.observe(video);
      });
    }
  }
}