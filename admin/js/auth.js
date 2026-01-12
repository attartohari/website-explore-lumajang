
import { supabase } from '../../utils/supabase.js';

const loginForm = document.getElementById('login-form');
const errorMsg = document.getElementById('error-msg');
const btnLogin = document.getElementById('btn-login');

// Check Session on Load
const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    // If on login page and logged in -> go to dashboard
    if (window.location.pathname.includes('login.html') && session) {
        // Double check role? 
        // For UX speed we just redirect, dashboard will check role again
        window.location.href = 'dashboard.html';
        return;
    }

    // If on protected page and NOT logged in -> go to login
    if (!window.location.pathname.includes('login.html') && !session) {
        window.location.href = 'login.html';
        return;
    }

    // If logged in, check if admin
    if (session && !window.location.pathname.includes('login.html')) {
        const { data: roleData, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .single();

        if (error || !roleData || roleData.role !== 'admin') {
            await supabase.auth.signOut();
            alert("Akses Ditolak. Anda bukan Admin.");
            window.location.href = 'login.html';
        }
    }
};

if (window.location.pathname.includes('login.html')) {
    // Only run login logic if on login page
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        btnLogin.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
        btnLogin.disabled = true;
        errorMsg.style.display = 'none';

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
            btnLogin.innerHTML = 'Masuk <i class="fa-solid fa-arrow-right"></i>';
            btnLogin.disabled = false;
        } else {
            // Check Role
            const { data: roleData } = await supabase
                .from('user_roles') // Check the public.user_roles table
                .select('role')
                .eq('user_id', data.user.id)
                .single();

            if (!roleData || roleData.role !== 'admin') {
                await supabase.auth.signOut();
                errorMsg.textContent = "Akun ini tidak memiliki akses Admin.";
                errorMsg.style.display = 'block';
                btnLogin.innerHTML = 'Masuk <i class="fa-solid fa-arrow-right"></i>';
                btnLogin.disabled = false;
            } else {
                window.location.href = 'dashboard.html';
            }
        }
    });
} else {
    // We are on dashboard or other admin pages
    checkSession();

    // Logout Hook
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        });
    }
}

// Run check on load
// checkSession(); // Actually checkSession is called in logic block above, 
// wait, checkSession logic for login page is at top. 
// If i call it here again it might double run. 
// Simpler: Just run it.
if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('form')) {
    checkSession();
}
