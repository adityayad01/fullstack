import React, { useContext, useState } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    location: {
      formattedAddress: '',
      city: '',
      state: '',
      zipcode: '',
      country: ''
    }
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.passwordConfirm) {
    return setError('Passwords do not match');
  }

  try {
    setError('');
    setLoading(true);

    // Prepare location data
    const locationData = {
      type: 'Point',
      coordinates: [0, 0], // Default coordinates, would be set by geocoding in a real app
      formattedAddress: formData.location.formattedAddress,
      city: formData.location.city,
      state: formData.location.state,
      zipcode: formData.location.zipcode,
      country: formData.location.country
    };

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      location: locationData
    };

    const success = await register(userData);
    if (success) {
      navigate('/login'); // ✅ Redirect to login page after registration
    } else {
      setError('Failed to create an account');
    }
  } catch (err) {
    setError('Failed to create an account');
  }

  setLoading(false);
};


  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Sign Up</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group id="name" className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group id="email" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group id="password" className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group id="passwordConfirm" className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      name="passwordConfirm"
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group id="phone" className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required 
                />
              </Form.Group>
              
              <h4 className="mt-4">Location Information</h4>
              
              <Form.Group id="address" className="mb-3">
                <Form.Label>Address</Form.Label>
                <Form.Control 
                  type="text" 
                  name="location.formattedAddress"
                  value={formData.location.formattedAddress}
                  onChange={handleChange}
                  required 
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group id="city" className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="location.city"
                      value={formData.location.city}
                      onChange={handleChange}
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group id="state" className="mb-3">
                    <Form.Label>State</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="location.state"
                      value={formData.location.state}
                      onChange={handleChange}
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group id="zipcode" className="mb-3">
                    <Form.Label>Zip Code</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="location.zipcode"
                      value={formData.location.zipcode}
                      onChange={handleChange}
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group id="country" className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="location.country"
                      value={formData.location.country}
                      onChange={handleChange}
                      required 
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Button disabled={loading} className="w-100 mt-3" type="submit">
                Sign Up
              </Button>
            </Form>
          </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;