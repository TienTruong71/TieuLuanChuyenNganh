import express from "express";
import {
  getContracts,
  createContract,
  printContract,
  getOrdersNoContract
} from "../../../controllers/staff/sale/contract.controller.js";

const router = express.Router();

router.get("/pending-orders", getOrdersNoContract);
router.get("/", getContracts);

router.post("/orders/:orderId/contract", createContract);

router.get("/:id/print", printContract);

export default router;
