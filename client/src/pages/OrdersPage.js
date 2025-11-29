import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get current user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="content-area">
      <h1>
        Orders 
        {user.branchName && <span> — {user.branchName}</span>}
        {user.role === 'admin' && <span> (All Branches)</span>}
      </h1>

      <div className="stats-cards">
        {orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="card">
              <h3>#{order.orderNumber}</h3>
              <p><strong>{order.customerName}</strong></p>
              <p>Total: ${order.total.toFixed(2)}</p>
              <span className={`card-trend ${order.status === 'completed' ? 'positive' : 'neutral'}`}>
                {order.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrdersPage;