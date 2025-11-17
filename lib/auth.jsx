import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// hash password et bcrypt et returne le hashed password
export async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}
// compare le password avec le hashed password
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}
// genere un token JWT
export function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
}
// verifie le token JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}
