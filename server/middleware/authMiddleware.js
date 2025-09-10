const jwt = require('jsonwebtoken');

module.exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: 'Access Token required! please Login' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Access token required! please  Login' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or  Expired Token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
