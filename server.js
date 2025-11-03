const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

// Hardcoded login credentials
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

// Login handler
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
    // Replace this URL with your Google Apps Script web app URL
    const response = await axios.get("https://script.google.com/macros/s/AKfycby4iPMRqXPM2gjbfTCjCs59FjZZNlGRemi61_-1HcO1X-x05qIaeU4PS0urERjQRNDv/exec"); 
    const updates = response.data.updates || [];

    res.render("dashboard", { updates });
  } catch (err) {
    console.error(err);
    res.render("dashboard", { updates: [], error: "Failed to fetch data" });
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
