import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, Alert, Tabs, Tab } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { toast } from 'react-toastify';

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    fetchItems();
  }, [activeTab]);
  
  const fetchItems = async () => {
    try {
      setLoading(true);
      let url = `${API_URL}/api/items/user`;
      
      if (activeTab !== 'all') {
        url += `?type=${activeTab}`;
      }
      
      const res = await axios.get(url);
      setItems(res.data.data);
    } catch (err) {
      setError('Error fetching your items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/api/items/${id}`);
        setItems(items.filter(item => item._id !== id));
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
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Items</h1>
        <Link to="/items/add" className="btn btn-primary">
          Report an Item
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="all" title="All Items" />
        <Tab eventKey="lost" title="Lost Items" />
        <Tab eventKey="found" title="Found Items" />
      </Tabs>
      
      {items.length === 0 ? (
        <Alert variant="info">
          You haven't reported any {activeTab !== 'all' ? activeTab : ''} items yet.
        </Alert>
      ) : (
        <Row>
          {items.map((item) => (
            <Col md={4} key={item._id} className="mb-4">
              <Card className="h-100">
                <div style={{ height: '200px', overflow: 'hidden' }}>
                  {item.images && item.images.length > 0 ? (
                    <Card.Img 
                      variant="top" 
                      src={`${API_URL}/uploads/items/${item.images[0]}`} 
                      style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                    />
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '100%' }}>
                      <p className="text-muted">No Image</p>
                    </div>
                  )}
                </div>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <Badge bg={item.type === 'lost' ? 'danger' : 'success'}>
                      {item.type === 'lost' ? 'Lost' : 'Found'}
                    </Badge>
                    <Badge bg={
                      item.status === 'open' ? 'primary' :
                      item.status === 'claimed' ? 'warning' :
                      item.status === 'resolved' ? 'success' : 'secondary'
                    }>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>
                    {item.description.length > 100
                      ? `${item.description.substring(0, 100)}...`
                      : item.description}
                  </Card.Text>
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">
                      {formatDate(item.date)}
                    </small>
                    <small className="text-muted">
                      {item.location.city}, {item.location.state}
                    </small>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <div className="d-flex justify-content-between">
                    <Link to={`/items/${item._id}`} className="btn btn-primary">
                      View
                    </Link>
                    <div>
                      <Link to={`/items/edit/${item._id}`} className="btn btn-outline-secondary me-2">
                        Edit
                      </Link>
                      <Button 
                        variant="outline-danger" 
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MyItems;