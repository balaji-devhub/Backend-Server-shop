import express from "express";
import db from "../../db/database.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const router = express.Router();

router.post('/register', async (request, response) => {
    const { name, email, password, role } = request.body;

    if (!name || !email || !password) {
        return response.status(400).json({
            message: 'All fields are required'
        });
    }

    const [existing_user] = await db.query(
        "SELECT email FROM users WHERE email = ?",
        [email]
    );

    if (existing_user.length > 0) {
        return response.status(400).json({
            message: 'User already exists'
        });
    }

    const hased_pass = await bcrypt.hash(password, 10)

    await db.query(
        `INSERT INTO users (name, email, password, role)
     VALUES (?, ?, ?, ?)`,
        [name, email, hased_pass, role || 'user']
    );

    response.status(201).json({
        msg: "User registered successfully"
    });
});


router.post('/login', async (request, response) => {
    const { email, password } = request.body

    if (!email || !password) {
        return response.status(400).json({
            message: 'All fields are required'
        });
    }

    const [exisiting_user] = await db.query(`
        SELECT id, email, role, password FROM users WHERE email = ? `, [email])

    if (exisiting_user.length === 0) {
        return response.status(400).json({
            message: 'User not found'
        });
    }

    const user = exisiting_user[0]

    const password_checking = await bcrypt.compare(password, user.password)

    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    }

    if (!password_checking) {
        return response.status(400).json({
            message: 'Unauthorized access'
        });
    }

    const token = jwt.sign(payload, process.env.JWT_SCECRET_KEY, {
        expiresIn: "1d"
    })

    return response.status(200).json({
        message: 'Welcome back !',
        jwt_token: token
    });

})

export default router;