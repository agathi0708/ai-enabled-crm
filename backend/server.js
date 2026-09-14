const express = require("express");
const cors = require("cors");
require("dotenv").config();

const contactsRoutes = require("./contacts/contacts.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (req, res) => {
  res.json({
    data: {
      status: "OK",
      message: "CRM API is running",
    },
    meta: {},
    error: null,
  });
});

app.use("/api/v1/contacts", contactsRoutes);

app.listen(PORT, () => {
  console.log(`CRM API running on http://localhost:${PORT}`);
});