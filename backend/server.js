let express = require("express")
let cors = require("cors")
let connected = require("./config/db")
let dotenv = require("dotenv")
let AuthRoute = require("./routes/AuthRoutes")
let ProductRoute = require("./routes/Products")
let wishlistRoutes = require("./routes/WishList");
let cartRoutes = require("./routes/Cart")
let orderRoutes = require("./routes/Order")
let adminUser = require("./routes/Admin")
let admin2 = require("./routes/Admin2")
let password = require("./routes/PasswordResetRoutes")
let user = require("./routes/EditProRoute");
let payment = require("./routes/StripeRoute")
dotenv.config()
connected()

let app = express()

app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}))


app.use("/api/auth", AuthRoute)

app.use("/api/products", ProductRoute)

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/cart", cartRoutes)

app.use("/api/orders", orderRoutes)

app.use("/api/admin", adminUser)

app.use("/api/admin2", admin2)

app.use("/api/passwords", password)

app.use("/api/user", user);

app.use("/api/payment", payment)

// Root route for health check
app.get("/", (req, res) => {
    res.json({ message: "Backend API is running", status: "success" })
})

app.listen(process.env.PORT || 3000, () => {
    console.log("App Is Running");
})
