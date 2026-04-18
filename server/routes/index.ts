import type { Express } from "express";
import authRouter from "./auth";
import onboardingRouter from "./onboarding";
import trainersRouter from "./trainers";
import conversationsRouter from "./conversations";
import stripeRouter from "./stripe";
import settingsRouter from "./settings";
import miscRouter from "./misc";
import adminRouter from "./admin";

export function registerRouteModules(app: Express) {
  app.use(authRouter);
  app.use(onboardingRouter);
  app.use(trainersRouter);
  app.use(conversationsRouter);
  app.use(stripeRouter);
  app.use(settingsRouter);
  app.use(miscRouter);
  app.use(adminRouter);
}
