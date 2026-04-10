"use client"

import { useEffect } from 'react';

function AddBootsrap() {
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  return null;
}

export default AddBootsrap;