import React from "react";

import Navbar from "./Components/Navbar";
import CardList from "./Components/CardList";

const list = [
  {
    "id":1,
    "title":"Card 1",
    "body": "Sample card which contains Simple Text Body"
  },
  {
    "id":2,
    "title":"Card 2",
    "body":"Sample card which contains Simple Text Body",    
  }
]

function App() {
  return (
    <div>
    <Navbar organizationName={""}/>
    <CardList list={list}/>
    </div>
  )
}
export default App;