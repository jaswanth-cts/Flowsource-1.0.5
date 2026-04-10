import React, { Suspense } from "react";
import withErrorBoundary from "./Components/ErrorBoundary";
import Footer from "./Components/Footer";

 const App1 = React.lazy(() => import("app1/App"));
  
// Note that error boundary wont trap error in development mode
const App1WithErrorBoundary = withErrorBoundary(App1);

const App = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <App1WithErrorBoundary /> 
      </Suspense>
      <Footer />
    </div>
  );
};

export default App;