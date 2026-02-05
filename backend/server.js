import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import geocodeRoute from "./routes/geocode.js";
import placesRouter from "./routes/places.routes.js";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 5000;

app.use("/api/geocode", geocodeRoute);
app.use("/api/places", placesRouter);

app.listen(PORT, () => {
});
