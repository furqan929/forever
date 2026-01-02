let User = require("../model/Auth")
let Order = require("../model/Order")
let Product = require("../model/Product")

exports.getAllUsers = async (req, res) => {
    try {
        let users = await User.find().select("-password")
        res.send(users)
    } catch (err) {
        console.error(err)
        res.send({ message: "Server Error" })
    }
}
exports.deleteUser = async (req, res) => {
    try {
        let user = await User.findByIdAndDelete(req.params.id)
        res.send({ message: "User Deleted" })
    } catch (err) {
        console.error(err)
        res.send({ message: "Server Error" })
    }
}

exports.getOrders = async (req, res) => {
    try {
        let orders = await Order.find().populate("user", "products.product")
        res.send(orders)
    }
    catch (err) {
        console.error(err)
        res.send({ message: "Server Error" })
    }
}

exports.productsAdmin = async (req, res) => {
    try {
        let products = await Product.find()
        res.send(products)
    } catch (err) {
        console.error(err)
        res.send({ message: "Server Error" })
    }
}