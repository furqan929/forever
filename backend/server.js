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

// CORS Configuration
const allowedOrigins = [
    'https://forever-57jk.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

if (process.env.FRONTEND_URL) {
    const frontendUrl = process.env.FRONTEND_URL.trim();
    if (frontendUrl && !allowedOrigins.includes(frontendUrl)) {
        allowedOrigins.push(frontendUrl);
    }
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
