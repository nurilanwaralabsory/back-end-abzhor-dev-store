import express from "express";
import router from "./routes/api";

const app = express();

app.use(express.json());

const PORT = 3000;

app.use("/api", router);

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:3000");
});
