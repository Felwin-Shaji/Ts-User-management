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
const bcrypt_1 = __importDefault(require("bcrypt"));
//import { promises } from "dns";
// const securePassword = async (password:string) => {
//     try {
//         const passHash = await bcrypt.hash(password,10)
//         return passHash
//     } catch (error) {
//         console.log(error);
//     }
// }
const loadLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.render('adminLogin');
    }
    catch (error) {
        console.log(error);
    }
});
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const userData = yield userModel_1.default.findOne({ email: email });
        if (userData) {
            const passwordMatch = yield bcrypt_1.default.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.isAdmin === false) {
                    res.status(403).json({ success: false, message: "Access denied. Only admins can access this page." });
                }
                else {
                    req.session.user = userData._id;
                    res.status(200).json({ success: true });
                }
            }
            else {
                res.status(400).json({ success: false, message: "Credentials are incorrect." });
            }
        }
        else {
            res.status(400).json({ success: false, message: "Credentials are incorrect." });
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
const loadDashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = req.session.user;
        if (!admin) {
            res.redirect('/admin/login');
            return;
        }
        const adminData = yield userModel_1.default.find({ isAdmin: true });
        const users = yield userModel_1.default.find({ isAdmin: false });
        console.log(users);
        res.render('dashboard', { admin: adminData[0], users });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong while loading dashboard!");
    }
});
const blockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        console.log("User ID to block/unblock:", userId);
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            console.log('User not found');
            res.redirect('/admin');
            return;
        }
        user.isBlocked = !user.isBlocked;
        yield user.save();
        console.log(`User ${userId} is now ${user.isBlocked ? 'Blocked' : 'Unblocked'}`);
        res.redirect('/admin');
    }
    catch (error) {
        console.error(error);
        res.redirect('/admin');
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.redirect('/admin');
            }
            res.clearCookie('connect.sid');
            res.redirect('/admin/login');
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.redirect('/admin');
    }
});
const getEditUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            return res.redirect('/admin');
        }
        res.render('adminEdit', { user, successMessage: "" });
    }
    catch (error) {
        console.error(error);
        res.redirect('/admin');
    }
});
const postEditUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const { name, email, phone } = req.body;
        yield userModel_1.default.findByIdAndUpdate(userId, { name, email, phone });
        const updatedUser = yield userModel_1.default.findById(userId);
        res.render('adminEdit', {
            user: updatedUser,
            successMessage: "User updated successfully!"
        });
    }
    catch (error) {
        console.error(error);
        res.redirect('/admin');
    }
});
const getCreatUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.render("creatUser");
    }
    catch (error) {
    }
});
const creatUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            res.status(400).json({ message: "All fields are required." });
            return;
        }
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            res.status(409).json({ message: "User with this email already exists." });
            return;
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new userModel_1.default({
            name,
            email,
            phone,
            password: hashedPassword,
            isAdmin: false,
            isBlocked: false
        });
        yield newUser.save();
        res.status(201).json({ message: "User created successfully." });
    }
    catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});
exports.default = {
    loadLogin,
    loadDashboard,
    login,
    blockUser,
    logout,
    getEditUser,
    postEditUser,
    getCreatUser,
    creatUser
};
