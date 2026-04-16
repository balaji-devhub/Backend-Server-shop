import express from "express";
import db from '../../db/database.js'
import jwt from 'jsonwebtoken'


const router = express.Router()

import bcrypt from "bcrypt";

router.post('/register', async (request, response) => {
    try {
        const { name, email, role, password } = request.body;


        if (!name || !email || !password) {
            return response.status(400).json({
                message: "All fields are required"
            });
        }


        const [existingUser] = await db.query(
            `SELECT email FROM users WHERE email = ?`,
            [email]
        );

        if (existingUser.length > 0) {
            return response.status(400).json({
                message: "User already exists"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (!role) {
            await db.query(
                `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
                [name, email, hashedPassword]
            );
        } else {
            await db.query(
                `INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)`,
                [name, email, role, hashedPassword]
            );
        }

        const [user_datails] = await db.query(` 
            SELECT * FROM users WHERE email = ?
            `, [email])

        response.status(201).json({
            message: "User registered successfully",
            created_user_details: user_datails
        });

    } catch (error) {
        console.error(error);
        response.status(500).json({
            message: "Server error"

        });
    }
});



router.post('/login', async (request, response) => {
    try {
        const { email, password } = request.body;


        if (!email || !password) {
            return response.status(400).json({
                message: "Email and password are required"
            });
        }


        const [users] = await db.query(
            `SELECT id, email, password, role FROM users WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return response.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = users[0];


        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return response.status(401).json({
                message: "Invalid email or password"
            });
        }


        const payload = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
            expiresIn: "1d"
        });


        return response.status(200).json({
            message: "Login successful",
            jwt_token: token
        });

    } catch (error) {
        console.error(error);
        return response.status(500).json({
            message: "Server error"
        });
    }
});

export default router