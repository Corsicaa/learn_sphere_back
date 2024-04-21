const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const pool = require('../db');

const createUser = async (req, res) => {
    try {
        const { gender, lastname, firstname, email, password, confirmPassword, phone, country } = req.body;

        const [rows] = await pool.execute('SELECT * FROM users WHERE mail = ?', [email]);

        if (rows.length > 0) {
            return res.status(409).send({ message: "A user already exists with this email, please login " });
        }

        const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(req.body.password)) {
            return res.status(400).send({ message: "Password must be at least 8 characters long and include at least one special character." });
        }

        if (password !== confirmPassword) {
            return res.status(400).send({ message: "Passwords do not match." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.execute(
            'INSERT INTO users (gender, lastname, firstname, mail, password, phone, basic, standard, isadmin, country) VALUES (?, ?, ?, ?, ?, ?, true, false, false, ?)',
            [gender, lastname, firstname, email, hashedPassword, phone, country]
        );

        res.status(201).send({ message: "User created successfully.", userId: result[0].insertId });

    } catch (error) {
        console.error('Error creating new user: ', error);
        res.status(500).send({ message: "Error creating new user." });
    }
};




module.exports = {
    createUser,
}