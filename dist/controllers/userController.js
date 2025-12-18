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
const securePassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const passHash = yield bcrypt_1.default.hash(password, 10);
        return passHash;
    }
    catch (error) {
        console.log(error);
    }
});
const getSignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session.user) {
            return res.render('signUp');
        }
        else {
            return res.redirect("/");
        }
    }
    catch (error) {
        console.log(error);
    }
});
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            res.status(400).json({ success: false, message: "All fields are required" });
            return;
        }
        const existingUser = yield userModel_1.default.findOne({ email });
        if (existingUser) {
            res.status(409).json({ success: false, message: "Email already registered" });
            return;
        }
        const securePass = yield securePassword(password);
        const user = new userModel_1.default({
            name,
            email,
            phone,
            password: securePass,
            isAdmin: false,
            isBlocked: false
        });
        const userData = yield user.save();
        if (userData) {
            req.session.user = userData.id;
            res.status(200).json({ success: true, message: "Successfully registered" });
        }
        else {
            res.status(500).json({ success: false, message: "Registration failed" });
        }
    }
    catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});
const getLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.session.user) {
            return res.render("login");
        }
        else {
            return res.redirect('/home');
        }
    }
    catch (error) {
        console.log(error);
    }
});
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield userModel_1.default.findOne({ email });
        console.log(user);
        if (!user) {
            res.json({ success: false, message: 'Email not found!' });
            return;
        }
        if (user.isBlocked == true) {
            res.json({ success: false, message: "This user is blocked" });
            return;
        }
        const isPasswordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordMatch) {
            res.json({ success: false, message: 'Incorrect password!' });
            return;
        }
        req.session.user = user._id;
        res.json({ success: true, message: 'Login successful' });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
});
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error("Failed to destroy session:", err);
                res.status(500).send("An error occurred while logging out.");
                return;
            }
            res.clearCookie('connect.sid');
            res.redirect("/login");
        });
    }
    catch (error) {
        console.error("Error during logout:", error);
        res.status(500).send("An unexpected error occurred.");
    }
});
const home = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.session.user) {
            const userData = yield userModel_1.default.findById(req.session.user);
            console.log("userData:", userData);
            if (userData) {
                res.render('home', { user: userData });
            }
            else {
                res.redirect('/login');
            }
        }
        else {
            res.redirect('/login');
        }
    }
    catch (error) {
        console.log(error);
        res.redirect('/login');
    }
});
const getEdit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            res.status(404).send("User not found");
            return;
        }
        res.render("userEdit", { user, message: "" });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong");
    }
});
const edit = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const { name, email, phone } = req.body;
        const user = yield userModel_1.default.findById(userId);
        if (!user) {
            res.status(404).send("User not found");
            ;
            return;
        }
        // Update the fields
        user.name = name;
        user.email = email;
        user.phone = phone;
        yield user.save();
        res.render('userEdit', { user, message: 'Profile updated successfully!' });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Something went wrong while updating");
    }
});
exports.default = {
    getLogin,
    getSignUp,
    signup,
    home,
    logout,
    login,
    getEdit,
    edit
};
