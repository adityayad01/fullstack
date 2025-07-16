import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, Alert, Carousel } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ItemDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchedItem, setMatchedItem] = useState(null);

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/items/${id}`);
      setItem(res.data.data);

      if (res.data.data.matchedWith) {
        const matchRes = await axios.get(`${API_URL}/api/items/${res.data.data.matchedWith}`);
        setMatchedItem(matchRes.data.data);
      }
    } catch (err) {
      setError('Error fetching item details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/api/items/${id}`);
        toast.success('Item deleted successfully');
        navigate('/my-items');
      } catch (err) {
        toast.error('Error deleting item');
        console.error(err);
      }
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <Alert variant="danger">
        {error || 'Item not found'}
      </Alert>
    );
  }

const isOwner = isAuthenticated && user && item.user._id === user._id;
const canClaim = isAuthenticated && !isOwner && item.status === 'open';

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{item.title}</h1>
        <div>
          {isOwner && (
            <>
              <Link to={`/items/edit/${id}`} className="btn btn-primary me-2">
                Edit
              </Link>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
          {canClaim && item.type === 'found' && (
            <Link to={`/items/${id}/claim`} className="btn btn-success">
              Claim This Item
            </Link>
          )}
        </div>
      </div>

      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between mb-3">
                <Badge bg={item.type === 'lost' ? 'danger' : 'success'} className="fs-6">
                  {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
                </Badge>
                <Badge bg="info" className="fs-6">{item.category}</Badge>
              </div>

              {item.images && item.images.length > 0 ? (
                <Carousel className="mb-4">
                  {item.images.map((image, index) => (
                    <Carousel.Item key={index}>
                      <img
                        className="d-block w-100"
                        src={`${API_URL}/uploads/items/${image}`}
                        alt={`Item image ${index + 1}`}
                        style={{ height: '400px', objectFit: 'contain' }}
                      />
                    </Carousel.Item>
                  ))}
                </Carousel>
              ) : (
                <div className="bg-light d-flex align-items-center justify-content-center mb-4" style={{ height: '400px' }}>
                  <p className="text-muted">No Images Available</p>
                </div>
              )}

              <h4>Description</h4>
              <p>{item.description}</p>

              <div className="d-flex align-items-center mb-3">
                <FaCalendarAlt className="me-2 text-primary" />
                <span>
                  {item.type === 'lost' ? 'Lost on: ' : 'Found on: '}
                  {formatDate(item.date)}
                </span>
              </div>

              <div className="d-flex align-items-center mb-3">
                <FaMapMarkerAlt className="me-2 text-primary" />
                <span>
                  {item.location.formattedAddress || 
                    `${item.location.city}, ${item.location.state}, ${item.location.country}`}
                </span>
              </div>

              {item.reward > 0 && item.type === 'lost' && (
                <Alert variant="info">
                  <strong>Reward: ${item.reward}</strong>
                </Alert>
              )}

              {item.status !== 'open' && (
                <Alert variant={item.status === 'resolved' ? 'success' : 'warning'}>
                  This item is currently {item.status}
                </Alert>
              )}
            </Card.Body>
          </Card>

          {matchedItem && (
            <Card className="mb-4 border-success">
              <Card.Header className="bg-success text-white">
                <h4 className="mb-0">Potential Match Found!</h4>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    {matchedItem.images && matchedItem.images.length > 0 ? (
                      <img
                        src={`${API_URL}/uploads/${matchedItem.images[0]}`}
                        alt="Matched item"
                        className="img-fluid rounded"
                      />
                    ) : (
                      <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '150px' }}>
                        <p className="text-muted">No Image</p>
                      </div>
                    )}
                  </Col>
                  <Col md={8}>
                    <h5>{matchedItem.title}</h5>
                    <p>{matchedItem.description.substring(0, 100)}...</p>
                    <div className="d-flex justify-content-between">
                      <Badge bg={matchedItem.type === 'lost' ? 'danger' : 'success'}>
                        {matchedItem.type === 'lost' ? 'Lost' : 'Found'}
                      </Badge>
                      <span className="text-muted">
                        {formatDate(matchedItem.date)}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Link to={`/items/${matchedItem._id}`} className="btn btn-outline-success">
                        View Match Details
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {item.location.coordinates && item.location.coordinates.length === 2 && (
            <Card className="mb-4">
              <Card.Header>
                <h4 className="mb-0">Location</h4>
              </Card.Header>
              <Card.Body>
                <div style={{ height: '300px' }}>
                  <MapContainer 
                    center={[item.location.coordinates[1], item.location.coordinates[0]]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <Marker position={[item.location.coordinates[1], item.location.coordinates[0]]}>
                      <Popup>
                        {item.title} <br />
                        {item.location.formattedAddress}
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Contact Information</h4>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaUser className="me-2 text-primary" />
                <span>{item.user.name}</span>
              </div>

              {isAuthenticated ? (
                <>
                  <div className="d-flex align-items-center mb-3">
                    <FaEnvelope className="me-2 text-primary" />
                    <span>{item.user.email}</span>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <FaPhone className="me-2 text-primary" />
                    <span>{item.user.phone}</span>
                  </div>
                </>
              ) : (
                <Alert variant="info">
                  Please <Link to="/login">log in</Link> to see contact information
                </Alert>
              )}
            </Card.Body>
          </Card>

          {item.type === 'found' && (
            <>
              {canClaim ? (
                <Card className="mb-4 bg-light">
                  <Card.Body className="text-center">
                    <h4>Is this your item?</h4>
                    <p>If you believe this is your lost item, you can submit a claim with proof of ownership.</p>
                    <Link to={`/items/${id}/claim`} className="btn btn-success btn-lg">
                      Submit a Claim
                    </Link>
                  </Card.Body>
                </Card>
              ) : isOwner && (
                <Card className="mb-4 bg-light">
                  <Card.Body className="text-center">
                    <p>You posted this item. Others can now claim it if it's theirs.</p>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ItemDetail;
