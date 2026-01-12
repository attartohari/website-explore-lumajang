import { supabase } from '../../utils/supabase.js';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('error-message');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerHTML;

        if (!email || !password) {
            showError('Email dan Password wajib diisi.');
            return;
        }

        try {
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
            btn.disabled = true;

            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            // Success
            // Check if admin to redirect to admin/dashboard, else home
            // But requirement says: "User login should not grant edit access. Users are only for user-side features."
            // So we redirect to Home or previous page.

            // Allow admin to go to dashboard if they want, but default to home for general users.
            // Let's just go to index.html for now.
            window.location.href = '../index.html';

        } catch (err) {
            showError(err.message === "Invalid login credentials" ? "Email atau password salah." : err.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
}
