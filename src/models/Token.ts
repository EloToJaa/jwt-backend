import { Schema, model } from "mongoose";

const schema = new Schema({
	token: {
		type: String,
		required: true,
	},
});

export default model("Token", schema);
