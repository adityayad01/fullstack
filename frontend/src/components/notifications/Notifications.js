import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ListGroup, Badge, Button, Alert } from 'react-bootstrap';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { API_URL } from '../../utils/constants';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/notifications`);
      setNotifications(res.data.data);
    } catch (err) {
      setError('Error fetching notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/api/notifications/${id}`);
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, read: true } : notification
      ));
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Error updating notification');
      console.error(err);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      await axios.put(`${API_URL}/api/notifications/read-all`);
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Error updating notifications');
      console.error(err);
    }
  };
  
  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/notifications/${id}`);
      setNotifications(notifications.filter(notification => notification._id !== id));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Error deleting notification');
      console.error(err);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const getNotificationLink = (notification) => {
    if (notification.type === 'item_match') {
      return `/items/${notification.relatedItem}`;
    } else if (notification.type === 'claim_update') {
      return `/claims/${notification.relatedClaim}`;
    } else if (notification.type === 'new_claim') {
      return `/items/${notification.relatedItem}`;
    } else {
      return '#';
    }
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
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          Notifications
          {unreadCount > 0 && (
            <Badge bg="danger" className="ms-2">
              {unreadCount} new
            </Badge>
          )}
        </h1>
        {notifications.length > 0 && (
          <Button variant="outline-primary" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <Alert variant="info">
          <FaBell className="me-2" />
          You don't have any notifications yet.
        </Alert>
      ) : (
        <ListGroup>
          {notifications.map((notification) => (
            <ListGroup.Item 
              key={notification._id}
              className={`d-flex justify-content-between align-items-center ${!notification.read ? 'bg-light' : ''}`}
            >
              <div className="me-auto">
                <div className="d-flex align-items-center">
                  {!notification.read && (
                    <Badge bg="primary" className="me-2" pill>
                      New
                    </Badge>
                  )}
                  <div>
                    <Link to={getNotificationLink(notification)} className="text-decoration-none">
                      <div className="fw-bold">{notification.title}</div>
                    </Link>
                    <p className="mb-0">{notification.message}</p>
                    <small className="text-muted">{formatDate(notification.createdAt)}</small>
                  </div>
                </div>
              </div>
              <div className="d-flex">
                {!notification.read && (
                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    className="me-2"
                    onClick={() => markAsRead(notification._id)}
                  >
                    <FaCheck />
                  </Button>
                )}
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => deleteNotification(notification._id)}
                >
                  <FaTrash />
                </Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default Notifications;