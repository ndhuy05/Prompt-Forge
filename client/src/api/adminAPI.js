import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`
    };
};

// User APIs
export const getAllUsers = async () => {
    const response = await axios.get(`${API_URL}/admin/users`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const deleteUser = async (userId) => {
    const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

// Prompt APIs
export const getAllPrompts = async () => {
    const response = await axios.get(`${API_URL}/admin/prompts`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

export const deletePrompt = async (promptId) => {
    const response = await axios.delete(`${API_URL}/admin/prompts/${promptId}`, {
        headers: getAuthHeaders()
    });
    return response.data;
};

// Check if user is admin
export const isUserAdmin = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.role === 'admin';
        }
        return false;
    } catch (error) {
        return false;
    }
}; 