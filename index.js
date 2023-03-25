const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const Company = require("./models/company");

dotenv.config();
mongoose.set("strictQuery", false);
const app = express();
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 3000;
const connection = process.env.CONNECTION;
app.get("/", (req, res) => {
  res.send({ msg: "Welcome" });
});

app.get("/api/companies", async (req, res) => {
  try {
    const restult = await Company.find();

    res.status(200).send({ data: restult });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/add-company", async (req, res) => {
  const company = new Company(req.body);
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


app.get("/api/company/:id", async (req, res) => {
  const {id} = req.params
  try {
    const company = await Company.findById(id)
    if(company){
      res.status(200).json({data: company})
    }else{
      res.status(404).json({data: "not found"})
    }
    
  }catch(e){
    res.status(404).json({data: e.message})
  }
})
const start = async () => {
  try {
    await mongoose.connect(connection);
    app.listen(PORT);
  } catch (e) {
    console.log(e);
  }
};

start();

export default app;
