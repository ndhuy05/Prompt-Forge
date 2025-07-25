import axios from 'axios';

// API Base URL
const API_URL = 'http://localhost:5000/api';

/**
 * Lấy thống kê dashboard
 */
export const getDashboardStats = async () => {
    try {
        const response = await axios.get(`${API_URL}/dashboard/stats`);
        return response.data;
    } catch (error) {
        console.error('Fetch dashboard stats error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to fetch dashboard stats';
        throw new Error(message);
    }
};

/**
 * Lấy prompts gần đây
 */
export const getRecentPrompts = async () => {
    try {
        const response = await axios.get(`${API_URL}/dashboard/recent-prompts`);
        return response.data;
    } catch (error) {
        console.error('Fetch recent prompts error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to fetch recent prompts';
        throw new Error(message);
    }
};

/**
 * Lấy prompts phổ biến
 */
export const getPopularPrompts = async () => {
    try {
        const response = await axios.get(`${API_URL}/dashboard/popular-prompts`);
        return response.data;
    } catch (error) {
        console.error('Fetch popular prompts error:', error);
        const message = error.response?.data?.message || error.message || 'Failed to fetch popular prompts';
        throw new Error(message);
    }
};
