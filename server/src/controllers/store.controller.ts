import { Request, Response } from "express";
import Product from "../models/Product";
import Order from "../models/Order";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import cloudinaryService from "../services/cloudinary.service";

// ============================================
// PRODUCT CONTROLLERS (PUBLIC)
// ============================================

// @desc    Get all products
// @route   GET /api/store/products
// @access  Public
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;

    const query: any = { isAvailable: true };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    let sortQuery: any = { createdAt: -1 };
    if (sort === "price-low") sortQuery = { price: 1 };
    if (sort === "price-high") sortQuery = { price: -1 };
    if (sort === "name") sortQuery = { name: 1 };

    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// @desc    Get single product
// @route   GET /api/store/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

// ============================================
// ORDER CONTROLLERS (PROTECTED)
// ============================================

// @desc    Create new order
// @route   POST /api/store/orders
// @access  Private
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;
    const user = (req as any).user;

    if (!items || items.length === 0) {
      res.status(400).json({
        success: false,
        message: "No order items",
      });
      return;
    }

    // Verify stock and calculate total just to be safe
    let calculatedTotal = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product ${item.name} not found`,
        });
        return;
      }
      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
        return;
      }
      calculatedTotal += product.price * item.quantity;
    }

    // In a real app, we'd use calculatedTotal. For now, we trust the frontend but verify it's reasonably close or just use calculatedTotal.
    // Let's use calculatedTotal for security.
    
    const paymentReference = `ORD-${uuidv4().split("-")[0].toUpperCase()}-${Date.now()}`;

    const order = await Order.create({
      userId: user._id,
      items,
      totalAmount: calculatedTotal,
      shippingAddress,
      paymentReference,
      paymentStatus: "pending",
      orderStatus: "processing",
    });

    res.status(201).json({
      success: true,
      data: order,
      message: "Order created successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
};

// @desc    Verify order payment
// @route   POST /api/store/orders/verify/:reference
// @access  Private
export const verifyOrderPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;

    const order = await Order.findOne({ paymentReference: reference });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    // Call Paystack to verify
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status && response.data.data.status === "success") {
      order.paymentStatus = "completed";
      await order.save();

      // Deduct stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      res.status(200).json({
        success: true,
        message: "Payment verified and order updated",
        data: order,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "An error occurred during verification",
      error: error.message,
    });
  }
};

// ============================================
// ADMIN CONTROLLERS
// ============================================

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
export const adminCreateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
export const adminUpdateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
       res.status(404).json({
        success: false,
        message: "Product not found",
      });
       return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
export const adminDeleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all products (admin)
// @route   GET /api/admin/products
// @access  Private/Admin
export const adminGetAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const adminGetAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

// @desc    Upload product image
// @route   POST /api/admin/product-image/upload
// @access  Private/Admin
export const adminUploadProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
       res.status(400).json({
        success: false,
        message: "Please upload an image",
      });
       return;
    }

    const result = await cloudinaryService.uploadImage(
      req.file.buffer,
      req.file.originalname,
      "store/products"
    );

    res.status(200).json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
      message: "Image uploaded successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
};
