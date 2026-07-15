import router from "./api/v1.js";
import * as cheerio from "cheerio";
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 6767;

app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.json({
    status: 200,
    body: "BUNNUCRHOLL MANGA API (18+)",
    author: "AHANAF AHAMAD",
  });
});

// v1 api
app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log(`BUNNYCRHOLL MANGA API IS RUNNING ON ${PORT}`);
  console.log(`LINK -- http://localhost:${PORT}`);
});

export default app;
