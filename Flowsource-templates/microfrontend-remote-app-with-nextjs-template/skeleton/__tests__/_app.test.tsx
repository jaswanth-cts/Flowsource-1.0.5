import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '@/pages/_app';
import { HashRouter as Router } from 'react-router-dom';

describe('App Component', () => {
  it('should render the component with given props', () => {
    const Component = () => <Router><div>Test Component</div></Router>;
    const pageProps = {};
    const router = {} as any; // Mock router object
    const { getByText } = render(<App Component={Component} pageProps={pageProps} router={router} />);
    expect(getByText('Test Component')).toBeInTheDocument();
  });

});
