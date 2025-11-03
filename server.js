const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded login
const USERNAME = "Pankle999";
const PASSWORD = "Pankle123";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: false
}));

// Login page
app.get("/", (req, res) => {
  if (req.session.loggedIn) return res.redirect("/dashboard");
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === USERNAME && password === PASSWORD) {
    req.session.loggedIn = true;
    res.redirect("/dashboard");
  } else {
    res.render("login", { error: "Invalid credentials" });
  }
});

// Dashboard page
app.get("/dashboard", async (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/");

  try {
    // Replace this URL with your Apps Script web app URL
    const response = await axios.get("YOUR_GAS_WEB_APP_URL");

    // Default to empty arrays if undefined
    const { updates = [], dashboard = [] } = response.data || {};

    res.render("dashboard", { updates, dashboard, error: null });
  } catch (err) {
    console.error("Failed to fetch data:", err.message);
    res.render("dashboard", { updates: [], dashboard: [], error: "Failed to fetch data" });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
