import express from "express";
import { createContract, printContract, getAllContracts } from "../../../controllers/staff/sale/contract.controller.js";

const router = express.Router();

router.post("/", createContract);
router.get("/:id/print", printContract);
router.get("/", getAllContracts);

export default router;
