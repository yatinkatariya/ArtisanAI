const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // Check if the token is sent in the Request Headers (Authorization: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "GokuSuperSecretKey123!");

      // Attach the user's ID and role to the request object
      req.user = decoded;

      // Everything is fine, go to the next function/route
      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      });
    }
  }

  // If no token is found at all
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
  }
};

module.exports = { protect };   