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

// Server-side cache for dashboard data
let cachedDashboard = [];
let lastFetchError = null;

// Function to fetch dashboard data from Google Apps Script
async function fetchDashboardData() {
  try {
    const response = await axios.get("https://script.google.com/macros/s/AKfycbxeid4UHg5BRxH-uPYOb8kmcFdrKkTSTAFcmlsle50NKKXWPcddIjLW60lrh5wDGXk8/exec"); // replace with your URL
    const { dashboard = [] } = response.data || {};
    cachedDashboard = dashboard;
    lastFetchError = null;
    console.log("Dashboard updated. Rows:", dashboard.length);
  } catch (err) {
    console.error("Failed to fetch dashboard:", err.message);
    lastFetchError = err.message;
  }
}

// Initial fetch when server starts
fetchDashboardData();

// Schedule fetch every 5 minutes (300000 ms)
setInterval(fetchDashboardData, 300000);

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
app.get("/dashboard", (req, res) => {
  if (!req.session.loggedIn) return res.redirect("/");

  // Serve cached dashboard data
  res.render("dashboard", {
    dashboard: cachedDashboard || [],
    error: lastFetchError
  });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
