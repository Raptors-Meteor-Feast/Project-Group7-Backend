import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    const {firstName, lastName, displayName, email, password} = req.body;
    try {
        //Check if arady has an email
        const existingUser = await userModel.findOne({email});
        if(existingUser) {
            return res.status(400).json({message: "User already exists"});
        }
        //Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //Create new user
        const newUser = await userModel.create({
            firstName,
            lastName,
            displayName,
            email,
            password: hashedPassword,
        });
        res.status(201).json({ message: "User registered successfully", userId: newUser._id });
    } catch (error) {
        res.status(500).json({ message: "Error registering user"});
    }
};


