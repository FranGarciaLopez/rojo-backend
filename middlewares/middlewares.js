const jwt = require("jsonwebtoken");

const authMiddlewares = {

  validateToken: (req, res, next) => {
    
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "You are not authorized" });
    }

    try {

      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.SECRET);

      req.user = { ...decoded };
      next();

    } catch (err) {
      console.log("Error validating token", err);
      return res.status(401).send("You are not authorized");
    }
  },

  isAdmin: (req, res, next) => {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .send("You are not authorized to access this resource");
    }
    next();
  },
};

module.exports = authMiddlewares;