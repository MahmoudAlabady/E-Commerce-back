const {Order} = require('../models/order');
const {OrderItem} = require('../models/orderItem');

const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user', 'name').sort({'orderDate':-1});

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})

router.get(`/:orderId`, async (req, res) =>{
    const order = await Order.findById(req.params.orderId)
    .populate('user', 'name')
    .populate({
        path:'orderItems',
         populate:{
             path:'product',populate:'category'}
            });

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
})

router.get(`/get/hisoryOrders/:userId`, async (req, res) =>{
    const userOrders = await Order.find({user: req.params.userId})
    .populate({
        path:'orderItems',
         populate:{
             path:'product',populate:'category'}
            });

    if(!userOrders) {
        res.status(500).json({success: false})
    } 
    res.send(userOrders);
})

router.post('/', async (req,res)=>{
    const orderItemIds = Promise.all( req.body.orderItems.map(async item =>{
        let newItem = new OrderItem({
            quantity:item.quantity,
            product:item.product
        })
        await newItem.save();
        return newItem._id;
    }))

    const orderItemIdsResolved = await orderItemIds;
    const totalFinalPrices = await Promise.all(orderItemIdsResolved.map(async (orderItemId)=>{
      const orderItem = await OrderItem.findById(orderItemId).populate('product','price')
      const totalFinalPrice = orderItem.product.price * orderItem.quantity;
      return totalFinalPrice
    }))
const totalPrices = totalFinalPrices.reduce((a,b) => a +b, 0);

console.log(totalFinalPrices)
    let order =new Order({
        orderItems:orderItemIdsResolved,
        shippingAddressOne:req.body.shippingAddressOne,
        shippingAddressTwo:req.body.shippingAddressTwo,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        status:req.body.status,
        totalPrice:totalPrices,
        user:req.body.user,


    })
 order= await order.save(); 
 if(!order){return res.status(404).send('the order cannot be created!')}
 res.send(order);
})

router.put('/:id', async (req,res)=>{
    const order =await Order.findByIdAndUpdate(req.params.id,{
        status:req.body.status,
        
    },
    {new: true}
        )
    if(!order){return res.status(404).send('the order cannot be created!')}
    res.send(order);
})

router.delete('/:id', async (req,res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order => {
        if(order) {
          await order.orderItems.map(async item => {
              await OrderItem.findByIdAndRemove(item)
          })
          return   res.status(200).json({success: true,message:"deleted"})

        }
        else {
            return res.status(404).json({success: false,message:"not deleted"})
        }
    }).catch(error=>{
        return res.status(500).json({success: false,error: error})
    })
})

// router.delete('/:id', (req, res)=>{
//     Order.findByIdAndRemove(req.params.id).then(async order =>{
//         if(order) {
//             await order.orderItems.map(async orderItem => {
//                 await OrderItem.findByIdAndRemove(orderItem)
//             })
//             return res.status(200).json({success: true, message: 'the order is deleted!'})
//         } else {
//             return res.status(404).json({success: false , message: "order not found!"})
//         }
//     }).catch(err=>{
//        return res.status(500).json({success: false, error: err}) 
//     })
// })



// router.delete('/:id/:_id', async (req,res)=>{
//     const order = await Order.findByIdAndRemove(req.params.id)
//     await OrderItem.findByIdAndRemove(req.params._id)

//         if(order){
//           return   res.status(200).json({success: true,message:"deleted"})

//         }
//         else {
//             return res.status(404).json({success: false,message:"not deleted"})
//         }
   
//     // .then(OrderItem.findOneAndRemove({orderItems:req.body.orderItems})
//     // )
    
//         return res.status(500).json({success: false,error: error})
    
// })
router.get('/get/salesTotalCount',async (req,res)=>{
    const salesTotal = await Order.aggregate([
        {$group:{_id: 0 , total : {$sum : '$totalPrice'}}}
    ])
    if (!salesTotal) {
        return res.status(400).send('cannot be calaulated')
    }
    res.send({salesTotal:salesTotal.pop().total})
} )

router.get('/get/count',async (req,res)=>{
    try {
    const OrderListCount = await Order.countDocuments()
    if(!OrderListCount){
        res.status(500).json({success:false})
    }
    res.send({
        OrderListCount : OrderListCount
    })
    } catch (error) {
        res.status(500).send('e'+error)
    }
    
})
module.exports =router;