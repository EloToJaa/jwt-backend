import { z } from "zod";
import McAccount from "../models/McAccount.js";

const validation = z
	.object({
		usernameOrEmail: z
			.string({ required_error: "Username or email is required" })
			.min(3, {
				message: "Username or email must be at least 3 characters long",
			})
			.max(50, {
				message: "Username or email must be at most 50 characters long",
			})
			.trim(),
		nickname: z
			.string({ required_error: "Nickname is required" })
			.min(3, {
				message: "Nickname must be at least 3 characters long",
			})
			.max(30, {
				message: "Nickname must be at most 30 characters long",
			})
			.trim(),
	})
	.superRefine(async ({ usernameOrEmail, nickname }, ctx) => {
		if (await McAccount.findOne({ usernameOrEmail })) {
			ctx.addIssue({
				code: "custom",
				message: `Account named ${usernameOrEmail} is already registered`,
				path: ["usernameOrEmail"],
			});
		}

		if (await McAccount.findOne({ nickname })) {
			ctx.addIssue({
				code: "custom",
				message: `Player named ${nickname} already exists`,
				path: ["nickname"],
			});
		}
	});

export default validation;
