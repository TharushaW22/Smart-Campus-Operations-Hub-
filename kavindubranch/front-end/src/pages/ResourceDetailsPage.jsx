
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoleSidebarLayout from '../components/RoleSidebarLayout';

const ResourceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/resources/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResource(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch resource details');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/resources/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/resources');
      } catch (err) {
        console.error(err);
        alert('Failed to delete resource');
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!resource) return <div>Resource not found</div>;

  return (
    <RoleSidebarLayout>
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h2>Resource Details</h2>
        <div style={{ marginBottom: '15px' }}>
          <strong>Name:</strong> {resource.name}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Type:</strong> {resource.type}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Capacity:</strong> {resource.capacity}
        </div>
        <div style={{ marginBottom: '20px' }}>
          <strong>Status:</strong>{' '}
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: resource.status === 'Available' ? '#d4edda' : '#f8d7da',
            color: resource.status === 'Available' ? '#155724' : '#721c24'
          }}>
            {resource.status}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/resources')}
            style={{ padding: '8px 16px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            Back to List
          </button>
          <button 
            onClick={() => navigate(`/resources/${id}/availability`)}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Check Availability
          </button>
          <button 
            onClick={() => navigate(`/resources/edit/${id}`)}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Edit
          </button>
          <button 
            onClick={handleDelete}
            style={{ padding: '8px 16px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Delete
          </button>
        </div>
      </div>
    </RoleSidebarLayout>
  );
};

export default ResourceDetailsPage;


