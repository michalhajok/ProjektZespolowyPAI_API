import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { ok, created, fail } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const JWT_EXPIRES = process.env.JWT_EXPIRES || "1h";
const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_prod";

export const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return fail(res, 409, "Email already in use");

  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({
    email,
    password: hash,
    firstName,
    lastName,
    phone,
  });

  const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
  return created(
    res,
    { user: { id: user._id, email: user.email, role: user.role }, token },
    "User registered"
  );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, isActive: true });
  if (!user) return fail(res, 401, "Invalid credentials");
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return fail(res, 401, "Invalid credentials");

  user.lastLogin = new Date();
  await user.save();

  const token = jwt.sign({ sub: user._id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
  return ok(
    res,
    { user: { id: user._id, email: user.email, role: user.role }, token },
    "Logged in"
  );
});
