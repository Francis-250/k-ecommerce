import { Router } from "express";
import {
  searchByImage,
  triggerBackfillEmbeddings,
} from "../controllers/visual-search.controller";

const router = Router();

router.post("/search-by-image", searchByImage);
router.post("/backfill-embeddings", triggerBackfillEmbeddings);

export default router;
