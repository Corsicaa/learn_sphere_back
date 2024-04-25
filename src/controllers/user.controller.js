const pool = require('../db');
const jwt = require('jsonwebtoken');
const cryptPassword = require('../helpers/cryptPassword');
const generateToken = require('../helpers/generateToken');
const bcrypt = require('bcrypt');

const createUser = async (req, res) => {
    try {
        const { gender, lastname, firstname, email, password, confirmPassword, phone, country } = req.body;

        if (gender === '' || lastname === '' || firstname === '' || email === '' || password === '' || confirmPassword === '' || phone === '' || country === '') {
            return res.status(400).send({ message: "All fields are required." });
        }

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

        const hashedPassword = await cryptPassword(password);

        const result = await pool.execute(
            'INSERT INTO users (gender, lastname, firstname, mail, password, phone, basic, standard, isadmin, country) VALUES (?, ?, ?, ?, ?, ?, true, false, false, ?)',
            [gender, lastname, firstname, email, hashedPassword, phone, country]
        );

        const userId = result[0].insertId;
        const token = generateToken({userId: userId});


        res.status(201).send({ token, userId: result[0].insertId });

    } catch (error) {
        console.error('Error creating new user: ', error);
        res.status(500).send({ message: "Error creating new user." });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === '' || password === '') {
            return res.status(400).send({ message: "All fields are required." });
        }

        const [rows] = await pool.execute('SELECT * FROM users WHERE mail = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).send({ message: "Invalid email or password." });
        }

        const user = rows[0];

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send({ message: "Invalid email or password." });
        }

        const token = generateToken({userId: user.id});

        res.status(200).send({ token, userId: user.id });

    } catch (error) {
        console.error('Error logging in user: ', error);
        res.status(500).send({ message: "Error logging in user." });
    }
}

const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).send({ message: "Logout successful." });
    } catch (error) {
        console.error('Error logging out user: ', error);
        res.status(500).send({ message: "Error logging out user." });
    }
}

const userConnected = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
          return res.json({ isAuthenticated: false });
        }
        jwt.verify(token, process.env.SECRET_JWT, (err, decoded) => {
          if (err) {
            return res.json({ isAuthenticated: false });
          }
          if (decoded && decoded.userId) {
            return res.json({ isAuthenticated: true });
          }
          return res.json({ isAuthenticated: false });
        });
      } catch (error) {
        return res.json({ isAuthenticated: false });
      }
  }

const selectUser = async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).send({ message: "User not found." });
        }

        res.status(200).send(rows[0]);

    } catch (error) {
        console.error('Error selecting user: ', error);
        res.status(500).send({ message: "Error selecting user." });
    }
}




module.exports = {
    createUser,
    loginUser,
    logoutUser,
    selectUser,
    userConnected
}