// client/src/pages/ProductsPage.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../components/Dashboard.css';

const ProductsPage = ({ handleLogout }) => {
  const [products, setProducts] = useState([]);
  // State for the new product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    itemCode: '',
    purchasePrice: '',
    sellingPrice: '',
    qty: ''
  });

  const token = localStorage.getItem('erp-token');

  // Fetch products on load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleAddProduct = async () => {
    // Basic validation
    if (
      !newProduct.name ||
      !newProduct.itemCode ||
      !newProduct.purchasePrice ||
      !newProduct.sellingPrice ||
      !newProduct.qty
    ) {
      return alert('Please fill in all fields');
    }

    try {
      await axios.post('http://localhost:5000/api/products', newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Reset form and refresh list
      setNewProduct({
        name: '',
        itemCode: '',
        purchasePrice: '',
        sellingPrice: '',
        qty: ''
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to add product');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  return (
     <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Header handleLogout={handleLogout} />
        
        <main className="content-area">
          <div className="dashboard-header">
            <h1>Product Management</h1>
            <p>Add and manage inventory items</p>
          </div>

          {/* Add Product Section - Styled like 'admin-panel' from reference */}
          <div className="admin-panel">
            <h2>Add New Product</h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '16px', 
              marginBottom: '20px' 
            }}>
              {/* Product Name */}
              <input
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00' }}
              />

              {/* Item Code */}
              <input
                placeholder="Item Code (e.g. P-001)"
                value={newProduct.itemCode}
                onChange={(e) => setNewProduct({ ...newProduct, itemCode: e.target.value })}
                style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00' }}
              />

              {/* Purchase Price */}
              <input
                type="number"
                placeholder="Purchase Price"
                value={newProduct.purchasePrice}
                onChange={(e) => setNewProduct({ ...newProduct, purchasePrice: e.target.value })}
                style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00' }}
              />

              {/* Selling Price */}
              <input
                type="number"
                placeholder="Selling Price"
                value={newProduct.sellingPrice}
                onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00' }}
              />

              {/* Qty */}
              <input
                type="number"
                placeholder="Qty (Stock)"
                value={newProduct.qty}
                onChange={(e) => setNewProduct({ ...newProduct, qty: e.target.value })}
                style={{ padding: '12px', borderRadius: '12px', border: '2px solid #ff8c00' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={handleAddProduct} 
                className="add-new-btn" 
                style={{ padding: '12px 30px' }}
              >
                + Add Product
              </button>
            </div>
          </div>

          {/* Product List - Styled like 'widget-card' from reference */}
          <div className="widget-card">
            <h2>Product List ({products.length})</h2>
            
            {products.length === 0 ? (
              <p style={{ padding: '20px', color: '#666', textAlign: 'center' }}>
                No products yet. Add your first product above.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#fff8f0', color: '#333' }}>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Name</th>
                    <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Item Code</th>
                    <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid #eee' }}>Purchase Price</th>
                    <th style={{ padding: '16px', textAlign: 'right', borderBottom: '1px solid #eee' }}>Selling Price</th>
                    <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Qty (Stock)</th>
                    <th style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid #eee' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '16px' }}><strong>{product.name}</strong></td>
                      <td style={{ padding: '16px', color: '#555' }}>{product.itemCode}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>{product.purchasePrice}</td>
                      <td style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold', color: '#2e7d32' }}>
                        {product.sellingPrice}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          background: product.qty > 0 ? '#e8f5e9' : '#ffebee',
                          color: product.qty > 0 ? '#2e7d32' : '#c62828',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {product.qty}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button 
                          onClick={() => deleteProduct(product.id)} 
                          style={{ 
                            color: '#dc3545', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            fontWeight: 'bold'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </main>
      </div>
    </div>
  );
};

export default ProductsPage;