


import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// ===============================
// Auto-update order statuses
// ===============================
const updateOrderStatuses = async () => {
  try {
    const orders = await Order.find({ status: { $in: ["Pending", "Order Placed"] } });
    const now = Date.now();

    for (let order of orders) {
      const age = now - new Date(order.createdAt).getTime();

      if (age >= 2 * 60 * 1000 && order.status !== "Delivered") {
        order.status = "Delivered";
        await order.save();
        console.log(`Order ${order._id} marked as Delivered`);
      } else if (age >= 1 * 60 * 1000 && order.status !== "Order Placed") {
        order.status = "Order Placed"; // Confirmed
        await order.save();
        console.log(`Order ${order._id} marked as Order Placed`);
      }
    }
  } catch (err) {
    console.error("Error updating orders:", err.message);
  }
};

// Run every 1 minute
setInterval(updateOrderStatuses, 60 * 1000);

// ===============================
// Place order COD: /api/order/place
// ===============================
export const placeOrderCOD = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address } = req.body;

    if (!address || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid order details", success: false });
    }

    // Calculate total amount
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: "Product not found", success: false });
      }
      amount += product.offerPrice * item.quantity;
    }

    // Add 2% tax
    amount += Math.floor((amount * 2) / 100);

    // Create order
    const order = await Order.create({
      userId,
      items,
      address,
      amount,
      paymentType: "COD",
      isPaid: false,
      status: "Pending",
    });

    res.status(201).json({ message: "Order placed successfully", success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ===============================
// Get orders for individual user: /api/order/user
// ===============================
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ===============================
// Get orders for seller: /api/order/seller
// ===============================
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user;
    const orders = await Order.find({
      "items.product.seller": sellerId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ===============================
// Get all orders for admin: /api/order/all
// ===============================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

 