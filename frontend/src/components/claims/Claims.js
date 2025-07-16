import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { toast } from 'react-toastify';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchClaims();
  }, []);
  
  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/claims`);
      setClaims(res.data.data);
    } catch (err) {
      setError('Error fetching claims');
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
  
  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }
  
  return (
    <div>
      <h1 className="mb-4">My Claims</h1>
      
      {claims.length === 0 ? (
        <Alert variant="info">
          You haven't made any claims yet. Browse the <Link to="/items">found items</Link> to claim something that belongs to you.
        </Alert>
      ) : (
        <Row>
          {claims.map((claim) => (
            <Col md={6} key={claim._id} className="mb-4">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-2">
                    <h5 className="card-title">{claim.item.title}</h5>
                    {getStatusBadge(claim.status)}
                  </div>
                  
                  <p className="text-muted mb-2">
                    Claimed on: {formatDate(claim.createdAt)}
                  </p>
                  
                  <p className="mb-3">
                    {claim.description.length > 100
                      ? `${claim.description.substring(0, 100)}...`
                      : claim.description}
                  </p>
                  
                  {claim.status === 'approved' && (
                    <Alert variant="success" className="mb-3">
                      <strong>Congratulations!</strong> Your claim has been approved. Please contact the finder to arrange pickup.
                    </Alert>
                  )}
                  
                  {claim.status === 'rejected' && claim.rejectionReason && (
                    <Alert variant="danger" className="mb-3">
                      <strong>Reason for rejection:</strong> {claim.rejectionReason}
                    </Alert>
                  )}
                  
                  <div className="d-flex justify-content-between">
                    <Link to={`/claims/${claim._id}`} className="btn btn-primary">
                      View Details
                    </Link>
                    <Link to={`/items/${claim.item._id}`} className="btn btn-outline-secondary">
                      View Item
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Claims;