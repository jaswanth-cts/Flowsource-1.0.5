import React, { Suspense } from "react";
import Chat from "@/components/Chat";

export default function Home() {
return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="container">Home Page</div>
      </Suspense>
      <Chat/>
    </div>
)
}