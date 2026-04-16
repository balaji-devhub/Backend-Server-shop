import express, { response } from 'express'
import database from './schema/ApplicationSchema.js'
import dotenv from 'dotenv'
import userAuth from './router/userRouter/userLogin.js'
import useAccess from './router/userRouter/userAccess.js'

import adminAuth from './router/adminRoute/adminAuth.js'

dotenv.config()

const PORT = process.env.PORT

const app = express()

app.use(express.json())

database()

// router middleware 

// user route
app.use('/user', userAuth, useAccess)

// admin route
app.use('/admin', adminAuth)

app.get('/', (reqest, response) => {
    response.send('Xon  Server')
})


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});