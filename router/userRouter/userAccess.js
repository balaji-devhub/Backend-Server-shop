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




router.post("/add-cart", Auth, async (req, res) => {

    try {

        const userId = req.user.id; // from Auth middleware
        const { product_id, quantity } = req.body;

        if (!product_id) {
            return res.status(400).json({
                message: "Product id required"
            });
        }

        // Check if user has cart
        const [existingCart] = await db.query(
            `SELECT id FROM cart WHERE user_id=?`,
            [userId]
        );

        let cartId;

        if (existingCart.length === 0) {

            const [newCart] = await db.query(
                `INSERT INTO cart(user_id) VALUES(?)`,
                [userId]
            );

            cartId = newCart.insertId;

        } else {

            cartId = existingCart[0].id;
        }

        // check product already in cart
        const [existingItem] = await db.query(
            `SELECT * FROM cart_items 
             WHERE cart_id=? AND product_id=?`,
            [cartId, product_id]
        );

        if (existingItem.length > 0) {

            await db.query(
                `UPDATE cart_items
                 SET quantity = quantity + ?
                 WHERE cart_id=? AND product_id=?`,
                [quantity || 1, cartId, product_id]
            );

        } else {

            await db.query(
                `INSERT INTO cart_items(
                    cart_id,
                    product_id,
                    quantity
                )
                VALUES(?,?,?)`,
                [cartId, product_id, quantity || 1]
            );
        }

        res.json({
            message: "Added to cart"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }

});



router.get("/my-cart", Auth, async (req, res) => {

    try {

        const userId = req.user.id;

        const [items] = await db.query(`
        
        SELECT 
        cart_items.id as cart_item_id,
        cart_items.quantity,
        products.id,
        products.product_name,
        products.price,
        products.image_url
        
        FROM cart
        JOIN cart_items 
        ON cart.id=cart_items.cart_id

        JOIN products
        ON products.id=cart_items.product_id

        WHERE cart.user_id=?
        
        `, [userId])

        res.json({
            cart_items: items
        })

    } catch (error) {

        res.status(500).json({
            error: error.message
        })

    }

})






router.put("/update-cart/:itemId", Auth, async (req, res) => {

    try {

        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be greater than 0"
            })
        }

        await db.query(
            `UPDATE cart_items
            SET quantity=?
            WHERE id=?`,
            [quantity, itemId]
        )

        res.json({
            message: "Cart updated"
        })

    } catch (error) {

        res.status(500).json({
            error: error.message
        })

    }

})



router.delete("/remove-cart/:itemId", Auth, async (req, res) => {

    try {

        const { itemId } = req.params

        await db.query(
            `DELETE FROM cart_items
            WHERE id=?`,
            [itemId]
        )

        res.json({
            message: "Item removed"
        })

    } catch (error) {

        res.status(500).json({
            error: error.message
        })

    }

})


export default router;



export default router