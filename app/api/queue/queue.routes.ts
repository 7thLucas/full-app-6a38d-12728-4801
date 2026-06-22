import { Router } from "express";
import {
  createIntake,
  listQueue,
  advanceEntry,
  setEntryStatus,
  clearEntry,
} from "./queue.controller";

const router = Router();

// Public intake (no auth) — patient self check-in
router.post("/queue/intake", createIntake);

// Staff live queue
router.get("/queue", listQueue);
router.post("/queue/:id/advance", advanceEntry);
router.post("/queue/:id/status", setEntryStatus);
router.post("/queue/:id/clear", clearEntry);

export default router;
