"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = __importDefault(require("../models/userModel"));
const userAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.session.user) {
            const user = yield userModel_1.default.findOne({ _id: req.session.user, isAdmin: false });
            if (user) {
                return next();
            }
            else {
                return res.redirect("/login");
            }
        }
        else {
            return res.redirect("/login");
        }
    }
    catch (error) {
        console.error("Error in user authentication:", error);
        res.status(500).send("Internal server error");
    }
});
const adminAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session.user) {
            return res.redirect("/admin/login");
        }
        const user = yield userModel_1.default.findById(req.session.user);
        if (user && user.isAdmin) {
            next();
        }
        else {
            return res.redirect("/admin/login");
        }
    }
    catch (error) {
        console.error("Error in adminAuth middleware:", error);
        res.status(500).send("Internal server error");
    }
});
exports.default = { userAuth, adminAuth };
