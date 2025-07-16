import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Form, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { toast } from 'react-toastify';

const ItemManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    search: ''
  });
  
  useEffect(() => {
    fetchItems();
  }, [filters]);
  
  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      
      const res = await axios.get(`${API_URL}/api/admin/items?${queryParams.toString()}`);
      setItems(res.data.data);
    } catch (err) {
      setError('Error fetching items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const handleStatusChange = async (itemId, newStatus) => {
    try {
      await axios.put(`${API_URL}/api/admin/items/${itemId}/status`, {
        status: newStatus
      });
      
      // Update item in the list
      setItems(items.map(item => 
        item._id === itemId ? { ...item, status: newStatus } : item
      ));
      
      toast.success('Item status updated successfully');
    } catch (err) {
      toast.error('Error updating item status');
      console.error(err);
    }
  };
  
  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/api/admin/items/${itemId}`);
        
        // Remove item from the list
        setItems(items.filter(item => item._id !== itemId));
        
        toast.success('Item deleted successfully');
      } catch (err) {
        toast.error('Error deleting item');
        console.error(err);
      }
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }
  
  return (
    <div>
      <h1 className="mb-4">Item Management</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="lost">Lost</option>
                  <option value="found">Found</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Jewelry">Jewelry</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Accessories">Accessories</option>
                  <option value="Documents">Documents</option>
                  <option value="Pets">Pets</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="open">Open</option>
                  <option value="claimed">Claimed</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by title or description"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {items.length === 0 ? (
        <Alert variant="info">
          No items found matching your criteria.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Category</th>
              <th>Date</th>
              <th>Status</th>
              <th>User</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.title}</td>
                <td>
                  <Badge bg={item.type === 'lost' ? 'danger' : 'success'}>
                    {item.type === 'lost' ? 'Lost' : 'Found'}
                  </Badge>
                </td>
                <td>{item.category}</td>
                <td>{formatDate(item.date)}</td>
                <td>
                  <Badge bg={
                    item.status === 'open' ? 'primary' :
                    item.status === 'claimed' ? 'warning' :
                    item.status === 'resolved' ? 'success' : 'secondary'
                  }>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </td>
                <td>{item.user?.name || 'Unknown'}</td>
                <td>{item.location?.city}, {item.location?.state}</td>
                <td>
                  <div className="d-flex">
                    <Link 
                      to={`/items/${item._id}`} 
                      className="btn btn-primary btn-sm me-2"
                      target="_blank"
                    >
                      View
                    </Link>
                    <Form.Select
                      size="sm"
                      className="me-2"
                      style={{ width: 'auto' }}
                      value={item.status}
                      onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    >
                      <option value="open">Open</option>
                      <option value="claimed">Claimed</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </Form.Select>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(item._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ItemManagement;