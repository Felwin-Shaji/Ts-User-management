"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const express_session_1 = __importDefault(require("express-session"));
const nocache_1 = __importDefault(require("nocache"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
mongoose_1.default.connect("mongodb://127.0.0.1:27017/usertypescript");
const app = (0, express_1.default)();
app.use((0, express_session_1.default)({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", [
    path_1.default.join(__dirname, "../views/user"),
    path_1.default.join(__dirname, "../views/admin"),
    path_1.default.join(__dirname, "../views/layouts"),
]);
app.use((0, nocache_1.default)());
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");
    next();
});
// app.use('/public', express.static(path.join(__dirname, '../public'), {
//   setHeaders: (res, path) => {
//     res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
//     res.set("Pragma", "no-cache");
//     res.set("Expires", "0");
//     res.set("Surrogate-Control", "no-store");
//   },
// }));
app.use("/", userRoutes_1.default);
app.use("/admin", adminRoutes_1.default);
//app.use("/admin", admin);
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
