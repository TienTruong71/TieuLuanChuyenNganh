import express from "express";
import {
  getInventoryList,
  addInventory,
  updateInventory,
  deleteInventory,
} from "../../../controllers/staff/inventory/inventory.controller.js";

const router = express.Router();

router.get("/", getInventoryList);         
router.post("/", addInventory);            
router.put("/:id", updateInventory);       
router.delete("/:id", deleteInventory);    

export default router;
