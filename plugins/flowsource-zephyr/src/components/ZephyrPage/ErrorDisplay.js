import React from 'react';
import Paper from '@mui/material/Paper';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';

const Spacer = () => <div className="mb-4" />; // Spacer component

const ErrorDisplay = ({ error }) => {
  return (
    <div className="card me-1 mb-1 mt-2">
      <div className="card-header">
        <h6 className="mb-0">Error</h6>
      </div>
      <div className="card-body">
        <div className="alert alert-danger mt-2 mb-2" role="alert" style={{ 'white-space': 'pre-wrap' }}>
          {error}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
