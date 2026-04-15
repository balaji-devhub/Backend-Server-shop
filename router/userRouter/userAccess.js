import express from "express";
import db from '../../db/database.js'
import Auth from "../../middleware/userAuth.js";

const router = express.Router()

router.get('/all-products', Auth, async (request, response) => {

    const [product] = await db.query(`SELECT * FROM products `)

    response.json({
        product_data: product
    })
})



export default router