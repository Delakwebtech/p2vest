const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };

    error.message = err.message;

    // Log to console for the dev
    console.log(err);

    // MySQL duplicate key error
    if (err.code === 'ER_DUP_ENTRY') {
        const message = `Duplicate key error: ${err.message}`;
        error = new ErrorResponse(message, 400);
    }

    // MySQL syntax error
    if (err.code === 'ER_PARSE_ERROR') {
        const message = `Syntax error in SQL query: ${err.message}`;
        error = new ErrorResponse(message, 400);
    }

    // MySQL foreign key constraint error
    if (err.code === 'ER_ROW_IS_REFERENCED') {
        const message = `Foreign key constraint error: ${err.message}`;
        error = new ErrorResponse(message, 400);
    }

    // Handle other MySQL errors or default to server error
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

module.exports = errorHandler;
