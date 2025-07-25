import axios from 'axios';

// API Base URL
const API_URL = 'http://localhost:5000/api';

/**
 * Lấy tất cả tags
 */
export const getAllTags = async () => {
    try {
        const response = await axios.get(`${API_URL}/tags`);
        return response.data;
    } catch (error) {
        console.error('Fetch tags error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to fetch tags';
        throw new Error(message);
    }
};

/**
 * Lấy tags phổ biến nhất
 */
export const getPopularTags = async (limit = 10) => {
    try {
        const response = await axios.get(`${API_URL}/tags`, {
            params: { sort: 'popular', limit }
        });
        return response.data;
    } catch (error) {
        console.error('Fetch popular tags error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to fetch popular tags';
        throw new Error(message);
    }
};

/**
 * Tìm kiếm tags theo tên
 */
export const searchTags = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/tags`, {
            params: { search: query }
        });
        return response.data;
    } catch (error) {
        console.error('Search tags error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to search tags';
        throw new Error(message);
    }
};

/**
 * Lấy thống kê của tag
 */
export const getTagStats = async (tagName) => {
    try {
        const response = await axios.get(`${API_URL}/tags/${tagName}/stats`);
        return response.data;
    } catch (error) {
        console.error('Fetch tag stats error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to fetch tag stats';
        throw new Error(message);
    }
};
