import { verify } from "argon2";
import { z } from "zod";
import User from "../models/User.js";

const validation = z
	.object({
		username: z
			.string({ required_error: "Username is required" })
			.min(3, {
				message: "Username must be at least 3 characters long",
			})
			.max(20, {
				message: "Username must be at most 20 characters long",
			})
			.trim(),
		password: z
			.string({ required_error: "Password is required" })
			.min(1, { message: "Password is required" })
			.max(64, { message: "Password is too long" })
			.trim(),
	})
	.superRefine(async ({ username, password }, ctx) => {
		const user = await User.findOne({ username }).lean();
		if (!user) {
			ctx.addIssue({
				code: "custom",
				message: "Incorrect username or password",
				path: ["password"],
			});
			ctx.addIssue({
				code: "custom",
				message: "Incorrect username or password",
				path: ["username"],
			});
			return;
		}
		if (!(await verify(user?.password!, password))) {
			ctx.addIssue({
				code: "custom",
				message: "Incorrect username or password",
				path: ["password"],
			});
		}
	});

export default validation;
