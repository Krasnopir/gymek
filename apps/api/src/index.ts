import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env, isAllowedCorsOrigin, listenPort } from "./env.js";
import { errorHandler } from "./lib/error-handler.js";
import { healthRouter } from "./routes/health.js";
import { aiRouter } from "./routes/ai.js";
import { checkinsRouter } from "./routes/checkins.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { nutritionRouter } from "./routes/nutrition.js";
import { profileRouter } from "./routes/profile.js";
import { progressRouter } from "./routes/progress.js";
import { workoutsRouter } from "./routes/workouts.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (isAllowedCorsOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({
    message: "Gymek API is alive",
  });
});

app.use("/health", healthRouter);
app.use("/profile", profileRouter);
app.use("/workouts", workoutsRouter);
app.use("/nutrition", nutritionRouter);
app.use("/progress", progressRouter);
app.use("/checkins", checkinsRouter);
app.use("/ai", aiRouter);
app.use("/dashboard", dashboardRouter);

app.use(errorHandler);

app.listen(listenPort, "0.0.0.0", () => {
  console.log(`Gymek API running on port ${listenPort}`);
});
