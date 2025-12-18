"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = __importDefault(require("../controllers/adminController"));
const auth_1 = __importDefault(require("../middlewares/auth"));
let router = (0, express_1.Router)();
router.get("/login", adminController_1.default.loadLogin);
router.post("/login", adminController_1.default.login);
router.get("/", auth_1.default.adminAuth, adminController_1.default.loadDashboard);
router.post("/block-user/:id", auth_1.default.adminAuth, adminController_1.default.blockUser);
router.post("/logout", auth_1.default.adminAuth, adminController_1.default.logout);
router.get('/edit-user/:id', auth_1.default.adminAuth, adminController_1.default.getEditUser);
router.post('/edit-user/:id', auth_1.default.adminAuth, adminController_1.default.postEditUser);
router.get("/create-user", auth_1.default.adminAuth, adminController_1.default.getCreatUser);
router.post("/create-user", auth_1.default.adminAuth, adminController_1.default.creatUser);
exports.default = router;
