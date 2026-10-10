import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "belajar-nulis-local-secret-key-super-safe-2026";

export function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

export function signToken(user) {
  return jwt.sign(
    {
      uid: user.id,
      email: user.email,
      displayName: user.display_name || "",
    },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function getUserFromRequest(req) {
  const authHeader = req.headers.get("authorization") || "";
  let token = "";
  if (authHeader.startsWith("Bearer ")) {
    token = authHeader.replace("Bearer ", "").trim();
  } else {
    // Check cookie fallback if needed
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/inkly_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) return null;
  return verifyToken(token);
}
