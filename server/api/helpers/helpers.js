// Response formatting utilities
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
        success: true,
        message
    };
    
    if (data !== null) {
        response.data = data;
    }
    
    return res.status(statusCode).json(response);
};

const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = null) => {
    const response = {
        success: false,
        message
    };
    
    if (errors) {
        response.errors = errors;
    }
    
    return res.status(statusCode).json(response);
};

// Pagination helpers
const getPagination = (page, limit) => {
    const pageNumber = Math.max(1, parseInt(page) || 1);
    const limitNumber = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNumber - 1) * limitNumber;
    
    return {
        page: pageNumber,
        limit: limitNumber,
        skip
    };
};

const getPaginationData = (page, limit, total) => {
    return {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
    };
};

// Search helpers
const buildSearchQuery = (searchTerm, fields = []) => {
    if (!searchTerm || fields.length === 0) {
        return {};
    }
    
    return {
        $or: fields.map(field => ({
            [field]: { $regex: searchTerm, $options: 'i' }
        }))
    };
};

// Sort helpers
const buildSortQuery = (sortBy, validSortFields = {}) => {
    if (!sortBy || !validSortFields[sortBy]) {
        return validSortFields.default || { createdAt: -1 };
    }
    
    return validSortFields[sortBy];
};

// Object helpers
const pick = (object, keys) => {
    return keys.reduce((obj, key) => {
        if (object && Object.prototype.hasOwnProperty.call(object, key)) {
            obj[key] = object[key];
        }
        return obj;
    }, {});
};

const omit = (object, keys) => {
    const result = { ...object };
    keys.forEach(key => delete result[key]);
    return result;
};

// Validation helpers
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

module.exports = {
    sendSuccess,
    sendError,
    getPagination,
    getPaginationData,
    buildSearchQuery,
    buildSortQuery,
    pick,
    omit,
    isValidObjectId,
    isValidEmail
};
