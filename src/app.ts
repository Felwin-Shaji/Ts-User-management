import mongoose  from "mongoose";
import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import session from "express-session";
import nocache from "nocache"
import user from "./routes/userRoutes";
import admin from "./routes/adminRoutes";

mongoose.connect("mongodb://127.0.0.1:27017/usertypescript");

const app:Application = express();

app.use(
    session({
      secret: "your-secret-key", 
      resave: false,
      saveUninitialized: false,
    })
  );

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", [
    path.join(__dirname, "../views/user"),
    path.join(__dirname, "../views/admin"),
    path.join(__dirname, "../views/layouts"),
  ]);
  


app.use(nocache());

app.use((req: Request, res: Response, next: NextFunction) => {
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

  app.use("/",user);
  app.use("/admin",admin)
//app.use("/admin", admin);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });