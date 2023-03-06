import { Schema, model } from "mongoose";

const TokenSchema = new Schema({
	token: {
		type: String,
		required: true,
	},
});

export default model("Token", TokenSchema);
