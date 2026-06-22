// Import global routes
import { Router } from "express";
import routes from "./routes";
import { initializeModels } from "./models";

// Domain models / routes that live under app/api (not in app/modules)
import "./queue/queue-entry.model";
import queueRoutes from "./queue/queue.routes";

// Initialize module-discovered models
await initializeModels();

// Compose the module-discovered routes with the domain routes.
const router = Router();
router.use(routes);
router.use(queueRoutes);

export default router;
