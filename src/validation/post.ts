import { z } from "zod";
import Post from "../models/Post.js";

const validation = z
	.object({
		title: z
			.string({ required_error: "Title is required" })
			.min(3, {
				message: "Title must be at least 3 characters long",
			})
			.max(50, {
				message: "Title must be at most 50 characters long",
			})
			.trim(),
		description: z
			.string({ required_error: "Description is required" })
			.min(3, {
				message: "Description must be at least 3 characters long",
			})
			.max(200, {
				message: "Description must be at most 200 characters long",
			})
			.trim(),
		content: z
			.string({ required_error: "Content is required" })
			.min(3, {
				message: "Content must be at least 3 characters long",
			})
			.max(10000, {
				message: "Content must be at most 10000 characters long",
			})
			.trim(),
		date: z
			.string()
			.datetime({ message: "Date must be a valid date" })
			.default(new Date().toDateString()),
	})
	.superRefine(async ({ title, date }, ctx) => {
		if (await Post.findOne({ title })) {
			ctx.addIssue({
				code: "custom",
				message: "Post with the same title already exists",
				path: ["title"],
			});
		}

		if (new Date(date) < new Date()) {
			ctx.addIssue({
				code: "custom",
				message: "Post cannot be created in the past",
				path: ["date"],
			});
		}
	});

export default validation;
