const express = require('express');
const Products = require('./products.model');
const Reviews = require('../reviews/reviews.model');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const router = express.Router();

// post  a product

router.post('/create-product', async(req, res) =>{
    try {
        const newProduct = new Products({
            ...req.body
        })

        const savedProduct = await newProduct.save();
        // calaculate review
        const reviews = await Reviews.find({productId: savedProduct._id});
        if(reviews.lenght>0){
            const totalRating = reviews.reduce((acc, review) =>acc + review.rating, 0)
       const averageRating = totalRating/reviews.length;
       savedProduct.rating = averageRating;
       await savedProduct.save();
        };

        res.status(201).send(savedProduct);
    } catch (error) {
        console.log('Error creating new product', error);
        res.status(500).send({message: 'error creating new product'});

        
    }




})

//get all products
router.get('/', async (req,res) =>{
    try {
        const {category, color, minPrice, maxPrice, page =1, limit = 10} = req.query;
        let filter = {};
        if(category && category !== 'all'){
            filter.category = category;}

            if(color && color !== 'all'){
                filter.color = color;
            }
 
            if(minPrice && maxPrice){
                const min = parseFloat(minPrice);
                const max = parseFloat(maxPrice)
                if(isNaN(min) && !isNaN(max)) {
                    filter.price ={$gte: min, $lte: max};
                }
            }
                
                     const skip = (parseInt(page) - 1)* parseInt(limit);
                      const totalProducts = await Products.countDocuments(filter);
                      const totalPages = Math.ceil(totalProducts / parseInt(limit));
                      const products = await Products.find(filter)
                                      .skip(skip)
                                      .limiyt(parseInt(limit))
                                      .populate('author', 'email')
                                      .sort({createdAt: -1});
                                      res.status(200).send({products, totalPages});
        } catch (error) {
            console.log('Error fetching products', error);
            res.status(500).send({message: 'error fetching products'});
            }

});

// get single product

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params.id;
        const product = await Products.findById(id).populate('author', 'email username');
        if(!product){
            return res.status(404).send({meassage: 'products not found'});

        }
        const reviews = await Reviews.find({productId}).populate('userId', 'email username');
        res.status(200).send({product, reviews});

    } catch(error) {
        console.log('Error fetching product', error);
        res.status(500).send({message: 'error fetching product'});
}
})

// update a product
router.patch('/update-product/:id',verifyToken, verifyAdmin,async(req, res) => {
    try{
        const productId  = req.params.id;
        
        const updatedProduct = await Products.findByIdAndUpdate(productId,{...req.body},{new: true});
        if(!updatedProduct){
            return res.status(404).send({message: 'product not found'})
        }
        res.status(200).send({message: 'product updated', updatedProduct});
     } catch(error){
            console.log('Error updating product', error);
            res.status(500).send({message: 'error updating product'});

        }
        
    });


// delete a Product
router.delete("/id", async(req,res) => {
    try{
        const productId = req.params.id;    
        const deletedProduct = await Products.findByIdAndDelete(productId);
        if(!deletedProduct){
            return res.status(404).send({message: 'product not found'})
            }

            // delete all reviews associated with the product
            await Reviews.deleteMany({productId: productId});  
            res.status(200).send({message: 'product deleted', deletedProduct});
    }
    catch(error){
        console.log('Error deleting product', error);
        res.status(500).send({message: 'error deleting product'});
        }
})
 //get related products
 router.get('/related/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        if(!id){
            return res.status(400).send({message: 'product not found'});
        }
        const product = await Products.findById(productId);
        if(!product){
            return res.status(404).send({message: 'product not found'});
            }
       const titleRegex = new RegExp(
        product.name.split(" ").
        filter((word)=> word.length> 1)
        .join("|"),
        "i"
       );
       const relatedProducts = await Products.find({
        _id: {$ne:id},

        $or: [
            {name: {$regex: titleRegex}},
            {category: product.category},
        
        ]
       });
       res.status(200).send(relatedProducts);

            
            } catch (error) {
                console.log('Error fetching related products', error);
                res.status(500).send({message: 'error fetching related products'});
                }
                })

            


module.exports = router;