const { Cart } = require('../models/cart');
const { Orders } = require('../models/orders');
const { Shop } = require('../models/shop');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const path = require('path');
const pdf = require('html-pdf');
const fs = require('fs-extra');
const { PDFDocument, rgb } = require('pdf-lib');
const { User } = require('../models/user');
const nodemailer = require('nodemailer');

const countOrdersByStatusAndShop = async (status, shopId) => {
    try {
      const count = await Orders.countDocuments({ status, shopId });
      return count;
    } catch (error) {
      console.error(`Error counting ${status} orders for shop ${shopId}:`, error);
      throw error;
    }
};

router.get('/order-counts/:shopId', async (req, res) => {
    const { shopId } = req.params;
  
    try {
      const pendingCount = await countOrdersByStatusAndShop('Pending', shopId);
      const confirmedCount = await countOrdersByStatusAndShop('Confirm', shopId);
      const shippedCount = await countOrdersByStatusAndShop('Shipped', shopId);
      const deliveredCount = await countOrdersByStatusAndShop('Delivered', shopId);
      const cancelledCount = await countOrdersByStatusAndShop('Cancelled', shopId);
      const rejectedCount = await countOrdersByStatusAndShop('Rejected', shopId);
  
      res.status(200).json({
        pending: pendingCount,
        confirmed: confirmedCount,
        shipped: shippedCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
        rejected: rejectedCount,
      });
    } catch (error) {
      console.error('Error fetching order counts:', error);
      res.status(500).json({ message: 'Failed to fetch order counts' });
    }
  });

router.get(`/`, async (req, res) => {
    try {
        const ordersList = await Orders.find(req.query).populate("shop")
        if (!ordersList) {
            return res.status(500).json({ success: false })
        }

        return res.status(200).json(ordersList);

    } catch (error) {
        return res.status(500).json({ success: false })
    }
});
router.get('/:id', async (req, res) => {

    const orderId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid Order ID' });
    }

    try {
        const order = await Orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'The order with the given ID was not found.' });
        }
        return res.status(200).send(order);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
})
router.get(`/get/count`, async (req, res) => {
    try {

        const orderCount = await Orders.countDocuments();

        return res.status(200).send({
            success: true,
            orderCount: orderCount,
        });
    } catch (error) {
        console.error('Error counting orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }

})
router.post('/create', async (req, res) => {

    try {
        let order = new Orders({
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            state: req.body.state,
            city: req.body.city,
            pincode: req.body.pincode,
            amount: req.body.amount,
            email: req.body.email,
            userid: req.body.userid,
            products: req.body.products,
            shop: req.body.shop
        });



        if (!order) {
            res.status(500).json({
                error: err,
                success: false
            })
        }


        order = await order.save();
        await Cart.deleteMany({ userId: req.body.userid });

        // Fetch user and vendor emails
        const user = await User.findById(req.body.userid);
        const vendor = await Shop.findById(req.body.shop);

        // Define the email content
        const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Slip</title>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f4f4f4; }
          .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; }
          .header { background-color: #2d2df5; padding: 20px; text-align: center; color: #ffffff; }
          .content { padding: 20px; }
          .order-details { margin-bottom: 20px; }
          .order-items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .order-items th, .order-items td { border: 1px solid #ddd; padding: 8px; }
          .order-total { text-align: right; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #777777; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>HiBuyShopping - Order Slip</h1></div>
          <div class="content">
            <div class="order-details">
              <p><strong>Order Number:</strong> ${order._id}</p>
              <p><strong>Date:</strong> ${order.date}</p>
              <p><strong>Shipping Address:</strong> ${order.address}</p>
            </div>
            <table class="order-items">
              <thead>
                <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${order.products.map(item => `
                  <tr>
                    <td>${item.productTitle}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price}</td>
                    <td>${item.quantity * item.price}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="order-total">Total Amount: ${order.amount}</div>
          </div>
          <div class="footer">&copy; 2024 HiBuyShopping. All rights reserved.</div>
        </div>
      </body>
      </html>
    `;

        // Setup Nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'hibuyshoppingofficial@gmail.com',
                pass: 'omgr hsaj wgin mtir', // Use environment variables in production
            },
        });

        // Send email to user
        await transporter.sendMail({
            from: 'HiBuyShopping <hibuyshoppingofficial@gmail.com>',
            to: user.email,
            subject: "Your Order Slip - HiBuyShopping",
            html: htmlContent,
        });

        // Send email to vendor
        await transporter.sendMail({
            from: 'HiBuyShopping <hibuyshoppingofficial@gmail.com>',
            to: vendor.email,
            subject: "New Order Received - HiBuyShopping",
            html: htmlContent,
        });



        return res.status(201).json(order);
    } catch (error) {
        console.log('order_create', error);
        return res.status(500).json({ message: "Internal server error " })
    }

});
router.delete('/:id', async (req, res) => {

    try {
        const deletedOrder = await Orders.findByIdAndDelete(req.params.id);

        if (!deletedOrder) {
            return res.status(404).json({
                message: 'Order not found!',
                success: false
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Order Deleted!'
        })
    } catch (error) {
        console.log('order_delete', error);
        return res.status(500).json({ message: "Internal server error " })
    }
});
router.put('/:id', async (req, res) => {

    try {
        const order = await Orders.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                phoneNumber: req.body.phoneNumber,
                address: req.body.address,
                province: req.body.province,
                city: req.body.city,
                state: req.body.state,
                amount: req.body.amount,
                email: req.body.email,
                userid: req.body.userid,
                products: req.body.products,
                status: req.body.status
            },
            { new: true }
        )
        if (!order) {
            return res.status(500).json({
                message: 'Order cannot be updated!',
                success: false
            })
        }

        return res.status(200).send(order);

    } catch (error) {
        console.log('order_put', error);
        return res.status(500).json({ message: "Internal server error " })
    }
})
router.get('/totalRevenue', async (req, res) => {
    try {
        const orders = await Orders.find();
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + order.subTotal, 0)
        return res.status(200).send(totalRevenue)
    } catch (error) {
        console.log('order_totalRevenue', error);
        return res.status(500).json({ message: "Internal server error " })
    }
})

router.get('/generate-receipt/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Orders.findById(orderId).populate('products.productId').populate('shop');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 400]);
        const { width, height } = page.getSize();
        const fontSize = 12;

        page.drawText(`Invoice #${order._id}`, {
            x: 50,
            y: height - 4 * fontSize,
            size: fontSize + 2,
            color: rgb(0, 0, 0),
        });

        page.drawText(`Date: ${order.date}`, {
            x: 50,
            y: height - 8 * fontSize,
            size: fontSize,
            color: rgb(0, 0, 0),
        });

        let currentY = height - 12 * fontSize;

        order.products.forEach((item) => {
            const text = `${item.productId.title} - Qty: ${item.quantity} - Price: ${item.price}`;
            page.drawText(text, {
                x: 50,
                y: currentY - fontSize,
                size: fontSize,
                color: rgb(0, 0, 0),
            });
            currentY -= 2 * fontSize;
        });

        page.drawText(`Total: Rs. ${order.amount}`, {
            x: 50,
            y: currentY - fontSize,
            size: fontSize + 2,
            color: rgb(0, 0, 0),
        });

        const pdfBytes = await pdfDoc.save();
        const receiptsDir = path.join(__dirname, 'receipts');
        await fs.ensureDir(receiptsDir);
        const receiptPath = path.join(receiptsDir, `receipt_${order._id}.pdf`);
        await fs.writeFile(receiptPath, pdfBytes);

        return res.json({ success: true, receiptUrl: `/receipts/receipt_${order._id}.pdf` });
    } catch (error) {
        console.error('Error generating receipt:', error);
        return res.status(500).json({ success: false, message: 'Error generating receipt.' });
    }
});
router.put('/cancel/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { reason } = req.body;

        const order = await Orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.status === 'Cancelled') {
            return res.status(400).json({ success: false, message: 'Order already cancelled' });
        }

        if (order.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Order can only be cancelled when the status is Pending' });
        }

        order.status = 'Cancelled';
        order.cancellationReason = reason;
        await order.save();

        return res.status(200).json({ success: true, message: 'Order cancelled successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/monthly-sales', async (req, res) => {
    try {
        const monthlySales = await Orders.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    totalSales: { $sum: "$amount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        return res.status(200).json(monthlySales);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});
router.post('/return', async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        if (!orderId || !reason) {
            return res.status(400).json({ message: 'Order ID and return reason are required' });
        }

        const order = await Orders.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.returnRequested) {
            return res.status(400).json({ message: 'Return already requested' });
        }

        if (order.status !== 'Delivered') {
            return res.status(400).json({ success: false, message: 'Order can only be Return when the status is Delivered' });
        }

        order.returnRequested = true;
        order.returnReason = reason;
        order.returnDate = new Date();

        await order.save();

        return res.status(200).json({ message: 'Return request successful', order });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;
