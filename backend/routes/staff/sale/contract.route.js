import express from "express";
import {
  getContracts,
  createContract,
  printContract
} from "../../../controllers/staff/sale/contract.controller.js";

const router = express.Router();

router.get("/", getContracts);

router.post("/orders/:orderId/contract", createContract);

router.get("/:id/print", printContract);

export default router;
