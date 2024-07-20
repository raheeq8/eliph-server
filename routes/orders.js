const { Cart } = require('../models/cart');
const { Orders } = require('../models/orders');
const { Shop } = require('../models/shop');
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const path = require('path');
const pdf = require('html-pdf');
const fs = require('fs-extra');


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

router.get('/generate-receipt/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Orders.findById(orderId).populate('products.productId').populate('shop');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const htmlContent = `
    <html lang="da">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Faktura Generator with Print</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Roboto', sans-serif;
      background-color: #f1f2f3;
      padding: 20px;
      margin: 0;
      user-select: none;
    }

    .material-symbols-rounded {
      font-variation-settings:
        'FILL' 1,
        'wght' 400,
        'GRAD' 0,
        'opsz' 24;
    }

    .header {
      display: flex;
      align-items: center;
    }

    .header span {
      margin-right: 10px;
      color: black;
    }

    .header:hover span,
    .header:hover h1 {
      color: grey;
    }

    .invoice {
      max-width: 800px;
      margin: auto;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
      padding: 40px;
    }

    h1 {
      margin: 0;
      color: black;
      cursor: pointer;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      background-color: #fff;
    }

    th,
    td {
      border-bottom: 1px solid #e0e0e0;
      padding: 16px;
      text-align: left;
    }

    th {
      background-color: #fff;
      color: black;
    }

    td {
      background-color: #fff;
      text-align: right;
    }

    .description-col {
      width: 35%;
    }

    .quantity-col,
    .price-col {
      width: 20%;
    }

    .total-col {
      width: 25%;
      text-align: right;
    }

    .totals {
      text-align: right;
      margin-top: 20px;
      position: relative;
    }

    .no-print {
      display: none;
    }

    @media print {
      .no-print {
        display: none !important;
      }
    }

    input[type="text"],
    input[type="number"] {
      width: calc(100%);
      box-sizing: border-box;
      word-wrap: break-word;
      margin-top: 4px;
      margin-bottom: 4px;
      border: none;
      border-bottom: 2px solid #f5f5f5;
      outline: none;
      background-color: transparent;
    }

    .add-row-btn,
    .rmw-row-btn,
    .print-row-btn,
    button {
      display: inline-block;
      margin-top: 20px;
      float: left;
      padding: 14px 28px;
      position: left;
      margin-right: 5px;
      color: white;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 1em;
      transition: background-color 0.3s ease, transform 0.3s ease;
    }

    .add-row-btn {
      background-color: #189bcc;
    }

    .add-row-btn:hover {
      background-color: #4b4e6c;
    }

    .rmw-row-btn {
      background-color: #f68b70;
    }

    .rmw-row-btn:hover {
      background-color: #f35a33;
    }

    .print-row-btn {
      background-color: darkgrey;
    }

    .print-row-btn:hover {
      background-color: grey;
    }

    button {
      margin-top: 20px;
      display: block;
    }

    .footer {
      text-align: center;
      margin-top: 40px;
      font-size: 0.8em;
      color: #666;
    }

    .tax-field strong {
      margin-right: 10px;
      white-space: nowrap;
    }

    .tax-field input {
      width: 80px;
      margin-left: 5px;
    }

    .tax {
      display: flex;
    }
  </style>
</head>

<body>
  <div class="invoice">
    <div class="header">
      <span class="material-symbols-rounded">
        receipt_long
      </span>
      <h1 id="invoice-type" onclick="toggleInvoiceType()">Faktura</h1>
    </div>
    <p><input type="text" id="from" placeholder="Firmaets informationer"></p>
    <p><input type="text" id="to" placeholder="Kundens informationer"></p>

    <table id="invoice-table">
      <thead>
        <tr>
          <th class="description-col">Name</th>
          <th class="quantity-col">Size</th>
          <th class="price-col">Qty</th>
          <th class="total-col">Price</th>
        </tr>
      </thead>
      <tbody>
        ${order?.products?.map((item) => `
          <tr>
          <td>${item?.productTitle?.substr(0, 33) + '...'}</td>
                <td>${item.size}</td>
                <td>${item.quantity}</td>
                <td>${item.price}</td>
          <td class="no-print"><button class="material-icons remove-row" onclick="removeRow(this)">delete</button></td>
        </tr>
          ` )}
        
      </tbody>
    </table>

    <div class="totals">
      <button class="add-row-btn no-print" onclick="addRow()"><span class="material-symbols-rounded">
docs_add_on
</span></button>
      <button class="rmw-row-btn no-print" onclick="removeLastRow()"><span class="material-symbols-rounded">
delete
</span></button>
      <button class="print-row-btn no-print" onclick="window.print()"><span class="material-symbols-rounded">
print
</span></button>

      <div class="tax-field">
        <p><span style="vertical-align: middle; color: red; font-size: 2em;" class="material-symbols-rounded">
arrow_drop_up
</span><input type="number" id="tax" placeholder="Moms %" oninput="updateTotals()"></p>
      </div>

      <div class="tax-field">
        <p><span style="vertical-align: middle; color: green; font-size: 2em;" class="material-symbols-rounded">
arrow_drop_down
</span><input type="number" id="discount" placeholder="Rabat %" oninput="updateTotals()"></p>
      </div>

      <p style="color: grey; font-size: 0.8em;"><strong>Subtotal:</strong> <span id="subtotal">0,00 DKK</span></p>
      <p style="color: grey; font-size: 0.8em;"><strong>Moms udgør:</strong> <span id="tax-amount">0,00 DKK</span></p>
      <p style="color: grey; font-size: 0.8em;"><strong>Besparelse:</strong> <span id="discount-amount">0,00 DKK</span></p>
      <p style="color: darkblue; font-size: 1.3em; font-weight: bold;"><strong>Total:</strong> <span id="total">0,00 DKK</span></p>
    </div>
  </div>

  <div class="footer">
    <p>Skabt af Marc Sonne Dahl <span style= "vertical-align: middle; font-size: 1.3em;" class="material-symbols-rounded">
copyright
</span> 2024</p>
  </div>

</body>

</html>

    `;

    const receiptsDir = path.join(__dirname, 'receipts');
    await fs.ensureDir(receiptsDir);

    const receiptPath = path.join(receiptsDir, `receipt_${order._id}.pdf`);

    pdf.create(htmlContent).toFile(receiptPath, (err, result) => {
      if (err) {
        console.error('Error generating receipt:', err);
        return res.status(500).json({ success: false, message: 'Error generating receipt.' });
      }

      console.log('Receipt saved at:', receiptPath); // Debugging log
      res.download(receiptPath, `receipt_${order._id}.pdf`, (err) => {
        if (err) {
          console.error('Error sending file:', err);
        }
      });
    });
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


