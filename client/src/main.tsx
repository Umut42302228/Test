import { createRoot } from "react-dom/client";
import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

// Catch unhandled errors in development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('error', (e) => {
    console.error('Global error:', e.error || e.message);
  });
  
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
  });
}

const container = document.getElementById("root");

if (!container) {
  console.error("Could not find root element, check index.html");
} else {
  const root = createRoot(container);
  
  try {
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log("App rendered successfully");
  } catch (error) {
    console.error("Error rendering app:", error);
  }
}
