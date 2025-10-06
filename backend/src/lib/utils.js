import jwt from "jsonwebtoken"

export function generateToken(username) {
    return jwt.sign({username}, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  }