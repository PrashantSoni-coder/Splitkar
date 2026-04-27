// ── Auto-dismiss alerts after 4s ──
document.querySelectorAll('.alert').forEach(el => {
  setTimeout(() => {
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(-6px)';
    setTimeout(() => el.remove(), 400);
  }, 4000);
});

// ── Confirm delete via data-confirm ──
document.querySelectorAll('[data-confirm]').forEach(el => {
  el.addEventListener('submit', function (e) {
    if (!confirm(this.dataset.confirm)) e.preventDefault();
  });
});

// ── Active nav link ──
const currentPath = window.location.pathname;
document.querySelectorAll('.navbar-links a').forEach(link => {
  if (link.getAttribute('href') === currentPath) {
    link.style.color      = 'var(--accent)';
    link.style.background = 'var(--accent-dim)';
  }
});
