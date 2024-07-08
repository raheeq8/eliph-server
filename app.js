const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv/config');
// const authJwt = require('./helper/jwt.js');

app.use(cors());
app.options('*', cors());

// PORT
const PORT = process.env.PORT || 8080

// middlewaresconst

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("uploads"));
// app.use(authJwt())

// Routes
const categoryRoute = require('./routes/category.route');
const subCatRoute = require('./routes/subCat.route');
const productRoute = require('./routes/product.route');
const imageUploadRoutes = require('./helper/imageUpload.js');
const productWeightRoutes = require('./routes/productWeight.js');
const productRAMSRoutes = require('./routes/productRAMS.js');
const productSIZESRoutes = require('./routes/productSize.js');
const productColorsRoutes = require('./routes/productColor.js');
const userRoutes = require('./routes/user.js');
const productReviews = require('./routes/productReviews.js');
const cartSchema = require('./routes/cart.js');
const myListSchema = require('./routes/myList.js');
const ordersSchema = require('./routes/orders.js');
const homeBannerSchema = require('./routes/homeBanner.js');
const searchRoutes = require('./routes/search.js');
const shopRoutes = require('./routes/shop.js');



app.use("/api/user",userRoutes);
app.use('/uploads', express.static("uploads"))
app.use('/api/category', categoryRoute);
app.use('/api/subCat', subCatRoute);
app.use('/api/products', productRoute);
app.use(`/api/imageUpload`, imageUploadRoutes);
app.use(`/api/productWeight`, productWeightRoutes);
app.use(`/api/productRAMS`, productRAMSRoutes);
app.use(`/api/productSIZE`, productSIZESRoutes);
app.use(`/api/productCOLOR`, productColorsRoutes);
app.use(`/api/productReviews`, productReviews);
app.use(`/api/cart`, cartSchema);
app.use(`/api/my-list`, myListSchema);
app.use(`/api/orders`, ordersSchema);
app.use(`/api/homeBanner`, homeBannerSchema);
app.use(`/api/search`, searchRoutes);
app.use(`/api/shop`, shopRoutes);

// Database connection
mongoose.connect(process.env.MONGO_URI,
//      {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// }
)
.then(() => {
    console.log('Database connected successfully')
})
.catch((err) => {
    console.log(`Error !! mongodb connection failed ${err}`)
})

// Server

app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`))