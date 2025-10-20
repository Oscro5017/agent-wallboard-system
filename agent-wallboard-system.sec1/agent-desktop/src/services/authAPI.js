// services/authAPI.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:3001/api';

export const authAPI = {
    async login(input) {
        const username = (input || '').trim();
        if (!username) throw new Error('Please enter your username/code');

        const res = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            throw new Error(data.message || `Login failed (${res.status})`);
        }

        // เก็บ token + user
        if (data.token) localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
    },

    getCurrentUser() {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    },
};
