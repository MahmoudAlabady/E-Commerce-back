const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
require("dotenv").config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL,{useNewUrlParser:true})
.then(()=>console.log(`Connected successfully to ${process.env.MONGO_URL}...`))
.catch(err => console.error('Connecttuon faild ...',err))
app.use(cors());
app.options('*', cors())


//middleware
app.use(express.json());
app.use(morgan('tiny'));

//Routes
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');



app.use(`/api/categories`, categoriesRoutes);
app.use(`/api/products`, productsRoutes);
app.use(`/api/users`, usersRoutes);
app.use(`/api/orders`, ordersRoutes);

const port = process.env.PORT;
const server = app.listen(port,()=>console.log(`server is running on ${port}`));
module.exports = server;
