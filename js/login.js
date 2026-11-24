// login.js – Login & Registrasi untuk PlantCare
// Data tersimpan di localStorage (demo saja; gunakan backend untuk produksi)

(function () {
  'use strict';

  // ── Jika sudah login, langsung ke dasbor ──────────────────
  if (localStorage.getItem('plantcare_user')) {
    window.location.replace('index.html');
    return;
  }

  // ── Referensi elemen ─────────────────────────────────────
  const loginForm     = document.getElementById('login-form');
  const registerForm  = document.getElementById('register-form');
  const toggleLink    = document.getElementById('toggle-link');
  const switchText    = document.getElementById('auth-switch-text');
  const demoBox       = document.getElementById('demo-box');
  const demoBtnEl     = document.getElementById('demo-fill-btn');
  const navMasuk      = document.getElementById('nav-masuk');
  const navDaftarBtn  = document.getElementById('nav-daftar-btn');

  // Form header elements
  const authKicker   = document.getElementById('auth-kicker');
  const authTitle    = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');

  // Message box
  const msgBox       = document.getElementById('auth-msg');
  const msgText      = document.getElementById('auth-msg-text');
  const msgIcon      = document.getElementById('auth-msg-icon');

  // Password toggles
  const pwdToggleLogin = document.getElementById('toggle-pwd-login');
  const pwdToggleReg   = document.getElementById('toggle-pwd-reg');

  // ── Helpers ──────────────────────────────────────────────
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('plantcare_users')) || []; }
    catch { return []; }
  }

  function setUsers(users) {
    localStorage.setItem('plantcare_users', JSON.stringify(users));
  }

  function showMsg(text, type = 'danger') {
    msgText.textContent = text;
    msgBox.className = `auth-alert show ${type}`;
    msgIcon.className = type === 'success'
      ? 'bi bi-check-circle-fill'
      : 'bi bi-exclamation-circle-fill';
  }

  function hideMsg() {
    msgBox.className = 'auth-alert';
  }

  function togglePassword(input, btn) {
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.querySelector('i').className = isHidden ? 'bi bi-eye-slash' : 'bi bi-eye';
  }

  // ── Mode: tampilkan LOGIN atau REGISTER ──────────────────
  let mode = 'login';

  function showLoginMode() {
    mode = 'login';
    loginForm.classList.remove('d-none');
    registerForm.classList.add('d-none');
    authKicker.textContent   = 'MASUK AKUN';
    authTitle.textContent    = 'Masuk ke Akun Anda';
    authSubtitle.textContent = 'Silakan masukkan surel dan kata sandi Anda untuk melanjutkan.';
    if (switchText) switchText.innerHTML = 'Belum punya akun? <span class="auth-switch-link" id="toggle-link">Daftar sekarang</span>';
    if (demoBox) demoBox.style.display = 'flex';
    if (demoBtnEl) demoBtnEl.textContent = 'Daftar';
    // Re-bind toggle link (innerHTML replaced)
    const tl = document.getElementById('toggle-link');
    if (tl) tl.addEventListener('click', showRegisterMode);
    if (navMasuk)    navMasuk.classList.add('active');
    if (navDaftarBtn) navDaftarBtn.onclick = showRegisterMode;
    hideMsg();
  }

  function showRegisterMode() {
    mode = 'register';
    loginForm.classList.add('d-none');
    registerForm.classList.remove('d-none');
    authKicker.textContent   = 'DAFTAR AKUN';
    authTitle.textContent    = 'Buat Akun Baru';
    authSubtitle.textContent = 'Isi formulir di bawah untuk mendaftarkan akun PlantCare Anda.';
    if (switchText) switchText.innerHTML = 'Sudah punya akun? <span class="auth-switch-link" id="toggle-link">Masuk di sini</span>';
    if (demoBox) demoBox.style.display = 'none';
    if (navMasuk)    navMasuk.classList.remove('active');
    // Re-bind toggle link
    const tl = document.getElementById('toggle-link');
    if (tl) tl.addEventListener('click', showLoginMode);
    if (navDaftarBtn) navDaftarBtn.onclick = showRegisterMode;
    hideMsg();
  }

  // ── Handle Login ─────────────────────────────────────────
  loginForm && loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pwd   = document.getElementById('login-password').value;
    const users = getUsers();
    const user  = users.find(u => u.email === email && u.password === pwd);
    if (!user) {
      showMsg('Surel atau kata sandi salah. Silakan coba lagi.', 'danger');
      return;
    }
    localStorage.setItem('plantcare_user', JSON.stringify({ email }));
    showMsg('Berhasil masuk! Mengarahkan ke dasbor…', 'success');
    setTimeout(() => window.location.replace('index.html'), 1300);
  });

  // ── Handle Register ───────────────────────────────────────
  registerForm && registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const email   = document.getElementById('register-email').value.trim();
    const pwd     = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    if (pwd.length < 6) {
      showMsg('Kata sandi minimal 6 karakter.', 'danger');
      return;
    }
    if (pwd !== confirm) {
      showMsg('Konfirmasi kata sandi tidak cocok.', 'danger');
      return;
    }
    const users = getUsers();
    if (users.some(u => u.email === email)) {
      showMsg('Surel ini sudah terdaftar. Silakan masuk.', 'danger');
      return;
    }
    users.push({ email, password: pwd });
    setUsers(users);
    localStorage.setItem('plantcare_user', JSON.stringify({ email }));
    showMsg('Pendaftaran berhasil! Mengarahkan ke dasbor…', 'success');
    setTimeout(() => window.location.replace('index.html'), 1300);
  });

  // ── Password Visibility Toggle ───────────────────────────
  if (pwdToggleLogin) {
    pwdToggleLogin.addEventListener('click', () => {
      togglePassword(document.getElementById('login-password'), pwdToggleLogin);
    });
  }
  if (pwdToggleReg) {
    pwdToggleReg.addEventListener('click', () => {
      togglePassword(document.getElementById('register-password'), pwdToggleReg);
    });
  }

  // ── Demo Box shortcut ─────────────────────────────────────
  if (demoBtnEl) {
    demoBtnEl.addEventListener('click', showRegisterMode);
  }

  // ── Nav bar buttons ───────────────────────────────────────
  if (navMasuk) navMasuk.addEventListener('click', (e) => { e.preventDefault(); showLoginMode(); });
  if (navDaftarBtn) navDaftarBtn.addEventListener('click', showRegisterMode);

  // ── Initial toggle link binding ───────────────────────────
  if (toggleLink) toggleLink.addEventListener('click', showRegisterMode);

})();
