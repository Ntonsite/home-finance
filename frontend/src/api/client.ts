export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/login';
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'API Request Failed');
    }

    // Handle 204 No Content
    if (response.status === 204) return null;
    return response.json();
};
