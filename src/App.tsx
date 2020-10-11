import React from "react";
import { Map } from "./Map";

import "./App.css";

function App() {
  return (
    <>
      <div>Real time asset tracking with WebSockets. Must connnect to ws://127.0.0.1:8000</div>

      <Map />
    </>
  );
}

export default App;
