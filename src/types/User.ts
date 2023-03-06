import { Types } from "mongoose";

interface User {
	_id?: Types.ObjectId;
	username: string;
	password?: string;
	passwordConfirm?: string;
	email?: string;
	date?: Date;
}

export default User;
