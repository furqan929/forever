const Stripe = require("stripe");

exports.paymentMethod = async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { cartItems } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart items are required" });
        }

        // Create line items for Stripe
        const lineItems = cartItems.map(item => ({
            price_data: {
                currency: "pkr",
                product_data: {
                    name: item.name,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects amount in paisa for PKR
            },
            quantity: item.quantity || 1,
        }));

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: lineItems,
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel",
        });

        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        console.error("Error in payment method:", error);
        res.status(500).json({ message: error.message });
    }
};
