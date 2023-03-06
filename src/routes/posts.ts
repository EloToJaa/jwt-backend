import express from "express";
import { expressjwt } from "express-jwt";
import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { loadEnv } from "../env.js";
import { getErrorMessage } from "../lib/utils.js";
import getPost from "../middleware/getPost.js";
import Post from "../models/Post.js";
import CustomRequest from "../types/Request.js";
import PostValidation from "../validation/post.js";
const router = express.Router();

router.get("/", async (req: express.Request, res: express.Response) => {
	// get all posts
	try {
		const posts = await Post.find();
		res.json(posts);
	} catch (err) {
		res.status(500).json({ message: getErrorMessage(err) });
	}
});

router.get("/:slug", getPost, async (_, res: express.Response) => {
	// get a single post
	res.json(res.locals.post);
});

router.post(
	"/",
	expressjwt({
		secret: loadEnv().ACCESS_TOKEN_SECRET,
		algorithms: ["HS256"],
		credentialsRequired: true,
	}),
	async (req: CustomRequest, res: express.Response) => {
		const result = await PostValidation.safeParseAsync(req.body);
		if (!result.success) {
			return res.status(400).json({
				message: result.error.flatten().fieldErrors,
				notification: "Could not create a post",
			});
		}

		const { title, content, date, description } = result.data;
		const slug = title.toLowerCase().replace(/ /g, "-");

		const parsedContent = marked.parse(content);
		const sanitizedContent = DOMPurify.sanitize(parsedContent);
		console.log(sanitizedContent);

		const author: string = req.auth?.username!;
		const post = new Post({
			title,
			content: sanitizedContent,
			description,
			author,
			slug,
			date,
		});
		try {
			const newPost = await post.save();
			res.status(201).json(newPost);
		} catch (err) {
			console.log(err);
			res.status(400).json({ notification: "Something went wrong" });
		}
	}
);

router.patch(
	"/:slug",
	expressjwt({
		secret: loadEnv().ACCESS_TOKEN_SECRET,
		algorithms: ["HS256"],
		credentialsRequired: true,
	}),
	getPost,
	async (req: express.Request, res: express.Response) => {
		// check which fields are present and update them
		if (req.body.title != null) {
			// check if slug needs to be updated
			const title: string = req.body.title;
			const newSlug = title.toLowerCase().replace(/ /g, "-");
			const previousSlug: string = res.locals.post.slug;

			if (newSlug !== previousSlug) {
				// check if post with same slug already exists
				const foundPost = await Post.findOne({ newSlug });
				if (foundPost != null) {
					return res.status(400).json({
						message: "Post with the same title already exists",
					});
				}
			}

			res.locals.post.title = title;
			res.locals.post.slug = newSlug;
		}
		if (req.body.content != null) {
			res.locals.post.content = req.body.content;
		}
		if (req.body.thumbnail != null) {
			res.locals.post.thumbnail = req.body.thumbnail;
		}

		try {
			const updatedPost = await res.locals.post.save();
			res.json(updatedPost);
		} catch (err) {
			res.status(400).json({ message: getErrorMessage(err) });
		}
	}
);

router.delete(
	"/:slug",
	expressjwt({
		secret: loadEnv().ACCESS_TOKEN_SECRET,
		algorithms: ["HS256"],
		credentialsRequired: true,
	}),
	getPost,
	async (_, res: express.Response) => {
		// delete a post
		try {
			await res.locals.post.remove();
			res.json({ message: "Post deleted" });
		} catch (err) {
			res.status(500).json({ message: getErrorMessage(err) });
		}
	}
);

export default router;
