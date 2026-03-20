// import jwt from "jsonwebtoken";
// // seller login :/api/seller/login
// export const sellerLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (
//       password === process.env.SELLER_PASSWORD &&
//       email === process.env.SELLER_EMAIL
//     ) {
//       const token = jwt.sign({ email }, process.env.JWT_SECRET, {
//         expiresIn: "7d",
//       });
//       res.cookie("sellerToken", token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: process.env.NODE_ENV === "production" ? "none" : "Strict",
//         maxAge: 7 * 24 * 60 * 60 * 1000,
//       });
//       return res
//         .status(200)
//         .json({ message: "Login successful", success: true });
//     } else {
//       return res
//         .status(400)
//         .json({ message: "Invalid credentials", success: false });
//     }
//   } catch (error) {
//     console.error("Error in sellerLogin:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


import jwt from "jsonwebtoken";

// ================= SELLER LOGIN =================
export const sellerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.SELLER_EMAIL &&
      password === process.env.SELLER_PASSWORD
    ) {
      const token = jwt.sign(
        { email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // ✅ STORE TOKEN IN COOKIE
      res.cookie("sellerToken", token, {
        httpOnly: true,
        secure: true,      // 🔥 Render (HTTPS)
        sameSite: "none",  // 🔥 Cross-origin (frontend + backend)
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // ✅ RESPONSE (NO TOKEN IN JSON)
      return res.status(200).json({
        success: true,
        message: "Login successful",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ================= CHECK AUTH =================
export const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.sellerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    // ✅ VERIFY TOKEN
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      success: true,
      user: decoded,
    });

  } catch (error) {
    console.error("Error in checkAuth:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// ================= LOGOUT =================
export const sellerLogout = async (req, res) => {
  try {
    res.clearCookie("sellerToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });

  } catch (error) {
    console.error("Error in logout:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

