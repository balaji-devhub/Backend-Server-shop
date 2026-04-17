import express from "express";
import adminAuth from "../../middleware/adminAuth.js";
import db from '../../db/database.js'


const router = express.Router()


// product add 

router.post('/add-product', adminAuth, async (request, response) => {
    const { product_name, price, image_url } = request.body

    if (!product_name || !price || !image_url) {
        return response.json({
            message: 'Above field are Required'
        })
    }

    await db.query(`
        INSERT INTO products (product_name,price,image_url) 
        VALUES (?,?,?)
        `, [product_name, price, image_url])

    const [product_id] = await db.query(`SELECT COUNT(*) AS Product_count FROM products`)

    response.json({
        message: 'Product added Succesfully',
        product_id
    })

})


// update Product details 

router.put('/upt-product/:id', adminAuth, async (request, response) => {
    const { product_name, price, image_url } = request.body
    const { id } = request.params

    if (!product_name || !price || !image_url) {
        return response.status(400).json({
            message: 'Above field are Required'
        })
    }

    await db.query(`
        UPDATE products 
        SET product_name = ? , price = ? , image_url = ?
        WHERE id = ?
        `, [product_name, price, image_url, id])



    response.status(200).json({
        message: 'Product Updated Succesfully'
    })

})


router.delete('/del-product/:id', adminAuth, async (request, response) => {
    const { id } = request.params

    const [find_product] = await db.query(`
            SELECT * FROM products WHERE id = ?
         `, [id])

    if (find_product.length === 0) {
        return response.status(404).json({
            message: 'Product Not found '
        })
    }

    await db.query(`
        DELETE FROM products 
        WHERE id = ?
        `, [id])

    response.status(200).json({
        message: '"Product Deleted Successfully"'
    })

})



export default router