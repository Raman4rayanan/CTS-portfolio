require('dotenv').config();
require('dns').setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_PORTFOLIO_URI).then(() => {
    console.log("Mongoose connected successfully!");
    process.exit(0);
}).catch(e => {
    console.error("Mongoose connection failed:", e);
    process.exit(1);
});
