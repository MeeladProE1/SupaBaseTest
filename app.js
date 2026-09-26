// 1. Initialize Supabase
const SUPABASE_URL = "https://hsjrkfkzvbmbidceoqqk.supabase.co"; // Crucial: Removed the trailing slash '/'
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzanJrZmt6dmJtYmlkY2VvcXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDk2ODgsImV4cCI6MjEwNjAyNTY4OH0.DiXjPLs6TFq-01CljliHhYC7EDk5eHriraZzkfAwiCo";

// FIXED: Renamed the instance variable to avoid crashing your browser on startup
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Track global email string to pass into the OTP verification token function
let registrationEmail = "";

// Select DOM UI elements
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const verifyScreen = document.getElementById('verify-screen');

// Handle navigation screen toggling
document.getElementById('go-to-signup').addEventListener('click', () => switchScreen(signupScreen));
document.getElementById('go-to-login').addEventListener('click', () => switchScreen(loginScreen));

function switchScreen(activeScreen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    activeScreen.classList.add('active');
}

// 2. SIGNUP ACTION (Traditional Email & Password)
document.getElementById('btn-signup').addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!email || !password) return alert("Please fill out all fields.");

    const { data, error } = await supabaseClient.auth.signUp({ email, password });

    if (error) {
        alert("Error signing up: " + error.message);
    } else {
        registrationEmail = email; // Cache email for the next OTP confirmation check step
        alert("Account initialized! Check your email inbox for your 6-digit token.");
        switchScreen(verifyScreen);
    }
});

// 3. OTP VERIFICATION ACTION (Confirms Email via Code)
document.getElementById('btn-verify').addEventListener('click', async () => {
    const code = document.getElementById('verify-code').value;

    if (!code) return alert("Please enter the verification code.");

    const { data, error } = await supabaseClient.auth.verifyOtp({
        email: registrationEmail,
        token: code,
        type: 'signup'
    });

    if (error) {
        alert("Verification failed: " + error.message);
    } else {
        alert("Email verified successfully! You are logged in.");
        console.log("Logged in user identity context:", data.user);
    }
});

// 4. LOGIN ACTION (Standard Password Verification)
document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) return alert("Please fill out all fields.");

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Login failed: " + error.message);
    } else {
        alert("Welcome back! Successful login.");
        console.log("Logged in user identity context:", data.user);
    }
});

// 5. GITHUB OAUTH SIGN-IN ACTION
async function signInWithGitHub() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: window.location.href // Redirects users right back to your page when finished
        }
    });

    if (error) {
        alert("GitHub authentication failed: " + error.message);
    }
}

// Bind OAuth redirect function to both GitHub action buttons
document.getElementById('btn-github-login').addEventListener('click', signInWithGitHub);
document.getElementById('btn-github-signup').addEventListener('click', signInWithGitHub);
