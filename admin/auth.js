(function () {
  const STORAGE_KEY = "solusi_admin_logged_in";
  const USERNAME = "admin";
  const PASSWORD = "solusi123";

  function readSession() {
    return (
      window.localStorage.getItem(STORAGE_KEY) ||
      window.sessionStorage.getItem(STORAGE_KEY) ||
      ""
    );
  }

  function writeSession(remember) {
    const targetStorage = remember ? window.localStorage : window.sessionStorage;
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    targetStorage.setItem(STORAGE_KEY, "true");
  }

  function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("redirect");
  }

  function isLoggedIn() {
    return readSession() === "true";
  }

  function login(username, password, remember) {
    if (username === USERNAME && password === PASSWORD) {
      writeSession(Boolean(remember));
      return true;
    }

    return false;
  }

  function logout() {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
  }

  function requireAuth() {
    if (!isLoggedIn()) {
      const redirect = encodeURIComponent(
        `${window.location.pathname}${window.location.search || ""}`
      );
      window.location.replace(`/admin/login?redirect=${redirect}`);
    }
  }

  function redirectIfLoggedIn() {
    if (isLoggedIn()) {
      window.location.replace(getRedirectUrl() || "/admin");
    }
  }

  window.AdminAuth = {
    isLoggedIn,
    login,
    logout,
    requireAuth,
    redirectIfLoggedIn,
    getRedirectUrl,
  };
})();
