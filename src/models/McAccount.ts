import { Schema, model } from "mongoose";

const schema = new Schema({
	port: {
		type: Number,
		index: true,
	},
	usernameOrEmail: {
		type: String,
		required: true,
	},
	nickname: {
		type: String,
		required: true,
	},
});

export default model("McAccount", schema);
