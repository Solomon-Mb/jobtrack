const AUTH_URL = "http://localhost:5000/api/auth";
const TOKEN_KEY = "jobtrack_token";
const USER_KEY = "jobtrack_user";

const authSection = document.getElementById("authSection");
const appSection = document.getElementById("appSection");
const userBar = document.getElementById("userBar");
const userNameLabel = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

const authTitle = document.getElementById("authTitle");
const authError = document.getElementById("authError");
const authSwitch = document.getElementById("authSwitch");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

let onLoginCallback = function () {};
let onLogoutCallback = function () {};
let showingLogin = true;

// ===== Session (kept in the browser so a refresh keeps you logged in) =====

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function saveSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch (error) {
        return null;
    }
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
}

// Adds the login token to the options of a fetch() call
function withAuth(options) {
    const result = Object.assign({}, options);

    result.headers = Object.assign({}, result.headers, {
        Authorization: "Bearer " + getToken()
    });

    return result;
}

// ===== Screens =====

function showAuthError(message) {
    authError.textContent = message;
    authError.classList.toggle("hidden", message === "");
}

function showAuthScreen(message) {
    appSection.classList.add("hidden");
    userBar.classList.add("hidden");
    authSection.classList.remove("hidden");
    showAuthError(message || "");
}

function showAppScreen() {
    const user = getSavedUser();

    userNameLabel.textContent = user ? user.name : "";
    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    userBar.classList.remove("hidden");
}

function showLoginForm(showLogin) {
    showingLogin = showLogin;

    loginForm.classList.toggle("hidden", !showLogin);
    registerForm.classList.toggle("hidden", showLogin);

    authTitle.textContent = showLogin ? "Log in" : "Create account";
    authSwitch.textContent = showLogin
        ? "Need an account? Register"
        : "Already have an account? Log in";

    showAuthError("");
}

// ===== Talking to the auth API =====

async function authRequest(path, data) {
    let response;

    try {
        response = await fetch(AUTH_URL + path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    } catch (error) {
        throw new Error("Could not reach the server. Is the backend running?");
    }

    let body = {};

    try {
        body = await response.json();
    } catch (error) {
        // response had no JSON body
    }

    if (!response.ok) {
        throw new Error(body.error || "Something went wrong");
    }

    return body;
}

async function logIn(email, password) {
    const result = await authRequest("/login", { email: email, password: password });

    saveSession(result.token, result.user);
    showAppScreen();
    onLoginCallback();
}

function logout(message) {
    clearSession();
    onLogoutCallback();
    showLoginForm(true);
    showAuthScreen(message);
}

// ===== Events =====

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
        await logIn(
            document.getElementById("loginEmail").value,
            document.getElementById("loginPassword").value
        );
        loginForm.reset();
    } catch (error) {
        showAuthError(error.message);
    }
});

registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;

    try {
        await authRequest("/register", {
            name: document.getElementById("registerName").value,
            email: email,
            password: password
        });

        await logIn(email, password);
        registerForm.reset();
    } catch (error) {
        showAuthError(error.message);
    }
});

authSwitch.addEventListener("click", function (event) {
    event.preventDefault();
    showLoginForm(!showingLogin);
});

logoutBtn.addEventListener("click", function () {
    logout();
});

// ===== Start =====

// onLogin runs when the user is (or becomes) logged in, onLogout when they leave
function initAuth(onLogin, onLogout) {
    onLoginCallback = onLogin;
    onLogoutCallback = onLogout;

    if (getToken()) {
        showAppScreen();
        onLoginCallback();
    } else {
        showAuthScreen();
    }
}
