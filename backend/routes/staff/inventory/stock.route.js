import express from "express";
import { getStockTransactions, createStockTransaction } 
from "../../../controllers//staff/inventory/stock.controller.js";

const router = express.Router();

router.get("/", getStockTransactions);       
router.post("/", createStockTransaction);   

export default router;
