const mongoose = require('mongoose');
const {RecentlyViewd} = require('../models/recentlyViewd');

async function deleteAllProducts() {
  try {
    await mongoose.connect('mongodb+srv://raheeqgillofficial:DatlnlU7dcdVdaXL@cluster0.kkkhkvn.mongodb.net/rgStore', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await RecentlyViewd.deleteMany({});
    console.log('All products deleted');
  } catch (error) {
    console.error('Error deleting products:', error);
  } finally {
    await mongoose.disconnect();
  }
}

deleteAllProducts();