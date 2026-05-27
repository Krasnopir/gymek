import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { ZodError } from "zod";
import { corsOrigins, env, listenPort } from "./env.js";
import { healthRouter } from "./routes/health.js";
import { profileRouter } from "./routes/profile.js";
import { workoutsRouter } from "./routes/workouts.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || corsOrigins.includes(origin)) {
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

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      details: error.flatten(),
    });
  }

  console.error(error);
  return res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "Something went wrong",
  });
});

app.listen(listenPort, "0.0.0.0", () => {
  console.log(`Gymek API running on port ${listenPort}`);
});
