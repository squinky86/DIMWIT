// Apply the saved appearance before styles paint. Only this preference is stored.
(() => {
  const key = 'dimwit-theme';
  let dark = false;
  try { dark = localStorage.getItem(key) === 'dark'; } catch { /* Storage may be unavailable. */ }
  const apply = () => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; };
  apply();
  document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('theme-toggle');
    toggle.hidden = false;
    toggle.setAttribute('aria-checked', String(dark));
    toggle.addEventListener('click', () => {
      dark = !dark;
      apply();
      toggle.setAttribute('aria-checked', String(dark));
      try { localStorage.setItem(key, dark ? 'dark' : 'light'); } catch { /* Keep the switch usable without storage. */ }
    });
  });
})();
