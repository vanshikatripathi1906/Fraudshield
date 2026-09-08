const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {

  try {

    // Get token from cookie
    const token = req.cookies.token;


    // Check if token exists
    if (!token) {

      return res.status(401).json({
        message: "Please login first"
      });

    }


    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    // Store decoded user information
    req.user = decoded;


    // Continue to the next function
    next();


  } catch (error) {

    return res.status(401).json({
      message: "Invalid or expired session"
    });

  }

};


module.exports = authMiddleware;