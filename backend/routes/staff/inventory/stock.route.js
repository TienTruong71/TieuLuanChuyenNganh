import express from "express";
import { getStockTransactions, createStockTransaction } 
from "../../../controllers//staff/inventory/stock.controller.js";
import { protect, inventoryStaff } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(inventoryStaff);


router.get("/", getStockTransactions);       
router.post("/", createStockTransaction);   

export default router;
