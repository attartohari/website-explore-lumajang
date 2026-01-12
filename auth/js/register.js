import { supabase } from '../../utils/supabase.js';

const regForm = document.getElementById('register-form');
const emailInput = document.getElementById('reg-email');
const passwordInput = document.getElementById('reg-password');
const errorMsg = document.getElementById('error-message');

if (regForm) {
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const btn = regForm.querySelector('button');
        const originalText = btn.innerHTML;

        if (password.length < 6) {
            showError('Password minimal 6 karakter.');
            return;
        }

        try {
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mendaftar...';
            btn.disabled = true;

            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) throw error;

            // Success
            alert('Pendaftaran berhasil! Silakan masuk.');
            window.location.href = 'login.html';

        } catch (err) {
            showError(err.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
}
