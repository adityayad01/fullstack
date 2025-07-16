import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { toast } from 'react-toastify';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    date: '',
    reward: 0,
    location: {
      formattedAddress: '',
      city: '',
      state: '',
      zipcode: '',
      country: ''
    }
  });

  const [images, setImages] = useState([]);
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
      const item = res.data.data;
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        type: item.type,
        date: new Date(item.date).toISOString().split('T')[0],
        reward: item.reward || 0,
        location: {
          formattedAddress: item.location.formattedAddress || '',
          city: item.location.city || '',
          state: item.location.state || '',
          zipcode: item.location.zipcode || '',
          country: item.location.country || ''
        }
      });
    } catch (err) {
      setError('Error fetching item details');
      toast.error('Error fetching item details');
      console.error(err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      toast.warning('You can upload up to 5 images only');
      return;
    }
    setImages(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category || !formData.type || !formData.date) {
      return setError('Please fill in all required fields');
    }

    try {
      setLoading(true);
      setError('');

      const itemFormData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== 'location') {
          itemFormData.append(key, formData[key]);
        }
      });

      Object.keys(formData.location).forEach((key) => {
        itemFormData.append(`location[${key}]`, formData.location[key]);
      });

      if (images.length > 0) {
        images.forEach((image) => {
          itemFormData.append('images', image);
        });
      }

      await axios.put(`${API_URL}/api/items/${id}`, itemFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Item updated successfully');
      navigate(`/items/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating item');
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

  return (
    <div className="row justify-content-center">
      <div className="col-md-10">
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Edit Item</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
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
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        type="radio"
                        label="Lost"
                        name="type"
                        value="lost"
                        checked={formData.type === 'lost'}
                        onChange={handleChange}
                        required
                        disabled
                      />
                      <Form.Check
                        inline
                        type="radio"
                        label="Found"
                        name="type"
                        value="found"
                        checked={formData.type === 'found'}
                        onChange={handleChange}
                        required
                        disabled
                      />
                    </div>
                    <Form.Text className="text-muted">Type cannot be changed</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {formData.type === 'lost' && (
                <Form.Group className="mb-3">
                  <Form.Label>Reward Amount</Form.Label>
                  <Form.Control
                    type="number"
                    name="reward"
                    value={formData.reward}
                    onChange={handleChange}
                    min="0"
                  />
                  <Form.Text className="text-muted">Optional: Add reward for finder</Form.Text>
                </Form.Group>
              )}

              <h5 className="mt-4">Location Details</h5>
              <Form.Group className="mb-3">
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
                  <Form.Group className="mb-3">
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
                  <Form.Group className="mb-3">
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
                  <Form.Group className="mb-3">
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
                  <Form.Group className="mb-3">
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

              {/* ✅ Upload New Images */}
              <Form.Group className="mb-3">
                <Form.Label>Upload New Images (Max 5)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <Form.Text muted>You can update or add new images</Form.Text>
              </Form.Group>

              {/* ✅ Image Preview */}
              {images.length > 0 && (
                <div className="mb-3 d-flex flex-wrap gap-2">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(img)}
                      alt="Preview"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #ccc'
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="d-grid gap-2 mt-4">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Item'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default EditItem;
