(function () {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
  }

  // Utilities
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const hasNumber = /\d/;

  function getStorageKeyByRole(role) {
    return `tourEaseUsers:${role}`; // user, driver, guide
  }

  function loadUsers(role) {
    try {
      return JSON.parse(localStorage.getItem(getStorageKeyByRole(role)) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveUsers(role, users) {
    localStorage.setItem(getStorageKeyByRole(role), JSON.stringify(users));
  }

  function setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  function redirectToDashboard(role) {
    const map = {
      user: 'user-dashboard.html',
      driver: 'driver-dashboard.html',
      guide: 'guide-dashboard.html',
    };
    const url = map[role];
    if (url) window.location.href = url;
  }

  // Auth page logic
  const roleTabs = document.getElementById('roleTabs');
  const authToggle = document.getElementById('authToggle');
  const authForm = document.getElementById('authForm');
  const submitBtn = document.getElementById('submitBtn');

  let state = {
    role: 'user',
    mode: 'login', // login | register
  };

  function updateFormVisibility() {
    const isRegister = state.mode === 'register';
    // Show name and phone for register modes (all roles) and role-specific fields
    document.querySelectorAll('[data-field="name"]').forEach(el => el.style.display = isRegister ? '' : 'none');
    document.querySelectorAll('[data-field="phone"]').forEach(el => el.style.display = isRegister ? '' : 'none');

    document.querySelectorAll('.role-only').forEach(el => {
      const show = isRegister && el.getAttribute('data-role') === state.role;
      el.style.display = show ? '' : 'none';
    });

    submitBtn && (submitBtn.textContent = state.mode === 'login' ? 'Login' : 'Register');
  }

  function setActiveTab(container, selector, activeValueAttr, value) {
    if (!container) return;
    container.querySelectorAll(selector).forEach(btn => {
      if (btn.getAttribute(activeValueAttr) === value) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  if (roleTabs) {
    roleTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-role]');
      if (!btn) return;
      state.role = btn.getAttribute('data-role');
      setActiveTab(roleTabs, '.tab', 'data-role', state.role);
      updateFormVisibility();
    });
  }

  if (authToggle) {
    authToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mode]');
      if (!btn) return;
      state.mode = btn.getAttribute('data-mode');
      setActiveTab(authToggle, '.toggle-btn', 'data-mode', state.mode);
      updateFormVisibility();
    });
  }

  function showError(field, message) {
    const err = document.querySelector(`[data-error-for="${field}"]`);
    if (err) err.textContent = message || '';
  }

  function clearErrors() { document.querySelectorAll('.error').forEach(e => e.textContent = ''); }

  function validateForm(values) {
    clearErrors();
    let ok = true;

    if (state.mode === 'login') {
      if (!values.email || !emailRegex.test(values.email)) { showError('email', 'Enter a valid email.'); ok = false; }
      if (!values.password || values.password.length < 6) { showError('password', 'Enter your password.'); ok = false; }
      return ok;
    }

    // register
    if (!values.name) { showError('name', 'Name is required.'); ok = false; }
    if (!values.email || !emailRegex.test(values.email)) { showError('email', 'Enter a valid email.'); ok = false; }
    if (!values.password || values.password.length < 6 || !hasNumber.test(values.password)) { showError('password', '6+ chars, include a number.'); ok = false; }
    if (!values.phone) { showError('phone', 'Phone is required.'); ok = false; }

    if (state.role === 'driver') {
      if (!values.vehicleType) { showError('vehicleType', 'Vehicle type required.'); ok = false; }
      if (!values.vehicleNumber) { showError('vehicleNumber', 'Vehicle number required.'); ok = false; }
      if (!values.availability) { showError('availability', 'Select availability.'); ok = false; }
    }
    if (state.role === 'guide') {
      if (!values.languages) { showError('languages', 'Enter languages.'); ok = false; }
      if (values.experience === '' || values.experience === null || isNaN(Number(values.experience))) { showError('experience', 'Enter experience years.'); ok = false; }
    }
    return ok;
  }

  function findUserByEmail(role, email) {
    const users = loadUsers(role);
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  function handleRegister(values) {
    const users = loadUsers(state.role);
    if (findUserByEmail(state.role, values.email)) {
      showError('email', 'Email already registered.');
      return;
    }
    const user = { role: state.role, name: values.name, email: values.email, password: values.password, phone: values.phone };
    if (state.role === 'driver') {
      user.vehicleType = values.vehicleType; user.vehicleNumber = values.vehicleNumber; user.availability = values.availability || 'available';
    } else if (state.role === 'guide') {
      user.languages = values.languages; user.experience = Number(values.experience || 0);
    }
    users.push(user);
    saveUsers(state.role, users);
    alert('Registration successful. You can now log in.');
    state.mode = 'login';
    setActiveTab(authToggle, '.toggle-btn', 'data-mode', state.mode);
    updateFormVisibility();
  }

  function handleLogin(values) {
    const user = findUserByEmail(state.role, values.email);
    if (!user || user.password !== values.password) {
      showError('email', 'Invalid credentials or role.');
      showError('password', '');
      return;
    }
    setCurrentUser(user);
    redirectToDashboard(user.role);
  }

  if (authForm) {
    updateFormVisibility();
    authForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const values = {
        name: document.getElementById('name')?.value?.trim() || '',
        email: document.getElementById('email')?.value?.trim() || '',
        password: document.getElementById('password')?.value || '',
        phone: document.getElementById('phone')?.value?.trim() || '',
        vehicleType: document.getElementById('vehicleType')?.value?.trim() || '',
        vehicleNumber: document.getElementById('vehicleNumber')?.value?.trim() || '',
        availability: document.getElementById('availability')?.value || '',
        languages: document.getElementById('languages')?.value?.trim() || '',
        experience: document.getElementById('experience')?.value || '',
      };

      if (!validateForm(values)) return;
      if (state.mode === 'register') handleRegister(values);
      else handleLogin(values);
    });
  }

  // Dashboard rendering
  window.renderDashboard = function (role) {
    const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!user || user.role !== role) {
      window.location.href = 'auth.html';
      return;
    }
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v ?? ''; };
    set('userName', user.name || '');
    set('infoName', user.name || '');
    set('infoEmail', user.email || '');
    set('infoPhone', user.phone || '');
    if (role === 'driver') {
      set('infoVehicleType', user.vehicleType || '');
      set('infoVehicleNumber', user.vehicleNumber || '');
      set('infoAvailability', user.availability || '');
    }
    if (role === 'guide') {
      set('infoLanguages', user.languages || '');
      set('infoExperience', String(user.experience ?? ''));
    }
  }

  window.logout = function () {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  }
})();

