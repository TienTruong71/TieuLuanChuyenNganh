import express from "express";
import {
  getInventoryList,
  addInventory,
  updateInventory,
  deleteInventory,
} from "../../../controllers/staff/inventory/inventory.controller.js";
import { protect, inventoryStaff } from '../../../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(inventoryStaff);


router.get("/", getInventoryList);         
router.post("/", addInventory);            
router.put("/:id", updateInventory);       
router.delete("/:id", deleteInventory);    

export default router;
