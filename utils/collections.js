import { supabase } from './supabase.js';

class CollectionsManager {
    constructor() {
        this.favorites = new Set();
        this.initialized = false;
        this.userId = null;
        this.STORAGE_KEY = 'lumajang_favs';
    }

    async init() {
        if (this.initialized) return;

        // 1. Load from LocalStorage first (instant UI)
        const local = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];
        local.forEach(id => this.favorites.add(id));

        // 2. Check Auth
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            this.userId = session.user.id;
            await this.syncWithDB();
        }

        this.initialized = true;
        this.notifyListeners();
    }

    async syncWithDB() {
        if (!this.userId) return;

        // 1. Fetch from DB
        const { data: dbFavs, error } = await supabase
            .from('collections')
            .select('destination_id')
            .eq('user_id', this.userId);

        if (error) {
            console.error("Collections Sync Error:", error);
            return;
        }

        const dbSet = new Set(dbFavs.map(f => f.destination_id));

        // 2. Identify inconsistencies
        // Items in Local but not in DB -> Add to DB (Sync up)
        const toAdd = [...this.favorites].filter(id => !dbSet.has(id));

        if (toAdd.length > 0) {
            const inserts = toAdd.map(id => ({ user_id: this.userId, destination_id: id }));
            await supabase.from('collections').insert(inserts);
            toAdd.forEach(id => dbSet.add(id));
        }

        // 3. Update local state to match DB (Source of Truth)
        this.favorites = dbSet;
        this.saveToLocal();
    }

    async toggle(id) {
        if (this.favorites.has(id)) {
            await this.remove(id);
            return false; // Result: Removed
        } else {
            await this.add(id);
            return true; // Result: Added
        }
    }

    async add(id) {
        this.favorites.add(id);
        this.saveToLocal();
        this.notifyListeners();

        if (this.userId) {
            await supabase.from('collections').insert([{ user_id: this.userId, destination_id: id }]);
        }
    }

    async remove(id) {
        this.favorites.delete(id);
        this.saveToLocal();
        this.notifyListeners();

        if (this.userId) {
            await supabase.from('collections').delete().match({ user_id: this.userId, destination_id: id });
        }
    }

    has(id) {
        return this.favorites.has(id);
    }

    getAll() {
        return [...this.favorites];
    }

    saveToLocal() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify([...this.favorites]));
    }

    // Simple Event Sourcing for UI updates
    subscribe(listener) {
        document.addEventListener('collections:update', listener);
    }

    notifyListeners() {
        document.dispatchEvent(new Event('collections:update'));
    }
}

export const collections = new CollectionsManager();
