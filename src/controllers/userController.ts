
import { Request,Response,NextFunction } from "express";
import userModel from "../models/userModel";
import bcrypt from "bcrypt";

const securePassword = async (password:string)=>{
    try {
        const passHash = await bcrypt.hash(password,10)
        return passHash
    } catch (error) {
        console.log(error);
    }
}

const getSignUp=async (req:Request,res:Response) => {
    try {
        if(!req.session.user){
            return res.render('signUp')
        }else{
            return res.redirect("/")
        }
    } catch (error) {
        console.log(error);
        
    }
}

const signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, phone, password } = req.body;
  
      if (!name || !email || !phone || !password) {
        res.status(400).json({ success: false, message: "All fields are required" });
        return;
      }

      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        res.status(409).json({ success: false, message: "Email already registered" });
        return;
      }
  
      const securePass = await securePassword(password);
      const user = new userModel({
        name,
        email,
        phone,
        password: securePass,
        isAdmin: false,
        isBlocked:false
      });
  
      const userData = await user.save();
  
      if (userData) {
        req.session.user = userData.id;
        res.status(200).json({ success: true, message: "Successfully registered" });
      } else {
        res.status(500).json({ success: false, message: "Registration failed" });
      }
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };

  const getLogin = async (req:Request,res:Response) => {
    try {
        if(!req.session.user){
           return  res.render("login");
        }else{
            return res.redirect('/home')
        }
        
    } catch (error) {
        console.log(error);
    }
}

const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const user = await userModel.findOne({ email });
      console.log(user)
  
      if (!user) {
        res.json({ success: false, message: 'Email not found!' });
        return;
      }

      if(user.isBlocked==true){
        res.json({success:false, message:"This user is blocked"});
        return;
      }
  
      const isPasswordMatch = await bcrypt.compare(password, user.password);
  
      if (!isPasswordMatch) {
        res.json({ success: false, message: 'Incorrect password!' });
        return;
      }
  
      req.session.user = user._id;
      res.json({ success: true, message: 'Login successful' });
  
    } catch (error) {
      console.error(error);
      next(error); 
    }
  };
  

const logout = async (req: Request, res: Response): Promise<void> => {
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
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).send("An unexpected error occurred.");
    }
};

const home = async (req:Request,res:Response)=>{
    try {
        if (req.session.user) {
          const userData = await userModel.findById(req.session.user);
          console.log("userData:",userData)
          if (userData) {
            res.render('home', { user: userData });
          } else {
            res.redirect('/login');
          }
        } else {
          res.redirect('/login');
        }
      } catch (error) {
        console.log(error);
        res.redirect('/login');
      }
}

const getEdit = async (req: Request, res: Response):Promise<void> => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId);

    if (!user) {
      res.status(404).send("User not found");
      return 
    }

    res.render("userEdit", { user,message:"" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
};

const edit = async (req: Request, res: Response):Promise<void> => {
  try {
    const userId = req.params.id;
    const { name, email, phone } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      res.status(404).send("User not found");;
      return 
    }

    // Update the fields
    user.name = name;
    user.email = email;
    user.phone = phone;

    await user.save();

    res.render('userEdit', { user, message: 'Profile updated successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong while updating");
  }
};

export default {
    getLogin,
    getSignUp,
    signup,
    home,
    logout,
    login,
    getEdit,
    edit
}