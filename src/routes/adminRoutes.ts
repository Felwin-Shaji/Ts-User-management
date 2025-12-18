import { Router } from "express";
import adminController from "../controllers/adminController";
import auth from "../middlewares/auth"

let router = Router();
router.get("/login",adminController.loadLogin)
router.post("/login",adminController.login)
router.get("/",auth.adminAuth,adminController.loadDashboard);
router.post("/block-user/:id",auth.adminAuth,adminController.blockUser);
router.post("/logout",auth.adminAuth,adminController.logout);
router.get('/edit-user/:id',auth.adminAuth, adminController.getEditUser);
router.post('/edit-user/:id',auth.adminAuth, adminController.postEditUser);
router.get("/create-user",auth.adminAuth,adminController.getCreatUser)
router.post("/create-user",auth.adminAuth,adminController.creatUser)

export default router