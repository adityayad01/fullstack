import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5003';

const AddClaim = () => {
  const { id: itemId } = useParams();
  const navigate = useNavigate();
  
  const [description, setDescription] = useState('');
  const [contactPreference, setContactPreference] = useState('email');
  const [contactDetails, setContactDetails] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('Checking...');
  
  // Check if server is responding
  useEffect(() => {
    const checkServer = async () => {
      try {
        // Try to access a known endpoint
        const response = await fetch(`${API_URL}/api/auth/test`);
        if (response.ok) {
          setServerStatus('Server is responding');
        } else {
          setServerStatus(`Server responded with status: ${response.status}`);
        }
        
        // Try to access the claims endpoint
        const claimsResponse = await fetch(`${API_URL}/api/claims/ping`);
        if (claimsResponse.ok) {
          setServerStatus(prev => `${prev}, Claims endpoint is responding`);
        } else {
          setServerStatus(prev => `${prev}, Claims endpoint responded with status: ${claimsResponse.status}`);
        }
      } catch (err) {
        setServerStatus(`Error connecting to server: ${err.message}`);
      }
    };
    
    checkServer();
  }, []);
  
  // In your handleSubmit function, replace the fetch calls with axios
  // In your handleSubmit function, ensure you're sending the correct data
  // In your handleSubmit function, add better error handling
  // In your handleSubmit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('You must be logged in to submit a claim');
        setLoading(false);
        return;
      }
      
      // Validate required fields on the client side
      if (!itemId) {
        setError('Item ID is missing. Please try accessing this page from an item details page.');
        setLoading(false);
        return;
      }
      
      if (!description) {
        setError('Please provide a description of your claim');
        setLoading(false);
        return;
      }
      
      if (!contactDetails) {
        setError('Please provide your contact details');
        setLoading(false);
        return;
      }
      
      // Log the data being sent
      console.log('Making request to:', `${API_URL}/api/claims`);
      console.log('With data:', {
        itemId,
        description,
        contactPreference,
        contactDetails
      });
      
      // Create axios instance with base URL and default headers
      const api = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Try a test ping first to verify connectivity
      try {
        const pingResponse = await api.get('/api/claims/ping');
        console.log('Ping response:', pingResponse.status, pingResponse.data);
      } catch (pingErr) {
        console.error('Ping error:', pingErr.response?.status, pingErr.response?.data);
      }
      
      // Try POST to claims endpoint with explicit data formatting
      const requestData = {
        itemId: String(itemId),
        description: String(description),
        contactPreference: String(contactPreference),
        contactDetails: String(contactDetails)
      };
      
      console.log('Sending formatted data:', requestData);
      
      const response = await api.post('/api/claims', requestData);
      
      console.log('Claims POST response:', response.status, response.data);
      
      // Redirect to the item page with a success message
      navigate(`/items/${itemId}?claimSubmitted=true`);
      return;
    } catch (err) {
      console.error('Claims POST error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        config: err.config ? {
          url: err.config.url,
          method: err.config.method,
          headers: {
            ...err.config.headers,
            Authorization: err.config.headers?.Authorization ? 'Bearer [REDACTED]' : 'No Auth'
          },
          data: JSON.parse(err.config.data || '{}')
        } : 'No config'
      });
      
      // Display a more detailed error message
      if (err.response?.data?.missingFields) {
        setError(`Missing required fields: ${err.response.data.missingFields.join(', ')}`);
      } else if (err.response?.data?.error) {
        setError(`Server error: ${err.response.data.error}`);
      } else {
        setError(`Request failed with status ${err.response?.status || 'unknown'}: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mt-4">
      <h2>Submit a Claim</h2>
      <Alert variant="info">{serverStatus}</Alert>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe why you believe this item belongs to you..."
            required
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Preferred Contact Method</Form.Label>
          <Form.Select
            value={contactPreference}
            onChange={(e) => setContactPreference(e.target.value)}
            required
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="in-person">In-person</option>
          </Form.Select>
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Contact Details</Form.Label>
          <Form.Control
            type="text"
            value={contactDetails}
            onChange={(e) => setContactDetails(e.target.value)}
            placeholder="Your email, phone number, or meeting preferences..."
            required
          />
        </Form.Group>
        
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Claim'}
        </Button>
      </Form>
    </div>
  );
};

export default AddClaim;