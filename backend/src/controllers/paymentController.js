const Razorpay = require('razorpay');

const createOrder = async (req, res) => {
  try {
    const { amount, currency } = req.body;
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder'
    });

    const options = {
      amount: amount * 100, // amount in smallest currency unit (paise)
      currency: currency || "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ message: 'Some error occurred while creating order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ message: error.message || 'Error creating order' });
  }
};

module.exports = { createOrder };
