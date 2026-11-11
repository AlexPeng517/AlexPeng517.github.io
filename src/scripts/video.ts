// Only research video moves (DESIGN.md §7).
// - Paper loops play on pointer hover (desktop) or when at least half visible (touch), and stop off-screen.
// - The rollout strip plays while on screen.
// - prefers-reduced-motion: nothing starts by itself; the strip offers a "play" text button.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;

function play(video: HTMLVideoElement) {
  video.play().catch(() => {});
}

// ---- Paper loops -----------------------------------------------------------
const loops = document.querySelectorAll<HTMLVideoElement>('video[data-loop]');
loops.forEach((video) => {
  video.addEventListener('playing', () => video.classList.add('playing'));
  video.addEventListener('pause', () => video.classList.remove('playing'));
  const host = video.closest<HTMLElement>('[data-loop-host]') ?? video;
  if (canHover) {
    host.addEventListener('pointerenter', () => !reduceMotion.matches && play(video));
    host.addEventListener('pointerleave', () => video.pause());
  }
});

if (loops.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.intersectionRatio >= 0.5) {
          if (!canHover && !reduceMotion.matches) play(video);
        } else {
          video.pause();
        }
      }
    },
    { threshold: [0, 0.5] },
  );
  loops.forEach((video) => observer.observe(video));
}

// ---- Rollout strip ---------------------------------------------------------
const rollout = document.querySelector<HTMLVideoElement>('video[data-rollout]');
if (rollout) {
  const state = document.querySelector<HTMLElement>('[data-rollout-state]');
  const button = document.querySelector<HTMLButtonElement>('[data-rollout-play]');
  let wanted = !reduceMotion.matches; // whether the clip should run while it is on screen
  let visible = false;

  const render = () => {
    if (state) state.textContent = rollout.paused ? 'paused' : 'looping';
    if (button) {
      button.hidden = !reduceMotion.matches;
      button.textContent = rollout.paused ? 'play' : 'pause';
    }
  };
  const apply = () => {
    if (wanted && visible) play(rollout);
    else rollout.pause();
  };

  rollout.addEventListener('play', render);
  rollout.addEventListener('pause', render);
  button?.addEventListener('click', () => {
    wanted = rollout.paused;
    apply();
  });
  reduceMotion.addEventListener('change', () => {
    wanted = !reduceMotion.matches;
    apply();
    render();
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        apply();
      },
      { threshold: 0.25 },
    ).observe(rollout);
  } else {
    visible = true;
    apply();
  }
  render();
}
