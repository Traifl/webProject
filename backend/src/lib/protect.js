import jwt from "jsonwebtoken";

export const protectedRoute = (req, res, next)=>{
  try {
    const token = req.cookies?.token;

    if (!token) return res.status(401).json({error: "No token, access denied"});

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {username: decoded.username};

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({error: "Invalid token"});
  }
};
