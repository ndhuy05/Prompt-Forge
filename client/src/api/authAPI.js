import axios from 'axios';

// API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Đăng ký người dùng mới
 * @param {Object} userData - Thông tin đăng ký
 */
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, userData);
        
        if (response.data.success) {
            // Lưu token và thông tin user vào localStorage
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        const message = error.response?.data?.message || error.message || 'Registration failed';
        throw new Error(message);
    }
};

/**
 * Đăng nhập người dùng
 * @param {Object} credentials - Thông tin đăng nhập
 */
export const loginUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);
        
        if (response.data.success) {
            // Lưu token và thông tin user vào localStorage
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        const message = error.response?.data?.message || error.message || 'Login failed';
        throw new Error(message);
    }
};

/**
 * Đăng xuất người dùng
 */
export const logoutUser = async () => {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            await axios.post(`${API_URL}/auth/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        }
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        // Luôn xóa thông tin đăng nhập khỏi localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

/**
 * Lấy thông tin user hiện tại
 */
export const getCurrentUser = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }
        
        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        return response.data;
    } catch (error) {
        console.error('Fetch user error:', error);
        // Nếu lỗi 401 (không xác thực), xóa thông tin đăng nhập
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        const message = error.response?.data?.message || error.message || 'Failed to fetch user';
        throw new Error(message);
    }
};

/**
 * Cập nhật thông tin hồ sơ người dùng
 */
export const updateProfile = async (profileData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const response = await axios.put(`${API_URL}/auth/profile`, profileData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
            // Cập nhật thông tin user trong localStorage
            localStorage.setItem('user', JSON.stringify(response.data.data));
        }
        
        return response.data;
    } catch (error) {
        console.error('Update profile error:', error);
        const message = error.response?.data?.message || error.message || 'Update failed';
        throw new Error(message);
    }
};

/**
 * Đổi mật khẩu người dùng
 */
export const changePassword = async (passwordData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication required');
        }
        
        const response = await axios.put(`${API_URL}/auth/password`, passwordData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        return response.data;
    } catch (error) {
        console.error('Change password error:', error);
        const message = error.response?.data?.message || error.message || 'Password change failed';
        throw new Error(message);
    }
};

/**
 * Kiểm tra người dùng đã đăng nhập chưa
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

/**
 * Lấy thông tin người dùng từ localStorage
 */
export const getUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    }
    return null;
};

/**
 * Kiểm tra người dùng có quyền admin không
 */
export const isAdmin = () => {
    const user = getUser();
    return user?.role === 'admin';
};
