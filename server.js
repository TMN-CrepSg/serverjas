const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files (HTML, CSS, JS)

// File paths for users and banned list
const usersFile = "users.json";
const bannedFile = "banned.json";

// Load user and banned data from files (if they exist)
let users = JSON.parse(fs.readFileSync(usersFile, "utf-8") || "[]");
let bannedUsers = JSON.parse(fs.readFileSync(bannedFile, "utf-8") || "[]");

// Serve the login/signup page
app.get("/", (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login & Sign Up</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: Arial, sans-serif;
                background-color: #222;
                color: #fff;
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
            }

            .container {
                width: 100%;
                max-width: 400px;
                text-align: center;
            }

            h2 {
                margin-bottom: 20px;
            }

            input {
                width: 100%;
                padding: 12px;
                margin: 10px 0;
                border: 1px solid #444;
                background-color: #333;
                color: #fff;
                border-radius: 5px;
                font-size: 16px;
            }

            button {
                width: 100%;
                padding: 12px;
                background-color: #5cdb5c;
                border: none;
                color: #fff;
                font-size: 16px;
                cursor: pointer;
                border-radius: 5px;
            }

            button:hover {
                background-color: #4caf50;
            }

            .login-container, .signup-container {
                display: none;
            }

            .login-container.active, .signup-container.active {
                display: block;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="login-container" id="loginContainer">
                <h2>Login</h2>
                <form id="loginForm">
                    <input type="email" id="loginEmail" placeholder="Enter your email" required />
                    <input type="password" id="loginPassword" placeholder="Enter your password" required />
                    <button type="submit" class="btn">Login</button>
                </form>
                <button class="btn" onclick="showSignup()">Sign Up</button>
            </div>

            <div class="signup-container" id="signupContainer">
                <h2>Sign Up</h2>
                <form id="signupForm">
                    <input type="email" id="signupEmail" placeholder="Enter your email" required />
                    <input type="password" id="signupPassword" placeholder="Enter your password" required />
                    <button type="submit" class="btn">Sign Up</button>
                </form>
                <button class="btn" onclick="showLogin()">Back to Login</button>
            </div>
        </div>

        <script>
            const loginContainer = document.getElementById("loginContainer");
            const signupContainer = document.getElementById("signupContainer");

            function showLogin() {
                loginContainer.classList.add("active");
                signupContainer.classList.remove("active");
            }

            function showSignup() {
                signupContainer.classList.add("active");
                loginContainer.classList.remove("active");
            }

            // Handle login form submission
            document.getElementById("loginForm").addEventListener("submit", function(e) {
                e.preventDefault();
                const email = document.getElementById("loginEmail").value;
                const password = document.getElementById("loginPassword").value;

                fetch("/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Login successful!");
                        // Redirect to the main chat or dashboard page
                    } else {
                        alert(data.message);
                    }
                });
            });

            // Handle signup form submission
            document.getElementById("signupForm").addEventListener("submit", function(e) {
                e.preventDefault();
                const email = document.getElementById("signupEmail").value;
                const password = document.getElementById("signupPassword").value;

                fetch("/signup", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email, password })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert("Sign up successful! Please login.");
                        showLogin();
                    } else {
                        alert(data.message);
                    }
                });
            });

            // Initially show the login page
            showLogin();
        </script>
    </body>
    </html>
    `);
});

// Sign up handler
app.post("/signup", (req, res) => {
    const { email, password } = req.body;

    // Check if email already exists
    if (users.find(user => user.email === email)) {
        return res.json({ success: false, message: "Email already exists" });
    }

    // Add the new user
    users.push({ email, password });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    res.json({ success: true });
});

// Login handler
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // Check if user is banned
    if (bannedUsers.includes(email)) {
        return res.json({ success: false, message: "You are banned from logging in." });
    }

    // Check if user exists and password matches
    const user = users.find(user => user.email === email);
    if (!user || user.password !== password) {
        return res.json({ success: false, message: "Invalid email or password" });
    }

    res.json({ success: true });
});

// Add a user to the banned list
app.post("/ban", (req, res) => {
    const { email } = req.body;

    if (!users.find(user => user.email === email)) {
        return res.json({ success: false, message: "User does not exist" });
    }

    bannedUsers.push(email);
    fs.writeFileSync(bannedFile, JSON.stringify(bannedUsers, null, 2));
    res.json({ success: true });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
