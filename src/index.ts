import cookieParser from "cookie-parser";
import cors from "cors";

import express from "express";
import mongoose from "mongoose";
import { loadEnv } from "./env.js";
import authRouter from "./routes/auth.js";
import mcRouter from "./routes/mc.js";

const { MONGO_URI, DB_NAME, PORT } = loadEnv();
const app: express.Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

mongoose.set("strictQuery", false);
mongoose.connect(MONGO_URI, {
	dbName: DB_NAME,
});

const db = mongoose.connection;
db.on("error", (err) => {
	console.log(err);
});
db.once("open", () => {
	console.log("Connected to MongoDB");
});

app.use("/auth", authRouter);
app.use("/mc", mcRouter);

app.use(
	(
		err: express.Errback,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		if (err.name === "UnauthorizedError") {
			return res.status(401).json({ message: "Unauthorized" });
		} else {
			next(err);
		}
	}
);

app.listen(PORT, () => {
	console.log(`Server is listening on port ${PORT}`);
});
