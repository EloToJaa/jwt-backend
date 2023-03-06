import { z } from "zod";
import User from "../models/User.js";

const validation = z
	.object({
		username: z
			.string({ required_error: "Username is required" })
			.min(3, { message: "Username must be at least 3 characters long" })
			.max(20, { message: "Username must be at most 20 characters long" })
			.trim(),
		password: z
			.string({ required_error: "Password is required" })
			.min(8, { message: "Password must be at least 8 characters long" })
			.max(64, "Password must be at most 64 characters long")
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).*$/, {
				message:
					"Password must contain at least one uppercase letter, one lowercase letter and one number and one special character",
			})
			.trim(),
		confirmPassword: z
			.string({ required_error: "Password is required" })
			.min(8, { message: "Password must be at least 8 characters long" })
			.max(64, "Password must be at most 64 characters long")
			.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).*$/, {
				message:
					"Password must contain at least one uppercase letter, one lowercase letter and one number and one special character",
			})
			.trim(),
		email: z
			.string({ required_error: "Email is required" })
			.email({ message: "Email must be a valid email address" }),
	})
	.superRefine(
		async ({ password, confirmPassword, username, email }, ctx) => {
			if (password !== confirmPassword) {
				ctx.addIssue({
					code: "custom",
					message: "Passwords do not match",
					path: ["confirmPassword"],
				});
				ctx.addIssue({
					code: "custom",
					message: "Passwords do not match",
					path: ["password"],
				});
			}

			if (await User.findOne({ username })) {
				ctx.addIssue({
					code: "custom",
					message: `Username ${username} is already taken`,
					path: ["username"],
				});
			}

			if (await User.findOne({ email })) {
				ctx.addIssue({
					code: "custom",
					message: `Email ${email} is already taken`,
					path: ["email"],
				});
			}
		}
	);

export default validation;
