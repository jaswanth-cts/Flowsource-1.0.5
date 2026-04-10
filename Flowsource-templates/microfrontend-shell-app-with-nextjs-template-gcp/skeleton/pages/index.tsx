import React, { Suspense } from "react";

export default function Home() {
return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
      Home Page
      </Suspense>
    </div>
)
}