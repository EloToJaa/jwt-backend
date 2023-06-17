import express from "express";
import { expressjwt } from "express-jwt";
import { loadEnv } from "../env.js";
import McAccount from "../models/McAccount.js";
import CustomRequest from "../types/Request.js";
import McValidation from "../validation/mc.js";

const router = express.Router();

router.get(
	"/",
	expressjwt({
		secret: loadEnv().ACCESS_TOKEN_SECRET,
		algorithms: ["HS256"],
		credentialsRequired: true,
	}),
	async (req: express.Request, res: express.Response) => {
		try {
			const mcAccounts = await McAccount.find({});
			res.json(mcAccounts);
		} catch (err) {
			res.status(500).json({ message: "Could not get accounts" });
		}
	}
);

router.post(
	"/",
	expressjwt({
		secret: loadEnv().ACCESS_TOKEN_SECRET,
		algorithms: ["HS256"],
		credentialsRequired: true,
	}),
	async (req: CustomRequest, res: express.Response) => {
		const result = await McValidation.safeParseAsync(req.body);
		if (!result.success) {
			return res.status(400).json({
				message: result.error.flatten().fieldErrors,
				notification: "Could not add the Microsoft account",
			});
		}

		const { usernameOrEmail, nickname } = result.data;
		const owner = req.auth?.username;

		const mcAccount = new McAccount({
			usernameOrEmail,
			nickname,
			owner,
		});

		try {
			const newMcAccount = await mcAccount.save();
			res.status(201).json(newMcAccount);
		} catch (err) {
			res.status(400).json({ notification: "Something went wrong" });
		}
	}
);

router.delete(
	"/:usernameOrEmail",
	expressjwt({
		secret: loadEnv().ACCESS_TOKEN_SECRET,
		algorithms: ["HS256"],
		credentialsRequired: true,
	}),
	async (req: CustomRequest, res: express.Response) => {
		try {
			const mcAccount = await McAccount.findOne({
				usernameOrEmail: req.params.usernameOrEmail,
			});
			if (!mcAccount) {
				res.status(404).json({ message: "Cannot find this account" });
			}
			res.json({ message: "Post deleted" });
		} catch (err) {
			return res
				.status(404)
				.json({ message: "Cannot find this account" });
		}
	}
);

export default router;
