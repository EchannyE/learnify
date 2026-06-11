import jwt  from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  // ── 1. Check header presence ──────────────────────────────────────────────
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised. No token provided.",
    });
  }

  // ── 2. Extract token ───────────────────────────────────────────────────────
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised. Token is missing.",
    });
  }

  // ── 3. Verify token ────────────────────────────────────────────────────────
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (jwtErr) {
    const message =
      jwtErr.name === "TokenExpiredError"
        ? "Session expired. Please log in again."
        : "Invalid token. Please log in again.";

    return res.status(401).json({ success: false, message });
  }

  // ── 4. Load user from DB ───────────────────────────────────────────────────
  try {
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account not found.",
      });
    }

    req.user = user;
    next();
  } catch {
    // DB error — not a token error, so return 500 not 401
    res.status(500).json({
      success: false,
      message: "Authentication error. Please try again.",
    });
  }
};
