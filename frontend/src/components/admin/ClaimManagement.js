import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Form, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { toast } from 'react-toastify';

const ClaimManagement = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  
  const [showModal, setShowModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  useEffect(() => {
    fetchClaims();
  }, [filters]);
  
  const fetchClaims = async () => {
    try {
      setLoading(true);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.search) queryParams.append('search', filters.search);
      
      const res = await axios.get(`${API_URL}/api/admin/claims?${queryParams.toString()}`);
      setClaims(res.data.data);
    } catch (err) {
      setError('Error fetching claims');
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
  
  const handleOpenRejectModal = (claim) => {
    setSelectedClaim(claim);
    setRejectionReason('');
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedClaim(null);
  };
  
  const handleStatusChange = async (claimId, newStatus) => {
    try {
      if (newStatus === 'rejected' && !rejectionReason) {
        return toast.error('Please provide a reason for rejection');
      }
      
      await axios.put(`${API_URL}/api/admin/claims/${claimId}/status`, {
        status: newStatus,
        rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined
      });
      
      // Update claim in the list
      setClaims(claims.map(claim => 
        claim._id === claimId ? { 
          ...claim, 
          status: newStatus,
          rejectionReason: newStatus === 'rejected' ? rejectionReason : claim.rejectionReason
        } : claim
      ));
      
      toast.success('Claim status updated successfully');
      handleCloseModal();
    } catch (err) {
      toast.error('Error updating claim status');
      console.error(err);
    }
  };
  
  const handleDelete = async (claimId) => {
    if (window.confirm('Are you sure you want to delete this claim? This action cannot be undone.')) {
      try {
        await axios.delete(`${API_URL}/api/admin/claims/${claimId}`);
        
        // Remove claim from the list
        setClaims(claims.filter(claim => claim._id !== claimId));
        
        toast.success('Claim deleted successfully');
      } catch (err) {
        toast.error('Error deleting claim');
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
      <h1 className="mb-4">Claim Management</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by description or item title"
                />
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {claims.length === 0 ? (
        <Alert variant="info">
          No claims found matching your criteria.
        </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Item</th>
              <th>Claimant</th>
              <th>Date Claimed</th>
              <th>Status</th>
              <th>Contact Preference</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim._id}>
                <td>
                  <Link to={`/items/${claim.item._id}`} target="_blank">
                    {claim.item.title}
                  </Link>
                  <div>
                    <small>
                      <Badge bg={claim.item.type === 'lost' ? 'danger' : 'success'}>
                        {claim.item.type === 'lost' ? 'Lost' : 'Found'}
                      </Badge>
                    </small>
                  </div>
                </td>
                <td>
                  {claim.user?.name || 'Unknown'}
                  <div>
                    <small>{claim.user?.email}</small>
                  </div>
                </td>
                <td>{formatDate(claim.createdAt)}</td>
                <td>
                  <Badge bg={
                    claim.status === 'pending' ? 'warning' :
                    claim.status === 'approved' ? 'success' :
                    claim.status === 'rejected' ? 'danger' : 'secondary'
                  }>
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </Badge>
                  {claim.status === 'rejected' && claim.rejectionReason && (
                    <div>
                      <small className="text-muted">Reason: {claim.rejectionReason}</small>
                    </div>
                  )}
                </td>
                <td>{claim.contactPreference}</td>
                <td>
                  <div className="d-flex">
                    <Link 
                      to={`/claims/${claim._id}`} 
                      className="btn btn-primary btn-sm me-2"
                      target="_blank"
                    >
                      View
                    </Link>
                    {claim.status === 'pending' && (
                      <>
                        <Button 
                          variant="success" 
                          size="sm"
                          className="me-2"
                          onClick={() => handleStatusChange(claim._id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="warning" 
                          size="sm"
                          className="me-2"
                          onClick={() => handleOpenRejectModal(claim)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(claim._id)}
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
      
      {/* Reject Claim Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Claim</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please provide a reason for rejecting this claim:</p>
          <Form.Group>
            <Form.Control
              as="textarea"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Reason for rejection"
              required
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => handleStatusChange(selectedClaim?._id, 'rejected')}
            disabled={!rejectionReason}
          >
            Reject Claim
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ClaimManagement;