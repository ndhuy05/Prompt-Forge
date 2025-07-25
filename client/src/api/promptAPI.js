import axios from 'axios';

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Helper để lấy token từ localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

/**
 * Lấy tất cả prompts
 */
export const getAllPrompts = async (params = {}) => {
    try {
        const response = await axios.get(`${API_URL}/prompts`, { params });
        return response.data;
    } catch (error) {
        console.error('Fetch prompts error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to fetch prompts';
        throw new Error(message);
    }
};

/**
 * Lấy thông tin prompt theo ID
 */
export const getPromptById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/prompts/${id}`);
        return response.data;
    } catch (error) {
        console.error('Fetch prompt error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to fetch prompt';
        throw new Error(message);
    }
};

/**
 * Tạo prompt mới (cần đăng nhập)
 */
export const createPrompt = async (promptData) => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const response = await axios.post(`${API_URL}/prompts`, promptData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Create prompt error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to create prompt';
        throw new Error(message);
    }
};

/**
 * Cập nhật prompt (cần đăng nhập)
 */
export const updatePrompt = async (id, promptData) => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const response = await axios.put(`${API_URL}/prompts/${id}`, promptData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Update prompt error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to update prompt';
        throw new Error(message);
    }
};

/**
 * Xóa prompt (cần đăng nhập)
 */
export const deletePrompt = async (id) => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const response = await axios.delete(`${API_URL}/prompts/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Delete prompt error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to delete prompt';
        throw new Error(message);
    }
};

/**
 * Like/Unlike prompt (cần đăng nhập)
 */
export const toggleLike = async (id) => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const response = await axios.post(`${API_URL}/prompts/${id}/like`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Toggle like error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to toggle like';
        throw new Error(message);
    }
};
