import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import RoleSidebarLayout from '../components/RoleSidebarLayout';

const ResourceAvailabilityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:8080/api/resources/${id}/availability`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailability(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch resource availability');
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [id]);

  const content = (() => {
    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading availability data...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;
    if (!availability) return null;

    return (
      <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h2 style={{ color: '#333', marginBottom: '30px' }}>Resource Availability</h2>
        
        <div style={{ fontSize: '3rem', margin: '20px 0' }}>
          {availability.available ? (
            <div style={{ color: '#28a745' }}>
              Available ✅
            </div>
          ) : (
            <div style={{ color: '#dc3545' }}>
              Not Available ❌
            </div>
          )}
        </div>

        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: `5px solid ${availability.available ? '#28a745' : '#dc3545'}` }}>
          <h4 style={{ marginTop: '0', color: '#555' }}>Diagnostic Reason:</h4>
          <p style={{ fontSize: '1.1rem', color: '#444', lineHeight: '1.5' }}>
            {availability.reason}
          </p>
        </div>

        <button 
          onClick={() => navigate(`/resources/${id}`)}
          style={{ 
            marginTop: '40px', 
            padding: '10px 20px', 
            cursor: 'pointer', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        >
          Back to Details
        </button>
      </div>
    );
  })();

  return <RoleSidebarLayout>{content}</RoleSidebarLayout>;
};

export default ResourceAvailabilityPage;