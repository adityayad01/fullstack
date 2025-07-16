import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaUsers, FaBoxOpen, FaClipboardList, FaBell } from 'react-icons/fa';

const Dashboard = () => {
  return (
    <div>
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <Row>
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Body>
              <FaUsers className="display-4 text-primary mb-3" />
              <Card.Title>User Management</Card.Title>
              <Card.Text>
                Manage users, view profiles, and handle user-related issues.
              </Card.Text>
              <Link to="/admin/users" className="btn btn-primary">
                Manage Users
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Body>
              <FaBoxOpen className="display-4 text-success mb-3" />
              <Card.Title>Item Management</Card.Title>
              <Card.Text>
                Review and manage all lost and found items in the system.
              </Card.Text>
              <Link to="/admin/items" className="btn btn-success">
                Manage Items
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Body>
              <FaClipboardList className="display-4 text-warning mb-3" />
              <Card.Title>Claim Management</Card.Title>
              <Card.Text>
                Review and manage all claims submitted by users.
              </Card.Text>
              <Link to="/admin/claims" className="btn btn-warning">
                Manage Claims
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-4">
          <Card className="h-100 text-center">
            <Card.Body>
              <FaBell className="display-4 text-danger mb-3" />
              <Card.Title>Notifications</Card.Title>
              <Card.Text>
                Send system-wide notifications to all users.
              </Card.Text>
              <Button variant="danger" disabled>
                Coming Soon
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Card className="mt-4">
        <Card.Header>
          <h4 className="mb-0">System Statistics</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3} className="text-center">
              <h2 className="text-primary">0</h2>
              <p>Total Users</p>
            </Col>
            <Col md={3} className="text-center">
              <h2 className="text-success">0</h2>
              <p>Active Items</p>
            </Col>
            <Col md={3} className="text-center">
              <h2 className="text-warning">0</h2>
              <p>Pending Claims</p>
            </Col>
            <Col md={3} className="text-center">
              <h2 className="text-info">0</h2>
              <p>Successful Matches</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;