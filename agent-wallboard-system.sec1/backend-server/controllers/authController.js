// controllers/authController.js
const authService = require('../services/authService');

exports.login = async (req, res) => {
    try {
        const { agentCode, supervisorCode, username } = req.body || {};
        const code = (agentCode || supervisorCode || username || '').trim();

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Agent code, Supervisor code, or username is required'
            });
        }

        const result = await authService.loginWithoutPassword(code);

        return res.status(200).json({
            success: true,
            data: result.user,
            token: result.token,
            expiresIn: result.expiresIn
        });
    } catch (error) {
        console.log('POST /api/auth/login body =', req.body);
        console.error('login error:', error);

        let status = 500;
        let message = 'Internal server error';

        if (error.message === 'Invalid username') {
            status = 400; // หรือ 404 ก็ได้ตามดีไซน์
            message = 'Invalid username';
        } else if (error.message === 'User account is inactive') {
            status = 403;
            message = 'User account is inactive';
        }

        return res.status(status).json({ success: false, message });
    }
};
