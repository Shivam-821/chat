import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Chat Server is running...");
});

export { app };
