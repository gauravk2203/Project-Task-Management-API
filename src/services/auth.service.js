import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import * as userModel from "../models/user.model.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/token.js";

let dummyHashPromise;

function getDummyHash() {
  if (!dummyHashPromise) {
    dummyHashPromise = bcrypt.hash("not-a-user-password", env.BCRYPT_SALT_ROUNDS);
  }
  return dummyHashPromise;
}

function duplicateEmailError() {
  return new AppError("Email is already registered", 409, [
    { field: "email", message: "Email is already registered" },
  ]);
}

export async function register({ name, email, password }) {
  const existing = await userModel.findUserByEmail(email);
  if (existing) {
    throw duplicateEmailError();
  }

  const passwordHash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  try {
    const user = await userModel.createUser({ name, email, passwordHash });
    return { user, token: signToken(user.id) };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw duplicateEmailError();
    }
    throw error;
  }
}

export async function login({ email, password }) {
  const user = await userModel.findUserByEmail(email);
  const hash = user ? user.passwordHash : await getDummyHash();
  const matches = await bcrypt.compare(password, hash);

  if (!user || !matches) {
    throw new AppError("Invalid email or password", 401);
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    token: signToken(user.id),
  };
}

export async function getProfile(userId) {
  const user = await userModel.findUserById(userId);
  if (!user) {
    throw new AppError("User no longer exists", 401);
  }
  return user;
}

export async function updateProfile(userId, { name, email }) {
  if (email !== undefined) {
    const existing = await userModel.findUserByEmail(email);
    if (existing && existing.id !== userId) {
      throw duplicateEmailError();
    }
  }

  try {
    const user = await userModel.updateUser(userId, { name, email });
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }
    return user;
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw duplicateEmailError();
    }
    throw error;
  }
}
