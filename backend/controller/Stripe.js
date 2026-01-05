const Stripe = require("stripe");

exports.paymentMethod = async (req, res) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    try {
        const { cartItems } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart items are required" });
        }

        // Create line items for Stripe
        const lineItems = cartItems.map(item => {
            // Handle both nested product structure and direct item structure
            const product = item.product || item;
            const price = product.discountedPrice || product.price || 0;
            const name = product.name || 'Product';
            const image = product.image || '';
            const quantity = item.quantity || 1;

            return {
                price_data: {
                    currency: "pkr",
                    product_data: {
                        name: name,
                        images: image ? [image] : [],
                    },
                    unit_amount: Math.round(price * 100), // Stripe expects amount in paisa for PKR
                },
                quantity: quantity,
            };
        });

        // Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: lineItems,
            success_url: `${process.env.FRONTEND_URL || 'https://forever-57jk.vercel.app'}/success`,
            cancel_url: `${process.env.FRONTEND_URL || 'https://forever-57jk.vercel.app'}/cancel`,
        });

        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url,
        });
    } catch (error) {
        console.error("Error in payment method:", error);
        res.status(500).json({ 
            success: false,
            message: error.message,
            error: error.toString()
        });
    }
};
