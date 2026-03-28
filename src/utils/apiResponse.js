const sendSuccess = (res, data = {}, status = 200) => res.status(status).json(data);

module.exports = { sendSuccess };
