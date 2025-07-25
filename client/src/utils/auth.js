/**
 * Các hàm tiện ích xử lý xác thực
 */

/**
 * Kiểm tra email hợp lệ
 * @param {string} email - Email cần kiểm tra
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Kiểm tra mật khẩu mạnh
 * @param {string} password - Mật khẩu cần kiểm tra
 * @returns {object} - Đối tượng chứa kết quả đánh giá
 */
export const checkPasswordStrength = (password) => {
    if (!password) {
        return {
            score: 0,
            text: 'Weak',
            class: 'weak',
            width: '0%'
        }
    }

    let score = 0
    
    // Độ dài
    if (password.length >= 6) score += 1
    if (password.length >= 10) score += 1
    
    // Độ phức tạp
    if (/[A-Z]/.test(password)) score += 1 // Chữ hoa
    if (/[a-z]/.test(password)) score += 1 // Chữ thường
    if (/[0-9]/.test(password)) score += 1 // Số
    if (/[^A-Za-z0-9]/.test(password)) score += 1 // Ký tự đặc biệt
    
    // Tính width
    const width = Math.min(100, (score / 6) * 100)
    
    // Xác định mức độ
    let text = 'Weak'
    let strengthClass = 'weak'
    
    if (score >= 5) {
        text = 'Strong'
        strengthClass = 'strong'
    } else if (score >= 3) {
        text = 'Medium'
        strengthClass = 'medium'
    }
    
    return {
        score,
        text,
        class: strengthClass,
        width: `${width}%`
    }
}

/**
 * Xác thực username
 * @param {string} username - Username cần kiểm tra
 * @returns {string|null} - Lỗi hoặc null nếu hợp lệ
 */
export const validateUsername = (username) => {
    if (!username) return 'Username is required'
    if (username.length < 3) return 'Username must be at least 3 characters'
    if (username.length > 20) return 'Username must be less than 20 characters'
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Username can only contain letters, numbers, and underscores'
    return null
}

/**
 * Xác thực email
 * @param {string} email - Email cần kiểm tra
 * @returns {string|null} - Lỗi hoặc null nếu hợp lệ
 */
export const validateEmail = (email) => {
    if (!email) return 'Email is required'
    if (!isValidEmail(email)) return 'Please enter a valid email address'
    return null
}

/**
 * Xác thực mật khẩu
 * @param {string} password - Mật khẩu cần kiểm tra
 * @returns {string|null} - Lỗi hoặc null nếu hợp lệ
 */
export const validatePassword = (password) => {
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Password must be at least 6 characters'
    
    return null
}

/**
 * Xác thực xác nhận mật khẩu
 * @param {string} confirmPassword - Xác nhận mật khẩu
 * @param {string} password - Mật khẩu gốc
 * @returns {string|null} - Lỗi hoặc null nếu hợp lệ
 */
export const validateConfirmPassword = (confirmPassword, password) => {
    if (!confirmPassword) return 'Please confirm your password'
    if (confirmPassword !== password) return 'Passwords do not match'
    return null
}

/**
 * Xác thực họ tên
 * @param {string} fullName - Họ tên cần kiểm tra
 * @returns {string|null} - Lỗi hoặc null nếu hợp lệ
 */
export const validateFullName = (fullName) => {
    if (!fullName) return null // Không bắt buộc
    if (fullName.length < 2) return 'Full name must be at least 2 characters'
    if (fullName.length > 50) return 'Full name must be less than 50 characters'
    return null
}
