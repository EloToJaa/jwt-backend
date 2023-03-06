import { hash } from "argon2";
import express from "express";
import { verify } from "jsonwebtoken";
import { loadEnv } from "../env.js";
import { generateAccessToken, generateRefreshToken } from "../lib/auth.js";
import { getErrorMessage } from "../lib/utils.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import UserType from "../types/User.js";
import LoginValidation from "../validation/login.js";
import RegisterValidation from "../validation/register.js";

const router = express.Router();

router.post("/login", async (req: express.Request, res: express.Response) => {
	const result = await LoginValidation.safeParseAsync(req.body);
	if (!result.success) {
		return res.status(400).json({
			message: result.error.flatten().fieldErrors,
			notification: "Could not log in",
		});
	}

	const user: UserType = await User.findOne({
		username: result.data.username,
	}).lean();

	if (!user) {
		return res.status(400).json({ notification: "Something went wrong" });
	}

	delete user.password;

	const accessToken = await generateAccessToken(user);
	const refreshToken = await generateRefreshToken(user);
	await Token.create({ token: refreshToken });

	// set refresh token as a cookie
	res.cookie("authToken", refreshToken, {
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	return res.status(200).json({
		notification: "Logged in",
		accessToken,
	});
});

router.post(
	"/register",
	async (req: express.Request, res: express.Response) => {
		const result = await RegisterValidation.safeParseAsync(req.body);
		if (!result.success) {
			return res.status(400).json({
				message: result.error.flatten().fieldErrors,
				notification: "Could not register",
			});
		}

		const { username, email, password } = result.data;

		// hash password using argon2
		const hashedPassword = await hash(password);

		// create a new user
		const user = new User({
			username,
			email,
			password: hashedPassword,
		});
		try {
			await user.save();
			res.status(201).json({
				notification: "Successfully registered",
			});
		} catch (err) {
			res.status(400).json({ notification: "Something went wrong" });
		}
	}
);

router.post("/token", async (req: express.Request, res: express.Response) => {
	const refreshToken: string | null = req.cookies.authToken;
	if (!refreshToken) {
		return res.status(401).json({ message: "Missing token" });
	}
	const token = await Token.findOne({ token: refreshToken });
	if (!token) {
		return res.status(403).json({ message: "Invalid token" });
	}

	try {
		const data = verify(refreshToken, loadEnv().REFRESH_TOKEN_SECRET);
		if (typeof data === "string") {
			return res.status(403).json({ message: "Invalid token" });
		}
		delete data.iat;
		delete data.exp;
		const accessToken = await generateAccessToken(data as UserType);
		return res.status(200).json({ accessToken });
	} catch (err) {
		return res.status(403).json({ message: "Invalid token" });
	}
});

router.delete(
	"/logout",
	async (req: express.Request, res: express.Response) => {
		const refreshToken: string | null = req.cookies.authToken;
		if (!refreshToken) {
			return res.status(401).json({ message: "Missing token" });
		}
		try {
			await Token.deleteOne({ token: refreshToken });
			res.clearCookie("authToken");
			return res.status(200).json({ message: "Logged out" });
		} catch (err) {
			return res.status(400).json({ message: getErrorMessage(err) });
		}
	}
);

export default router;
