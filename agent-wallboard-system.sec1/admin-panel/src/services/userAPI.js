// services/userAPI.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * 🆕 Helper function for error handling
 */
const handleAPIError = (error) => {
    if (error.message === 'Failed to fetch') {
        throw new Error('Network error. Please check your internet connection.');
    }
    throw error;
};

/**
 * User API Service
 */
export const userAPI = {
    /**
     * Get all users
     */
    getAllUsers: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            // 🆕 Handle authentication errors
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                throw new Error('Session expired. Please login again.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data; // Return the users array
        } catch (error) {
            console.error('Error fetching users:', error);
            handleAPIError(error);
        }
    },

    /**
     * Get user by ID
     */
    getUserById: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            handleAPIError(error);
        }
    },

    /**
     * Create new user
     */
    createUser: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create user');
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error creating user:', error);
            handleAPIError(error);
        }
    },

    /**
     * Update user
     */
    updateUser: async (userId, userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(userData)
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                throw new Error('Session expired. Please login again.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update user');
            }

            const data = await response.json();
            return data.data; // updated user
        } catch (error) {
            console.error('Error updating user:', error);
            handleAPIError(error);
        }
    },

    /**
     * Delete user (soft delete)
     */
    deleteUser: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                throw new Error('Session expired. Please login again.');
            }

            if (response.status === 204) return true; // no content, success

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to delete user');
            }

            const data = await response.json().catch(() => ({}));
            // backend ของคุณส่ง { success, message } → ให้รีเทิร์น true ก็พอสำหรับ UI
            return data?.success ?? true;
        } catch (error) {
            console.error('Error deleting user:', error);
            handleAPIError(error);
        }
    }
};
