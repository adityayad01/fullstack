import React, { useContext } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaSearch, FaClipboardList, FaBell, FaHandshake } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext'; // ✅ Add this

const LandingPage = () => {
  const { isAuthenticated } = useContext(AuthContext); // ✅ Get auth status

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <div className="hero-section py-5 bg-primary text-white">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold">Lost Something?</h1>
              <h2 className="mb-4">We'll help you find it.</h2>
              <p className="lead mb-4">
                Our platform connects people who have lost items with those who have found them.
                Simple, secure, and effective.
              </p>
              <div className="d-flex gap-3">
                <Link to="/items">
                  <Button variant="light" size="lg">Browse Items</Button>
                </Link>

                {/* ✅ Conditionally show Sign Up if not logged in */}
                {!isAuthenticated && (
                  <Link to="/register">
                    <Button variant="outline-light" size="lg">Sign Up</Button>
                  </Link>
                )}
              </div>
            </Col>
            <Col md={6} className="text-center">
              <img 
                src="/images/hero-image.svg" 
                alt="Lost and Found" 
                className="img-fluid"
                style={{ maxHeight: '400px' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/500x400?text=Lost+and+Found';
                }}
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* How It Works Section */}
      <Container className="py-5">
        <h2 className="text-center mb-5">How It Works</h2>
        <Row>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center p-3">
              <div className="text-primary mb-3">
                <FaSearch size={50} />
              </div>
              <Card.Body>
                <Card.Title>Search</Card.Title>
                <Card.Text>
                  Browse through items that have been found or report what you've lost.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center p-3">
              <div className="text-primary mb-3">
                <FaClipboardList size={50} />
              </div>
              <Card.Body>
                <Card.Title>Claim</Card.Title>
                <Card.Text>
                  Submit a claim for items you recognize as yours with proof of ownership.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center p-3">
              <div className="text-primary mb-3">
                <FaBell size={50} />
              </div>
              <Card.Body>
                <Card.Title>Get Notified</Card.Title>
                <Card.Text>
                  Receive notifications when someone claims your found item or when similar items are posted.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-4">
            <Card className="h-100 text-center p-3">
              <div className="text-primary mb-3">
                <FaHandshake size={50} />
              </div>
              <Card.Body>
                <Card.Title>Reconnect</Card.Title>
                <Card.Text>
                  Arrange safe meetups to retrieve your belongings and reconnect with your items.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Statistics Section */}
      <div className="bg-light py-5">
        <Container>
          <h2 className="text-center mb-5">Making a Difference</h2>
          <Row className="text-center">
            <Col md={4} className="mb-4">
              <h2 className="display-4 fw-bold text-primary">500+</h2>
              <p className="lead">Items Found</p>
            </Col>
            <Col md={4} className="mb-4">
              <h2 className="display-4 fw-bold text-primary">300+</h2>
              <p className="lead">Happy Users</p>
            </Col>
            <Col md={4} className="mb-4">
              <h2 className="display-4 fw-bold text-primary">95%</h2>
              <p className="lead">Success Rate</p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CTA Section */}
      <Container className="py-5 text-center">
        <h2 className="mb-4">Ready to find what you've lost?</h2>
        <p className="lead mb-4">Join our community today and increase your chances of recovering your belongings.</p>
        <div className="d-flex justify-content-center gap-3">
          {/* ✅ Hide CTA Sign Up if authenticated */}
          {!isAuthenticated && (
            <Link to="/register">
              <Button variant="primary" size="lg">Sign Up Now</Button>
            </Link>
          )}
          <Link to="/items">
            <Button variant="outline-primary" size="lg">Browse Items</Button>
          </Link>
        </div>
      </Container>

      {/* Custom CSS for the landing page */}
      <style jsx>{`
        .landing-page .hero-section {
          background: linear-gradient(135deg, #4a6bff 0%, #2541b2 100%);
        }
        
        .landing-page .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-radius: 10px;
        }
        
        .landing-page .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
