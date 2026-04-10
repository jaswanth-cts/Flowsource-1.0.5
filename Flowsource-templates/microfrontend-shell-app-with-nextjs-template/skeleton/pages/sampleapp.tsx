import React, { Suspense } from "react";
import { withErrorBoundary } from "../components/ErrorBoundary";

const App1 = withErrorBoundary(React.lazy(() => import("app1/App")));

export default function Page() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
          <App1 />
      </Suspense>
  );
}
