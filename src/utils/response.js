function sendSuccess(res, data, statusCode = 200) {
    res.status(statusCode).json({
        success: true,
        data
    });
}

function sendCreated(res, data) {
    res.status(201).json({
        success: true,
        data
    });
}

function sendPaginated(res, data, pagination) {
    res.json({
        success: true,
        data,
        pagination
    });
}

export { sendSuccess, sendCreated, sendPaginated };