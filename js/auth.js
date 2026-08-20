function initLoginForm() {
  const form = document.getElementById('login-form');
  const errorBox = document.getElementById('login-error');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.classList.remove('visible');

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Prijava ...';

    try {
      // TODO: ko backend obstaja, odstrani spodnji mock in odkomentiraj klic API-ja
      // const { token, user } = await API.login(username, password);

      await new Promise((r) => setTimeout(r, 400));
      const token = 'mock-token';
      const user = { username };

      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      window.location.href = 'dashboard.html';
    } catch (err) {
      errorBox.textContent = err.message || 'Napačno uporabniško ime ali geslo.';
      errorBox.classList.add('visible');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Prijava';
    }
  });
}

function requireAuth() {
  if (!localStorage.getItem('auth_token')) {
    window.location.href = 'index.html';
  }
}

function logout() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', initLoginForm);
