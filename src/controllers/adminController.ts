import { Request,Response,NextFunction } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";
import { promises } from "dns";

const loadLogin = async (req:Request,res:Response) => {
    try {
        return res.render('adminLogin')

    } catch (error) {
        console.log(error);
        
    }
}

const login = async (req: Request, res: Response):Promise<void> => {
    try {
        const { email, password } = req.body;
        
        const userData = await userModel.findOne({ email: email });
        
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.isAdmin === false) {
                     res.status(403).json({ success: false, message: "Access denied. Only admins can access this page." });
                } else {
                    req.session.user = userData._id;
                     res.status(200).json({ success: true });
                }
            } else {
                 res.status(400).json({ success: false, message: "Credentials are incorrect." });
            }
        } else {
             res.status(400).json({ success: false, message: "Credentials are incorrect." });
        }
    } catch (error) {
        console.log(error);
         res.status(500).json({ success: false, message: "Server error" });
    }
};


const loadDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const admin = req.session.user; 
  
      if (!admin) {
        res.redirect('/admin/login'); 
        return;
      }

      const adminData = await userModel.find({isAdmin:true}) 
       
      const users = await userModel.find({ isAdmin: false }); 
      console.log(users)
  
      res.render('dashboard', { admin:adminData[0] , users });
  
    } catch (error) {
      console.error(error);
      res.status(500).send("Something went wrong while loading dashboard!");
    }
  };

  const blockUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.id;  

      console.log("User ID to block/unblock:", userId);

      const user = await userModel.findById(userId);
  
      if (!user) {
        console.log('User not found');
        res.redirect('/admin');
        return;
      }
  
      
      user.isBlocked = !user.isBlocked;
      await user.save();
  
      console.log(`User ${userId} is now ${user.isBlocked ? 'Blocked' : 'Unblocked'}`);
      res.redirect('/admin');
    } catch (error) {
      console.error(error);
      res.redirect('/admin');
    }
  };

  const logout = async (req: Request, res: Response): Promise<void> => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          return res.redirect('/admin'); 
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/admin/login'); 
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.redirect('/admin');
    }
  };

  const getEditUser = async (req:Request,res:Response) => {
    try {
        const userId = req.params.id;
        const user = await userModel.findById(userId);
    
        if (!user) {
          return res.redirect('/admin');
        }
    
        res.render('adminEdit', { user,successMessage: ""  });
      } catch (error) {
        console.error(error);
        res.redirect('/admin');
      }
  }
  
  const postEditUser = async (req:Request,res:Response) => {
    try {
        const userId = req.params.id;
        const { name, email, phone } = req.body;
    
        await userModel.findByIdAndUpdate(userId, { name, email, phone });
    
        const updatedUser = await userModel.findById(userId);
    
        res.render('adminEdit', { 
          user: updatedUser, 
          successMessage: "User updated successfully!" 
        });
    
      } catch (error) {
        console.error(error);
        res.redirect('/admin');
      }
  }

  const getCreatUser = async(req:Request,res:Response):Promise<void> =>{
    try {
      res.render("creatUser")
    } catch (error) {
      
    }
  }

  const creatUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, phone, password } = req.body;
  
      if (!name || !email || !phone || !password) {
        res.status(400).json({ message: "All fields are required." });
        return;
      }
  
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        res.status(409).json({ message: "User with this email already exists." });
        return;
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new userModel({
        name,
        email,
        phone,
        password: hashedPassword,
        isAdmin: false,
        isBlocked: false
      });
  
      await newUser.save();
  
      res.status(201).json({ message: "User created successfully." });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  
  

export default {
    loadLogin,
    loadDashboard,
    login,
    blockUser,
    logout,
    getEditUser,
    postEditUser,
    getCreatUser,
    creatUser
}