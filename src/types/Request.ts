import express from "express";
import User from "./User.js";

interface CustomRequest extends express.Request {
	auth?: User;
}

export default CustomRequest;
