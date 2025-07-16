import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Badge, Row, Col, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { toast } from 'react-toastify';

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchClaim();
  }, [id]);
  
  const fetchClaim = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/claims/${id}`);
      setClaim(res.data.data);
    } catch (err) {
      setError('Error fetching claim details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'approved':
        return <Badge bg="success">Approved</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
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
  
  if (error || !claim) {
    return (
      <Alert variant="danger">
        {error || 'Claim not found'}
      </Alert>
    );
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Claim Details</h1>
        <Link to="/claims" className="btn btn-outline-secondary">
          Back to Claims
        </Link>
      </div>
      
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Claim for: {claim.item.title}</h4>
          {getStatusBadge(claim.status)}
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Submitted On:</strong> {formatDate(claim.createdAt)}</p>
              <p><strong>Item Category:</strong> {claim.item.category}</p>
              <p><strong>Item Found On:</strong> {formatDate(claim.item.date)}</p>
              <p><strong>Item Location:</strong> {claim.item.location.city}, {claim.item.location.state}</p>
              <p><strong>Contact Preference:</strong> {claim.contactPreference}</p>
            </Col>
            <Col md={6}>
              {claim.item.images && claim.item.images.length > 0 && (
                <img
                  src={`${API_URL}/uploads/${claim.item.images[0]}`}
                  alt="Item"
                  className="img-fluid rounded"
                  style={{ maxHeight: '200px' }}
                />
              )}
            </Col>
          </Row>
          
          <hr />
          
          <h5>Your Claim Description:</h5>
          <p>{claim.description}</p>
          
          <h5 className="mt-4">Proof Images:</h5>
          <Row className="mt-3">
            {claim.proofImages && claim.proofImages.length > 0 ? (
              claim.proofImages.map((image, index) => (
                <Col md={4} key={index} className="mb-3">
                  <img
                    src={`${API_URL}/uploads/proofs/${image}`}
                    alt={`Proof ${index + 1}`}
                    className="img-fluid rounded"
                    style={{ maxHeight: '150px' }}
                  />
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-muted">No proof images provided</p>
              </Col>
            )}
          </Row>
          
          {claim.status === 'approved' && (
            <Alert variant="success" className="mt-4">
              <h5>Congratulations!</h5>
              <p>Your claim has been approved. Please contact the finder to arrange pickup.</p>
              <p><strong>Finder Contact:</strong> {claim.item.user.email} / {claim.item.user.phone}</p>
            </Alert>
          )}
          
          {claim.status === 'rejected' && (
            <Alert variant="danger" className="mt-4">
              <h5>Claim Rejected</h5>
              {claim.rejectionReason ? (
                <p><strong>Reason:</strong> {claim.rejectionReason}</p>
              ) : (
                <p>Your claim has been rejected by the finder.</p>
              )}
            </Alert>
          )}
          
          {claim.status === 'pending' && (
            <Alert variant="info" className="mt-4">
              <h5>Claim Pending</h5>
              <p>Your claim is currently being reviewed by the finder. We'll notify you when there's an update.</p>
            </Alert>
          )}
        </Card.Body>
        <Card.Footer>
          <div className="d-flex justify-content-between">
            <Link to={`/items/${claim.item._id}`} className="btn btn-primary">
              View Item Details
            </Link>
            {claim.status === 'pending' && (
              <Button variant="outline-danger" onClick={() => {
                if (window.confirm('Are you sure you want to cancel this claim?')) {
                  // Add cancel claim functionality
                  toast.info('Claim cancellation is not implemented yet');
                }
              }}>
                Cancel Claim
              </Button>
            )}
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default ClaimDetail;