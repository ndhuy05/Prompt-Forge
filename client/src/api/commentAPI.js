import axios from 'axios';

// API Base URL
const API_URL = 'http://localhost:5000/api';

// Helper để lấy token từ localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

/**
 * Lấy tất cả comments của một prompt
 */
export const getCommentsByPrompt = async (promptId) => {
    try {
        const response = await axios.get(`${API_URL}/comments/prompt/${promptId}`);
        return response.data;
    } catch (error) {
        console.error('Fetch comments error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to fetch comments';
        throw new Error(message);
    }
};

/**
 * Thêm comment mới (cần đăng nhập)
 */
export const addComment = async (commentData) => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const response = await axios.post(`${API_URL}/comments`, commentData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Add comment error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to add comment';
        throw new Error(message);
    }
};

/**
 * Xóa comment (cần đăng nhập)
 */
export const deleteComment = async (commentId) => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const response = await axios.delete(`${API_URL}/comments/${commentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Delete comment error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to delete comment';
        throw new Error(message);
    }
};

/**
 * Cập nhật comment (cần đăng nhập)
 */
export const updateComment = async (commentId, commentData) => {
    try {
        const token = getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const response = await axios.put(`${API_URL}/comments/${commentId}`, commentData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error('Update comment error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to update comment';
        throw new Error(message);
    }
};
