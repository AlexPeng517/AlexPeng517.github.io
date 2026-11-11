// Light / Dark buttons in the footer. The stored choice is applied before first paint
// by the inline script in Base.astro; with no stored choice the page follows the OS setting.
const root = document.documentElement;

function current(): string {
  return root.getAttribute('data-theme') ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}

function sync(buttons: NodeListOf<HTMLButtonElement>) {
  const theme = current();
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setTheme === theme)));
}

const buttons = document.querySelectorAll<HTMLButtonElement>('[data-set-theme]');
buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const theme = button.dataset.setTheme!;
    root.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {}
    sync(buttons);
  });
});
sync(buttons);
document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((el) => (el.hidden = false));
