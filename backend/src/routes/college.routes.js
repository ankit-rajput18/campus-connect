import { Router } from "express";
import { getColleges, getCollegeById } from "../controllers/college.controller.js";

const router = Router();

router.get("/", getColleges);         // GET /api/colleges
router.get("/:id", getCollegeById);   // GET /api/colleges/:id

export default router;
