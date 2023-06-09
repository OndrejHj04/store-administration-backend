const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const Company = require("./models/company");
const moment = require("moment-timezone");

dotenv.config();
mongoose.set("strictQuery", false);
const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;
const connection = process.env.CONNECTION;
console.log("xddd");
app.get("/", (req, res) => {
  res.send({
    msg: "Welcome",
    date: moment().tz("Europe/Prague").format("MM DD YYYY HH mm ss"),
  });
});

app.get("/api/companies", async (req, res) => {
  const { state } = req.query;

  try {
    if (state) {
      const restult = await Company.find({ state });
      res.status(200).send({ data: restult });
    } else {
      const restult = await Company.find({});
      res.status(200).send({ data: restult });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/add-company", async (req, res) => {
  const company = new Company({
    ...req.body,
    state: "created",
    date: moment().tz("Europe/Prague"),
    lastChange: "",
  });

  try {
    await company.save();
    res.status(201).json({ data: company });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/delete-company/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const company = await Company.findById(id);
    const request = await Company.deleteOne({ _id: id });
    if (request.deletedCount) {
      res.status(200).json({ data: company });
    } else {
      res.status(404).json({ data: "not found" });
    }
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

app.delete("/api/delete-multiple", async (req, res) => {
  const { ids } = req.body;
  try {
    const companies = await Company.find({ _id: ids });

    if (ids.length === companies.length) {
      const { deletedCount } = await Company.deleteMany({ _id: ids });
      res.status(200).json({ data: companies });
    } else {
      res.status(404).json({ data: "not found" });
    }
  } catch (e) {
    res.status(404).json({ data: e.message });
  }
});

app.delete("/api/delete-all", async (req, res) => {
  const data = await Company.deleteMany({});
  res.status(200);
});

app.get("/api/company/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const company = await Company.findById(id);
    if (company) {
      res.status(200).json({ data: company });
    } else {
      res.status(404).json({ data: "not found" });
    }
  } catch (e) {
    res.status(404).json({ data: e.message });
  }
});

app.post("/api/company-state/:id", async (req, res) => {
  const { body } = req;
  const { id } = req.params;
  console.log(body.state);
  try {
    const company = await Company.findOneAndUpdate(
      { _id: id },
      { state: body.state === 0 ? "history" : "created" },
      { returnOriginal: false }
    ); //zanechat časouvou stopu + vyřesit time zone
    res.status(200).json({ data: company });
  } catch (e) {
    res.status(400).json({ data: e.message });
  }
});

app.put("/api/change-company/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const company = await Company.findOneAndUpdate(
      { _id: id },
      { ...req.body, lastChange: moment().tz("Europe/Prague") },
      { returnOriginal: false }
    );
    res.status(200).json({ data: company });
  } catch (e) {
    res.status(400).json({ data: e.message });
  }
});

const start = async () => {
  try {
    await mongoose.connect(connection);
    app.listen(PORT, () => {
      console.log("pripojeno", PORT);
    });
  } catch (e) {
    console.log(e);
  }
};

app.get("/posts", (req, res) => {
  res.json({ data: "data" });
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };
  const acessToken = jwt.sign(user, process.env.ACESS_TOKEN_SECRET);

  res.json({ acessToken: acessToken });
});

app.post("/register", (req, res) => {
  res.status(200).json({ data: req.body });
});

function authenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token === null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

start();
