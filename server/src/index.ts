import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/db.js";

dotenv.config();

const PORT = process.env.PORT || 3002;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Server failed to start: ${error}`);
  });
