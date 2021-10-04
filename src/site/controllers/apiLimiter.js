const rateLimit = require("express-rate-limit");

module.exports = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // limit each IP to 60 requests per windowMs,
    message: {
        error: "Too many requests. Please only make maximum 60 requests in 15 minutes"
    },
    statusCode: 429, // 429 status = Too Many Requests (RFC 6585)
    headers: true, //Send custom rate limit header with limit and remaining
});
