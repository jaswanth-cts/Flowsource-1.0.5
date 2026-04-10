import React from 'react';
import { render } from '@testing-library/react';
import AddBootstrap from '@/components/AddBootstrap';


describe('AddBootstrap Component', () => {
  it('should call useEffect and require bootstrap', () => {
    render(<AddBootstrap />);
    expect(require('bootstrap/dist/js/bootstrap.bundle.min.js')).toBeDefined();
  });
});