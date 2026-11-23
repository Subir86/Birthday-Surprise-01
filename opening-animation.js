(() => {
  let active = false;
  window.playOpeningAnimation = (onComplete) => {
    if (active) return;
    active = true;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(safety);
      overlay.remove();
      active = false;
      onComplete();
    };
    const overlay = document.createElement('div');
    overlay.className = 'opening-camera';
    overlay.setAttribute('aria-label', 'Birthday photo countdown');
    overlay.innerHTML = '<div class="opening-pair"><img class="opening-sticker" src="stickers/opening-intro-1.png" alt="Camera sticker one"><img class="opening-sticker" src="stickers/opening-intro-2.png" alt="Camera sticker two"></div>';
    document.body.append(overlay);
    let safety = setTimeout(finish, 8000);
    let loaded = 0;
    overlay.querySelectorAll('img').forEach(img => {
      img.onload = () => { if (++loaded === 2) run(); };
      img.onerror = finish;
      if (img.complete && img.naturalWidth) { if (++loaded === 2) run(); }
    });
    let started = false;
    function run() {
      if (started || finished) return;
      started = true;
      setTimeout(() => count(3), 1150);
    }
    function count(n) {
      if (finished) return;
      const number = document.createElement('div');
      number.className = 'opening-count';
      number.textContent = n;
      overlay.append(number);
      setTimeout(() => {
        number.remove();
        if (n > 1) count(n - 1);
        else {
          const flash = document.createElement('div');
          flash.className = 'opening-camera-flash';
          overlay.append(flash);
          setTimeout(() => {
            overlay.classList.add('fade');
            setTimeout(finish, 420);
          }, 480);
        }
      }, 900);
    }
  };
})();
