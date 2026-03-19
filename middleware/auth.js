const SCHOOL_API_BASE = process.env.MZIURI_BACK_URL;

const verifyWithSchoolAPI = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing',
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const response = await fetch(`${SCHOOL_API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    const user = await response.json();
    req.userId = user.id.toString();
    req.userEmail = user.email;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token verification failed',
    });
  }
};

const verifyToken = verifyWithSchoolAPI;
const isTokenActive = verifyWithSchoolAPI;
const protectEndpoint = verifyWithSchoolAPI;

module.exports = {
  verifyToken,
  isTokenActive,
  protectEndpoint,
};