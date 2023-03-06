import dotenv from "dotenv";

export const loadEnv = () => {
	dotenv.config();
	return {
		PORT: process.env.PORT || "3000",
		MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017",
		DB_NAME: process.env.DB_NAME || "blog",
		ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "secret",
		REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "secret",
	};
};
