const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "ForeverUser", 
            required: true 
        },
        orderNumber: {
            type: String,
            unique: true,
            required: true
        },
        orderItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                name: { type: String, required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                image: { type: String, required: true },
            },
        ],
        shippingInfo: {
            fullName: { type: String, required: true },
            email: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            postalCode: { type: String, required: true },
            country: { type: String, required: true, default: "Pakistan" },
        },
        shippingMethod: {
            name: { type: String, required: true },
            price: { type: Number, required: true },
            estimatedDays: { type: String, required: true },
        },
        paymentMethod: {
            type: { type: String, required: true },
            status: { 
                type: String, 
                enum: ['pending', 'completed', 'failed'],
                default: 'pending'
            },
            details: { type: Object }
        },
        orderSummary: {
            itemsTotal: { type: Number, required: true },
            shippingCost: { type: Number, required: true },
            taxAmount: { type: Number, required: true },
            discountAmount: { type: Number, default: 0 },
            totalAmount: { type: Number, required: true },
        },
        promoCode: {
            code: { type: String },
            discountPercent: { type: Number, default: 0 }
        },
        orderStatus: {
            type: String,
            enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
            default: "pending"
        },
        trackingNumber: { type: String },
        isPaid: { type: Boolean, default: false },
        paidAt: { type: Date },
        isDelivered: { type: Boolean, default: false },
        deliveredAt: { type: Date },
        notes: { type: String },
    },
    { 
        timestamps: true 
    }
);

// Generate order number before saving
orderSchema.pre('save', async function(next) {
    if (this.isNew) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        this.orderNumber = `ORD-${timestamp}-${random}`;
        
        // Generate tracking number
        this.trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }
    next();
});

module.exports = mongoose.model("Order", orderSchema);