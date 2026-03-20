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
        secure: true,        // 🔥 Render / HTTPS
        sameSite: "none",    // 🔥 Required for frontend-backend different domains
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // ✅ RESPONSE
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




