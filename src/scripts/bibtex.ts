// "bibtex" links open and close their block; the copy button reports "copied" for 1.5 s.
document.querySelectorAll<HTMLAnchorElement>('[data-bibtex-toggle]').forEach((link) => {
  const block = document.getElementById(link.getAttribute('aria-controls') ?? '');
  if (!block) return;

  const set = (open: boolean) => {
    block.classList.toggle('open', open);
    link.setAttribute('aria-expanded', String(open));
  };
  // A page loaded with the block's #fragment starts open, as it would without JavaScript.
  if (location.hash === `#${block.id}`) set(true);

  link.addEventListener('click', (event) => {
    event.preventDefault();
    set(!block.classList.contains('open'));
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-bibtex-copy]').forEach((button) => {
  if (!navigator.clipboard) return; // stays hidden
  button.hidden = false;
  let timer: number | undefined;
  button.addEventListener('click', async () => {
    const text = button.closest('[data-bibtex]')?.querySelector('code')?.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'copied';
      clearTimeout(timer);
      timer = window.setTimeout(() => (button.textContent = 'copy'), 1500);
    } catch {}
  });
});
