<<<<<<< HEAD
// This file is removed in favor of index.tsx to satisfy platform requirements.
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '../index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
=======
import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext"; // wrap app in ThemeProvider
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
>>>>>>> feature-landing-page
