import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;

		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon
				? [
						{
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// create a new Order
			const products = JSON.parse(session.metadata.products);
			const newOrder = new Order({
				user: session.metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: session.amount_total / 100, // convert from cents to dollars,
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
};

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}


/*
The payment.controller.js handles Stripe checkout sessions and integrates coupon functionality to offer discounts on purchases. Here's a breakdown of the key functions and logic:

1. createCheckoutSession
This function creates a Stripe checkout session for the user. It processes the products, applies any available discount via coupons, and calculates the total amount. Here's a step-by-step explanation:

Extracting Products and Coupon Code: The function retrieves the products array and an optional couponCode from the request body.
Validation: It checks if the products array is valid and non-empty. If not, it returns a 400 error.
Processing Line Items: It maps each product to a Stripe-compatible line_item, which includes price_data (currency, product name, image, and price in cents) and quantity.
Coupon Application:
If a couponCode is provided, it looks up the coupon in the database based on the user's ID, ensuring the coupon is still active.
The total amount is reduced by the coupon’s discount percentage.
Stripe Checkout Session:
A Stripe checkout session is created with the processed line_items.
If a valid coupon exists, the function creates a Stripe coupon using createStripeCoupon.
The session's metadata includes user and product information, which can be used to track the order post-purchase.
Post-purchase Coupon Generation:
If the total amount is greater than $200 (20,000 cents), a new coupon is generated for the user.
Response: Returns the session ID and total amount (in dollars) to the client.
2. checkoutSuccess
This function handles the success callback after payment is completed.

Retrieve the Session: It fetches the session using the sessionId from Stripe.
Mark Coupon as Used: If the session includes a coupon code, it deactivates the coupon (marks isActive as false).
Create Order: It creates a new order entry in the database using the session metadata:
The products array is extracted from the session and includes product IDs, quantities, and prices.
The total amount is stored, and the Stripe session ID is recorded.
Response: Returns a success message, including the newly created order ID.
3. Helper Functions
createStripeCoupon(discountPercentage): This creates a Stripe coupon with the specified discount percentage that can be applied once.
createNewCoupon(userId): After deleting any existing coupon for the user, this function generates a new coupon code with a 10% discount and a 30-day expiration.
Summary of Coupon and Order Models:
Coupon Model (coupon.model.js):

Defines the schema for coupons, including a unique code, discountPercentage, expirationDate, and isActive flag.
Coupons are user-specific, linked to the userId.
Order Model (order.model.js):

Stores order information such as the user, the list of purchased products (including product, quantity, and price), totalAmount, and the stripeSessionId.
This payment.controller.js efficiently integrates Stripe for payments, handles discount coupons, and tracks orders with relevant information stored in the database.
*/