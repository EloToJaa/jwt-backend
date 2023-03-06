import express from "express";
import Post from "../models/Post.js";

export default async (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
) => {
	try {
		const post = await Post.findOne({ slug: req.params.slug });
		if (post === null) {
			return res.status(404).json({ message: "Cannot find post" });
		}
		res.locals.post = post;
		next();
	} catch (err) {
		return res.status(404).json({ message: "Cannot find post" });
	}
};
