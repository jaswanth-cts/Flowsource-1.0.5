import React, { useState, useEffect } from 'react';
import BookingRequests from './BookingRequests';
import EnvironmentReservation from './EnvironmentReservation';

function TabsPage() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookingData, setBookingData] = useState(null);


  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <div style={{ display: 'flex', marginBottom: '-4rem' }}>
        <div
          style={{
            padding: '10px 5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: activeTab === 'bookings' ? 'rgb(46, 48, 142)' : '#333',
          }}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings
          {activeTab === 'bookings' && (
            <div
              style={{
                height: '2px',
                width: '46px',
                backgroundColor: 'rgb(46, 48, 142)',
                marginTop: '5px',
                marginLeft: '8px',
                marginRight: 'auto',
              }}
            ></div>
          )}
        </div>
        {/* Vertical Line */}
        <div
          style={{
            width: '2px',
            height: '30px',
            backgroundColor: 'rgb(46, 48, 142)',
            margin: '4px 10px',
          }}
        ></div>
        <div
          style={{
            padding: '10px 3px',
            cursor: 'pointer',
            fontWeight: 'bold',
            color: activeTab === 'maintenance' ? 'rgb(46, 48, 142)' : '#333',
          }}
          onClick={() => setActiveTab('maintenance')}
        >
          Maintenance Window
          {activeTab === 'maintenance' && (
            <div
              style={{
                height: '2px',
                width: '115px',
                backgroundColor: 'rgb(46, 48, 142)',
                marginTop: '5px',
                marginLeft: '14px',
                marginRight: 'auto',
              }}
            ></div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        {activeTab === 'bookings' && <BookingRequests setBookingData={setBookingData} />}
        {activeTab === 'maintenance' && <EnvironmentReservation />}
      </div>
    </div>
  );
};

export default TabsPage;