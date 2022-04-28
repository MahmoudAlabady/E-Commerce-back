const {Product} = require('../models/product');
const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
}

  // multibel image
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let errUpload = new Error('Invalid Type')
        if(FILE_TYPE_MAP[file.mimetype]){
            errUpload = null;
        }
      cb(errUpload, 'public/uploads')
    },

    filename: function (req, file, cb) {
      const uniqueSuffix = file.originalname.split(' ').join('-')+Date.now() + '-' + Math.round(Math.random() * 1E9)
      const extension = FILE_TYPE_MAP[file.mimetype]
      cb(null,  `${uniqueSuffix}.${extension}`)
    }
  })
  
  const upload = multer({ storage: storage })

router.get(`/`, async (req, res) =>{
    let categoryFilter = {}
    if(req.query.categories){
        filter = {category: req.query.categories.split(',')}
    }
    const productList = await Product.find(categoryFilter).populate('category');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})

router.get(`/miniDetails`, async (req, res) =>{
    const productList = await Product.find().select('name image -_id');

    if(!productList) {
        res.status(500).json({success: false})
    } 
    res.send(productList);
})

router.get(`/:id`, async (req, res) =>{
    const product = await Product.findById(req.params.id).populate('category');

    if(!product) {
        res.status(500).json({success: false, message:"product not found"})
    } 
    res.status(200).send(product);
})
router.get('/get/count',async (req,res)=>{
    try {
    const productListCount = await Product.countDocuments()
    if(!productListCount){
        res.status(500).json({success:false})
    }
    res.send({
        productListCount : productListCount
    })
    } catch (error) {
        res.status(500).send('e'+error)
    }
    
})
router.get('/get/featured/:count',async (req,res)=>{
    try {
    const count = req.params.count ? req.params.count : 0    
    const productList = await Product.find({isFeatured: true}).limit(+count)
    if(!productList){
        res.status(500).json({success:false})
    }
    res.send({
        productList 
    })
    } catch (error) {
        res.status(500).send('e'+error)
    }
    
})
router.post(`/`,upload.single('image') ,async (req, res) =>{
    const category = await Category.findById(req.body.category);
    if(!category){return res.status(400).send('Invalid Category')};
    const fileReq = req.file;
    if(!fileReq){return res.status(400).send('no image in the request')};

    const fileFeat = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription:req.body.richDescription,
        image: `${basePath}${fileFeat}`,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock: req.body.countInStock,
        rating:req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured:req.body.isFeatured
    })

    product = await product.save();
    if(!product){return res.status(500).send("product cannot be created");}
    res.send(product)
})

router.put('/:id', upload.single('image'),async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){res.status(400).send('Invalid product ID')}
    const category = await Category.findById(req.body.category);
    if(!category){return res.status(400).send('Invalid Category')};
    const productValidation = await Product.findById(req.params.id);
    if(!productValidation){
        return res.status(400).send('Invalid product')
    }

    const fileReq = req.file;
let imageurl;
if (fileReq) {
    const imageName = fileReq.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    imageurl = `${basePath}${imageName}`
} else {
    imageurl = product.image;
}

    const product =await Product.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        description: req.body.description,
        richDescription:req.body.richDescription,
        image: imageurl,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock: req.body.countInStock,
        rating:req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured:req.body.isFeatured
    },
    {new: true}
        )
    if(!product){return res.status(404).send('the product cannot be created!')}
    res.send(product);
})

router.delete('/:id', async (req,res)=>{
    Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success: true,message:"deleted"})
        }
        else {
            return res.status(404).json({success: false,message:"not deleted"})
        }
    }).catch(error=>{
        return res.status(500).json({success: false,error: error})
    })
})

router.put('/prodcut-images/:id', upload.array('images',20),async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        return res.status(400).send('Invalid Product Id')
    } 
    const filesReq = req.files;

    let imagesPaths = [];

    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    if(filesReq){
        filesReq.map(image=>{imagesPaths.push(`${basePath}${image.fileName}`)})
    }
    const product =await Product.findByIdAndUpdate(req.params.id,{
    
        images: imagesPaths,
       
    },
    {new: true}
        )
        if(!product){return res.status(500).send("product cannot be updated");}
        res.send(product)
} )
module.exports =router;