const express = require("express");
const { connectDB } = require("./src/config/database");
const referralCodeRoutes = require("./src/routes/referral.routes");

const app = express();

app.use(express.json());

// Connect Database
connectDB();

// API Routes
app.use("/api", referralCodeRoutes);

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
