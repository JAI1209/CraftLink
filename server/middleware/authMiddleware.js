const jwt = require("jsonwebtoken");

const protect = async (
  req,
  res,
  next
) => {
  let token;

  // CHECK TOKEN
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith(
      "Bearer"
    )
  ) {
    try {
      // GET TOKEN
      token =
        req.headers.authorization.split(
          " "
        )[1];

      // VERIFY TOKEN
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // SAVE USER ID
      req.user = decoded.id;

      next();
    } catch (error) {
      return res.status(401).json({
        message:
          "Not authorized, token failed",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message:
        "Not authorized, no token",
    });
  }
};

module.exports = protect;