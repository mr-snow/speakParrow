const jwt = require('jsonwebtoken');

module.exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log(authHeader);
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const validate = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY,
      (err, user) => {
        if (err) {
          return res
            .status(403)
            .json({ message: 'Invalide or  Expired Token' });
        }
        req.user = user;
        next();
      }
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
