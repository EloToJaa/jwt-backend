import { Schema, model } from "mongoose";

const PostSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	author: {
		type: String,
		required: true,
	},
	slug: {
		type: String,
		required: true,
	},
	date: { type: Date, default: Date.now },
});

export default model("Post", PostSchema);
