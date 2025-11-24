import express from "express";
import { createContract, printContract } from "../../../controllers/staff/sale/contract.controller.js";

const router = express.Router();

router.post("/", createContract);
router.get("/:id/print", printContract);

export default router;
