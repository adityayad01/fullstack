import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Form, Button, InputGroup, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/constants';

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter and sort states
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Categories and types for filter options
  const categories = ['Electronics', 'Clothing', 'Accessories', 'Documents', 'Other'];
  const types = ['lost', 'found'];
  const statuses = ['open', 'closed', 'resolved'];
  
  useEffect(() => {
    fetchItems();
  }, [filters, sortBy, sortOrder]);
  
  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Build query string from filters and sort options
      const queryParams = new URLSearchParams();
      
      // Add filters
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      
      // Add sorting
      queryParams.append('sort', sortOrder === 'desc' ? `-${sortBy}` : sortBy);
      
      const res = await axios.get(`${API_URL}/api/items?${queryParams.toString()}`);
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
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new sort field
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      status: '',
      search: ''
    });
    setSortBy('createdAt');
    setSortOrder('desc');
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge bg="success">Open</Badge>;
      case 'closed':
        return <Badge bg="danger">Closed</Badge>;
      case 'resolved':
        return <Badge bg="info">Resolved</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  const getTypeBadge = (type) => {
    switch (type) {
      case 'lost':
        return <Badge bg="warning">Lost</Badge>;
      case 'found':
        return <Badge bg="primary">Found</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };
  
  return (
    <div className="container mt-4">
      <h2>Items</h2>
      
      {/* Filter and Sort Section */}
      <Card className="mb-4">
        <Card.Body>
          <h5>Filter & Sort</h5>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select 
                  name="type" 
                  value={filters.type} 
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select 
                  name="category" 
                  value={filters.category} 
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  name="status" 
                  value={filters.status} 
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Sort By</Form.Label>
                <InputGroup>
                  <Form.Select 
                    value={sortBy} 
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    <option value="createdAt">Date</option>
                    <option value="title">Title</option>
                    <option value="reward">Reward</option>
                  </Form.Select>
                  <Button 
                    variant="outline-secondary"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={9}>
              <Form.Group>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by title, description, or location..."
                />
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button 
                variant="secondary" 
                className="w-100"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <div className="alert alert-info">No items found matching your criteria.</div>
          ) : (
            <Row>
              {items.map(item => (
                <Col key={item._id} md={4} className="mb-4">
                  <Card>
                    {item.images && item.images.length > 0 && (
                      <Card.Img 
                        variant="top" 
                        src={`${API_URL}/uploads/items/${item.images[0]}`} 
                        alt={item.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    )}
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        {getTypeBadge(item.type)}
                        {getStatusBadge(item.status)}
                      </div>
                      <Card.Title>{item.title}</Card.Title>
                      <Card.Text>
                        {item.description.length > 100
                          ? `${item.description.substring(0, 100)}...`
                          : item.description}
                      </Card.Text>
                      <div className="d-flex justify-content-between">
                        <Badge bg="secondary">{item.category}</Badge>
                        {item.reward > 0 && (
                          <Badge bg="success">Reward: ${item.reward}</Badge>
                        )}
                      </div>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-between">
                      <small className="text-muted">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </small>
                      <Link to={`/items/${item._id}`} className="btn btn-sm btn-primary">
                        View Details
                      </Link>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </div>
  );
};

export default Items;