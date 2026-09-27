// 1. Initialize Supabase
const SUPABASE_URL = "https://supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzanJrZmt6dmJtYmlkY2VvcXFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NDk2ODgsImV4cCI6MjEwNjAyNTY4OH0.DiXjPLs6TFq-01CljliHhYC7EDk5eHriraZzkfAwiCo";

// FIXED: Using upper-case 'Supabase' from the CDN script file
const supabaseClient = Supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let registrationEmail = "";

// Select DOM UI elements
const loginScreen = document.getElementById('login-screen');
const signupScreen = document.getElementById('signup-screen');
const verifyScreen = document.getElementById('verify-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const welcomeMsg = document.getElementById('user-welcome-msg');

// Handle navigation screen toggling
document.getElementById('go-to-signup').addEventListener('click', () => switchScreen(signupScreen));
document.getElementById('go-to-login').addEventListener('click', () => switchScreen(loginScreen));

function switchScreen(activeScreen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    activeScreen.classList.add('active');
}

// 2. AUTOMATIC LOGIN DETECTOR
// This monitors the URL token data stream and flips your screen context dynamically!
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session) {
        // Extract their metadata name if using GitHub, fallback to their email if using standard password flows
        const displayName = session.user.user_metadata.full_name || session.user.email;
        welcomeMsg.innerText = `Hello, ${displayName}! You have successfully logged in.`;
        switchScreen(dashboardScreen);
    } else {
        // Clear screen state and reset context home if no session found
        switchScreen(loginScreen);
    }
});

// 3. SIGNUP ACTION (Traditional Email & Password)
document.getElementById('btn-signup').addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (!email || !password) return alert("Please fill out all fields.");

    const { data, error } = await supabaseClient.auth.signUp({ email, password });

    if (error) {
        alert("Error signing up: " + error.message);
    } else {
        registrationEmail = email; // Cache layout string email for the verification method below
        alert("Account initialized! Check your email inbox for your 6-digit token.");
        switchScreen(verifyScreen);
    }
});

// 4. OTP VERIFICATION ACTION (Confirms Email via Code)
document.getElementById('btn-verify').addEventListener('click', async () => {
    const code = document.getElementById('verify-code').value;

    if (!code) return alert("Please enter the verification code.");

    const { data, error } = await supabaseClient.auth.verifyOtp({
        email: registrationEmail,
        token: code,
        type: 'email' // Changed to 'email' to cleanly parse standard 6-digit verification code flows
    });

    if (error) {
        alert("Verification failed: " + error.message);
    }
    // onAuthStateChange handles UI presentation instantly on success
});

// 5. LOGIN ACTION (Standard Password Verification)
document.getElementById('btn-login').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) return alert("Please fill out all fields.");

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Login failed: " + error.message);
    }
});

// 6. GITHUB OAUTH SIGN-IN ACTION
async function signInWithGitHub() {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: window.location.href // Redirects back directly to your hosted page URL
        }
    });

    if (error) {
        alert("GitHub authentication failed: " + error.message);
    }
}

document.getElementById('btn-github-login').addEventListener('click', signInWithGitHub);
document.getElementById('btn-github-signup').addEventListener('click', signInWithGitHub);

// 7. LOGOUT ACTION
document.getElementById('btn-logout').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.hash = ""; // Clean up the token leftovers in the URL bar area
});
