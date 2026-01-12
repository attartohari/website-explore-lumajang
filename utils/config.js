
// Konfigurasi Pusat untuk Project Explore Lumajang
// Karena ini static site, key ini terekspos ke publik (BROWSER).
// Keamanan diatur via RLS (Row Level Security) di Supabase Dashboard.

export const CONFIG = {
    SUPABASE_URL: 'https://qcgfcepooylrbzdwlqei.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZ2ZjZXBvb3lscmJ6ZHdscWVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTk3NjIsImV4cCI6MjA4Mzc5NTc2Mn0.d2md_M2STG-9RUfV00swQyJpYONQk6_MfU_2T-dWtE4',

    // Konstanta lain jika diperlukan
    STORAGE_BUCKET: 'explore-lumajang'
};
