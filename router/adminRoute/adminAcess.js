import express from "express";
import adminAuth from "../../middleware/adminAuth.js";
import db from '../../db/database.js'


const router = express.Router()


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

export default router