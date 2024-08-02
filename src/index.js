const express = require('express');
const app = express();
const pool = require('./db');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());

app.use(cors());

app.get('/orders', async (req, res) => {
  try {
    const [rows] = await db.query(`
          SELECT 
              o.order_identifier, 
              o.delivery_mode, 
              o.amount_paid, 
              o.order_sent, 
              o.order_wish, 
              o.order_expected, 
              o.order_date, 
              c.customer_name
          FROM orders o
          JOIN customers c ON o.customer_id = c.customer_id
      `);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).send('Error fetching orders');
  }
});



app.get('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    // Fetch the specific order
    const [orderRows] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    
    if (orderRows.length === 0) {
      return res.status(404).send('Order not found');
    }

    let order = orderRows[0];

    // Fetch order items for the specific order
    const [orderItems] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    order.order_items = orderItems;

    for (let item of orderItems) {
      // Fetch delivery details for each order item
      const [deliveryDetails] = await pool.query('SELECT * FROM delivery_details WHERE order_item_id = ?', [item.order_item_id]);
      item.delivery_details = deliveryDetails;
    }

    // Fetch price details for the specific order
    const [priceDetails] = await pool.query('SELECT * FROM price_details WHERE order_id = ?', [orderId]);
    order.price_details = priceDetails;

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


// Create a new order
app.post('/orders', async (req, res) => {
  const { customer_name, product_name, amount_paid, order_date } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO orders (customer_name, product_name, amount_paid, order_date) VALUES (?, ?, ?, ?)', [customer_name, product_name, amount_paid, order_date]);
    res.status(201).json({ id: result.insertId, customer_name, product_name, amount_paid, order_date });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
