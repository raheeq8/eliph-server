const { Cart } = require('../models/cart');
const { Orders } = require('../models/orders');
const { Shop } = require('../models/shop');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');



router.get(`/`, async (req, res) => {
    try {
        const ordersList = await Orders.find(req.query)
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
        res.status(200).send(order);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
})


router.get(`/get/count`, async (req, res) => {
    try {

        const orderCount = await Orders.countDocuments();

        res.send({
            success: true,
            orderCount: orderCount,
        });
    } catch (error) {
        console.error('Error counting orders:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }

})



router.post('/create', async (req, res) => {

    let order = new Orders({
        name: req.body.name,
        phoneNumber: req.body.phoneNumber,
        address: req.body.address,
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
    // Clear the cart for the user
    await Cart.deleteMany({ userId: req.body.userid });
    res.status(201).json(order);

});


router.delete('/:id', async (req, res) => {

    const deletedOrder = await Orders.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
        res.status(404).json({
            message: 'Order not found!',
            success: false
        })
    }

    res.status(200).json({
        success: true,
        message: 'Order Deleted!'
    })
});


router.put('/:id', async (req, res) => {

    const order = await Orders.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            pincode: req.body.pincode,
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

    res.send(order);

})


router.get('/totalRevenue', async (req, res) => {
    const orders = await Orders.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) => acc + order.subTotal, 0)
    res.send(totalRevenue)
})

// router.get('/generate-receipt/:id', async (req, res) => {
//   try {
//       const orderId = req.params.id;
//       const order = await Orders.findById(orderId).populate('products.productId').populate('shop');

//       if (!order) {
//           return res.status(404).json({ message: 'Order not found' });
//       }

//       const htmlContent = `
// <html>
// <head>
// <style>
//   @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');

// :root {
// --primary-color: #f4f4f4;  
// }

// * {
// margin: 0;
// padding: 0;
// box-sizing: border-box;
// font-family: 'Roboto', sans-serif;
// letter-spacing: 0.5px;
// }

// body {
// background-color: var(--primary-color);
// }
// .imgBox{
// width: 100px;
// height: 100px;
// display: flex;
// align-items: center;
// justify-content: center;
// position: relative;
// left: 30%;
// }
// .imgBox img{
// width: 100%;
// object-fit: cover;
// }

// .invoice-card {
// display: flex;
// flex-direction: column;
// position: absolute;
// padding: 10px 2em;
// top: 50%;
// left: 50%;
// transform: translate(-50%, -50%);
// min-height: 25em;
// width: 22em;
// background-color: #fff;
// border-radius: 5px;
// box-shadow: 0px 10px 30px 5px rgba(0, 0, 0, 0.15);
// }

// .invoice-card > div {
// margin: 5px 0;
// }

// .invoice-title {
// flex: 3;
// }

// .invoice-title #date {
// display: block;
// margin: 8px 0;
// font-size: 12px;
// }

// .invoice-title #main-title {
// display: flex;
// justify-content: space-between;
// margin-top: 2em;
// }

// .invoice-title #main-title h4 {
// letter-spacing: 2.5px;
// }

// .invoice-title span {
// color: rgba(0, 0, 0, 0.4);
// }

// .invoice-details {
// flex: 1;
// border-top: 0.5px dashed grey;
// border-bottom: 0.5px dashed grey;
// display: flex;
// align-items: center;
// }

// .invoice-table {
// width: 100%;
// border-collapse: collapse;
// }

// .invoice-table thead tr td {
// font-size: 12px;
// letter-spacing: 1px;
// color: grey;
// padding: 8px 0;
// }

// .invoice-table thead tr td:nth-last-child(1),
// .row-data td:nth-last-child(1),
// .calc-row td:nth-last-child(1)
// {
// text-align: right;
// }

// .invoice-table tbody tr td {
//   padding: 8px 0;
//   letter-spacing: 0;
// }

// .invoice-table .row-data #unit {
// text-align: center;
// }

// .invoice-table .row-data span {
// font-size: 13px;
// color: rgba(0, 0, 0, 0.6);
// }

// .invoice-footer {
// flex: 1;
// display: flex;
// justify-content: flex-end;
// align-items: center;
// }

// .invoice-footer #later {
// margin-right: 5px;
// }

// .btn {
// border: none;
// padding: 5px 0px;
// background: none;
// cursor: pointer;
// letter-spacing: 1px;
// outline: none;
// }

// .btn.btn-secondary {
// color: rgba(0, 0, 0, 0.3);
// }

// .btn.btn-primary {
// color: var(--primary-color);
// }

// .btn#later {
// margin-right: 2em;
// }
// </style>
// </head>
// <body>
// <div class="invoice-card">

//     <div class="imgBox">
//     <img src="https://via.placeholder.com/100" alt="Logo" >
//     </div>
// <div class="invoice-title">
//   <div id="main-title">
//     <h4>INVOICE</h4>
//     <span>#89 292</span>
//   </div>
  
//   <span id="date">${order?.date}</span>
// </div>

// <div class="invoice-details">
//   <table class="invoice-table">
//     <thead>
//       <tr>
//         <td>PRODUCT</td>
//         <td>QTY</td>
//         <td>PRICE</td>
//       </tr>
//     </thead>
    
//     <tbody>
//      ${order.products.map(item => `
//         <tr class="row-data">
//           <td>${item?.productTitle?.substr(0, 33) + '...'}</td>
//           <td>${item.quantity}</td>
//           <td>${item.price}</td>
//         </tr>
//       `).join('')}
      
//       <tr class="calc-row">
//         <td colspan="2">Total</td>
//         <td>Rs. ${order.amount}</td>
//       </tr>
//     </tbody>
//   </table>
// </div>

// <div class="invoice-footer">
//   <button class="btn btn-secondary" id="later">LATER</button>
//   <button class="btn btn-primary">PAY NOW</button>
// </div>
// </div>
// </body>
// </html>
// `;

//       const imageBuffer = await nodeHtmlToImage({
//           html: htmlContent,
//           type: 'jpeg'
//       });

//       res.set('Content-Type', 'image/jpeg');
//       res.send(imageBuffer);
//   } catch (error) {
//       return res.status(500).json({ success: false, message: error.message });
//   }
// });

router.get('/generate-receipt/:id', async (req, res) => {
    try {
      const orderId = req.params.id;
      const order = await Orders.findById(orderId).populate('products.productId').populate('shop');
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      const htmlContent = `
      <html>
      <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
        :root { --primary-color: #f4f4f4; }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Roboto', sans-serif; letter-spacing: 0.5px; }
        body { background-color: var(--primary-color); }
        .imgBox { width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; position: relative; left: 30%; }
        .imgBox img { width: 100%; object-fit: cover; }
        .invoice-card { display: flex; flex-direction: column; position: absolute; padding: 10px 2em; top: 50%; left: 50%; transform: translate(-50%, -50%); min-height: 25em; width: 22em; background-color: #fff; border-radius: 5px; box-shadow: 0px 10px 30px 5px rgba(0, 0, 0, 0.15); }
        .invoice-card > div { margin: 5px 0; }
        .invoice-title { flex: 3; }
        .invoice-title #date { display: block; margin: 8px 0; font-size: 12px; }
        .invoice-title #main-title { display: flex; justify-content: space-between; margin-top: 2em; }
        .invoice-title #main-title h4 { letter-spacing: 2.5px; }
        .invoice-title span { color: rgba(0, 0, 0, 0.4); }
        .invoice-details { flex: 1; border-top: 0.5px dashed grey; border-bottom: 0.5px dashed grey; display: flex; align-items: center; }
        .invoice-table { width: 100%; border-collapse: collapse; }
        .invoice-table thead tr td { font-size: 12px; letter-spacing: 1px; color: grey; padding: 8px 0; }
        .invoice-table thead tr td:nth-last-child(1), .row-data td:nth-last-child(1), .calc-row td:nth-last-child(1) { text-align: right; }
        .invoice-table tbody tr td { padding: 8px 0; letter-spacing: 0; }
        .invoice-table .row-data #unit { text-align: center; }
        .invoice-table .row-data span { font-size: 13px; color: rgba(0, 0, 0, 0.6); }
        .invoice-footer { flex: 1; display: flex; justify-content: flex-end; align-items: center; }
        .invoice-footer #later { margin-right: 5px; }
        .btn { border: none; padding: 5px 0px; background: none; cursor: pointer; letter-spacing: 1px; outline: none; }
        .btn.btn-secondary { color: rgba(0, 0, 0, 0.3); }
        .btn.btn-primary { color: var(--primary-color); }
        .btn#later { margin-right: 2em; }
      </style>
      </head>
      <body>
      <div class="invoice-card">
        <div class="imgBox">
          <img src="https://via.placeholder.com/100" alt="Logo" >
        </div>
        <div class="invoice-title">
          <div id="main-title">
            <h4>INVOICE</h4>
            <span>#${order._id}</span>
          </div>
          <span id="date">${order?.date}</span>
        </div>
        <div class="invoice-details">
          <table class="invoice-table">
            <thead>
              <tr>
                <td>PRODUCT</td>
                <td>QTY</td>
                <td>PRICE</td>
              </tr>
            </thead>
            <tbody>
              ${order.products.map(item => `
                <tr class="row-data">
                  <td>${item?.productTitle?.substr(0, 33) + '...'}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price}</td>
                </tr>
              `).join('')}
              <tr class="calc-row">
                <td colspan="2">Total</td>
                <td>Rs. ${order.amount}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="invoice-footer">
          <button class="btn btn-secondary" id="later">LATER</button>
          <button class="btn btn-primary">PAY NOW</button>
        </div>
      </div>
      </body>
      </html>
      `;
  
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const imageBuffer = await page.screenshot({ type: 'jpeg' });
  
      await browser.close();
  
      res.set('Content-Type', 'image/jpeg');
      res.send(imageBuffer);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
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

      res.status(200).json({ success: true, message: 'Order cancelled successfully' });
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
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

      res.status(200).json(monthlySales);
  } catch (error) {
      res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;


