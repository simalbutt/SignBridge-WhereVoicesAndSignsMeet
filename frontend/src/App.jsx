import React, { useEffect } from "react";
import { testBackend } from "./api/test";

function App() {
  useEffect(() => {
    testBackend();
  }, []);

  return <h1>SignBridge Frontend Connected</h1>;
}

export default App;
