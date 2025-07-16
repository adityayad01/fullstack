import React, { useState, useContext } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const AddItem = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    date: '',
    reward: 0,
    location: {
      formattedAddress: user?.location?.formattedAddress || '',
      city: user?.location?.city || '',
      state: user?.location?.state || '',
      zipcode: user?.location?.zipcode || '',
      country: user?.location?.country || ''
    }
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

      if (user?.location?.coordinates) {
        itemFormData.append('location[coordinates][0]', user.location.coordinates[0]);
        itemFormData.append('location[coordinates][1]', user.location.coordinates[1]);
        itemFormData.append('location[type]', 'Point');
      }

      if (images.length > 0) {
        images.forEach((image) => {
          itemFormData.append('images', image);
        });
      }

      const res = await axios.post(`${API_URL}/api/items`, itemFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Item added successfully');
      navigate(`/items/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-10">
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Report an Item</h2>
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
                      placeholder="Brief title describing the item"
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
                  placeholder="Detailed description of the item"
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
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date {formData.type === 'lost' ? 'Lost' : 'Found'}</Form.Label>
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

              {/* ✅ Image Upload */}
              <Form.Group className="mb-3">
                <Form.Label>Upload Images (Max 5)</Form.Label>
                <Form.Control
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <Form.Text muted>Only image files allowed. You can select up to 5.</Form.Text>
              </Form.Group>

              {/* ✅ Image Preview */}
              {images.length > 0 && (
                <div className="mb-3 d-flex flex-wrap gap-2">
                  {images.map((img, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(img)}
                      alt="Preview"
                      className="preview-img"
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
                  {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default AddItem;
