document.addEventListener('DOMContentLoaded', () => {
  requireAuth();

  const current = window.location.pathname.split('/').pop();
  document.querySelectorAll('.sidebar nav a').forEach((link) => {
    if (link.getAttribute('href') === current) {
      link.classList.add('active');
    }
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
});
