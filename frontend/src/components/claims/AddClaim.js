import React, { useState, useEffect, useContext } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AddClaim = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    contactPreference: 'email',
    contactDetails: ''
  });
  
  const [proofImages, setProofImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchItem();
  }, [id]);
  
  const fetchItem = async () => {
    try {
      setFetchLoading(true);
      const res = await axios.get(`${API_URL}/api/items/${id}`);
      setItem(res.data.data);
      
      // Check if item can be claimed
      if (res.data.data.type !== 'found' || res.data.data.status !== 'open') {
        setError('This item cannot be claimed');
      }
      
      // Check if user is the owner
      if (res.data.data.user._id === user.id) {
        setError('You cannot claim your own item');
      }
    } catch (err) {
      setError('Error fetching item details');
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleImageChange = (e) => {
    setProofImages([...e.target.files]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description) {
      return setError('Please provide a description of your claim');
    }

    if (!formData.contactDetails) {
      return setError('Please provide your contact details');
    }
    
    if (proofImages.length === 0) {
      return setError('Please upload at least one proof image');
    }
    
    try {
      setLoading(true);
      setError('');
      
      const claimFormData = new FormData();
      claimFormData.append('description', formData.description);
      claimFormData.append('contactPreference', formData.contactPreference);
      claimFormData.append('contactDetails', formData.contactDetails);
      
      proofImages.forEach(image => {
        claimFormData.append('proofImages', image);
      });
      
      await axios.post(`${API_URL}/api/claims`, {
        itemId: id,
        ...formData
      });
      
      toast.success('Claim submitted successfully');
      navigate('/claims');
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting claim');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (!item) {
    return (
      <Alert variant="danger">
        Item not found
      </Alert>
    );
  }
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Claim Item</h2>
            
            <div className="mb-4">
              <h5>Item: {item.title}</h5>
              <p>Category: {item.category}</p>
              <p>Found on: {new Date(item.date).toLocaleDateString()}</p>
              <p>Location: {item.location.city}, {item.location.state}</p>
            </div>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Claim Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe why you believe this is your item. Include specific details about the item that only the owner would know."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Proof Images</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                />
                <Form.Text className="text-muted">
                  Upload images that prove your ownership (e.g., photos of you with the item, receipts, etc.)
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Preferred Contact Method</Form.Label>
                <Form.Select
                  name="contactPreference"
                  value={formData.contactPreference}
                  onChange={handleChange}
                >
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contact Details</Form.Label>
                <Form.Control
                  type="text"
                  name="contactDetails"
                  value={formData.contactDetails}
                  onChange={handleChange}
                  placeholder="Enter your contact email or phone"
                  required
                />
              </Form.Group>
              
              <div className="d-grid gap-2 mt-4">
                <Button variant="primary" type="submit" disabled={loading || error}>
                  {loading ? 'Submitting...' : 'Submit Claim'}
                </Button>
                <Link to={`/items/${id}`} className="btn btn-outline-secondary">
                  Cancel
                </Link>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AddClaim;
