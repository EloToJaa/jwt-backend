import jwt from "jsonwebtoken";
import { loadEnv } from "../env.js";
import User from "../types/User.js";

export const generateAccessToken = async (user: User) => {
	return await jwt.sign(user, loadEnv().ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});
};

export const generateRefreshToken = async (user: User) => {
	return await jwt.sign(user, loadEnv().REFRESH_TOKEN_SECRET);
};
