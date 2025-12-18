import userModel from "../models/userModel";
import { Request,Response,NextFunction } from "express";

const userAuth = async (req:Request, res:Response, next:NextFunction): Promise<void>=> {
    try {
      if (req.session.user) {
        const user = await userModel.findOne({ _id: req.session.user, isAdmin: false });

        if (user) {
          return next();
        } else {
          return res.redirect("/login");
        }
      } else {
        return res.redirect("/login");
      }
    } catch (error) {
      console.error("Error in user authentication:", error);
      res.status(500).send("Internal server error");
    }
  };

  const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.session.user) {
            return res.redirect("/admin/login");
        }

        const user = await userModel.findById(req.session.user);
        
        if (user && user.isAdmin) {
            next();
        } else {
            return res.redirect("/admin/login");
        }
    } catch (error) {
        console.error("Error in adminAuth middleware:", error);
        res.status(500).send("Internal server error");
    }
};


  export default {userAuth,adminAuth}