import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import { matchesRouter } from "./matches";
import { teamsRouter } from "./teams";
import { standingsRouter } from "./standings";
import { highlightsRouter } from "./highlights";
import { predictionsRouter } from "./predictions";
import { dashboardRouter } from "./dashboard";
import { syncRouter } from "./sync";
import { sweepstakesRouter } from "./sweepstakes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use("/matches", matchesRouter);
router.use("/teams", teamsRouter);
router.use("/standings", standingsRouter);
router.use("/highlights", highlightsRouter);
router.use("/predictions", predictionsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/sweepstakes", sweepstakesRouter);
router.use("/", syncRouter);

export default router;
