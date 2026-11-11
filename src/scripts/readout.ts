// Step readout on the rollout strip: "step 042 / 120", from currentTime / duration.
// Hidden without JavaScript, and while totalSteps in site.yaml is still 0.
const video = document.querySelector<HTMLVideoElement>('video[data-rollout]');
const readout = document.querySelector<HTMLElement>('[data-rollout-readout]');
const total = Number(video?.dataset.totalSteps ?? 0);

if (video && readout && total > 0) {
  const width = String(total).length;
  const draw = () => {
    const progress = video.duration > 0 ? video.currentTime / video.duration : 0;
    // The clip shows steps 0..total for equal lengths of time, so there are total + 1 slots.
    const step = Math.min(total, Math.max(0, Math.floor(progress * (total + 1))));
    readout.textContent = `step ${String(step).padStart(width, '0')} / ${total}`;
  };
  const tick = () => {
    draw();
    if (!video.paused) requestAnimationFrame(tick);
  };
  video.addEventListener('play', tick);
  video.addEventListener('seeked', draw);
  video.addEventListener('loadedmetadata', draw);
  draw();
  readout.hidden = false;
}
