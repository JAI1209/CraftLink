import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { MessageUnreadProvider } from "./context/MessageUnreadContext";
import { ThemeProvider } from "./context/ThemeContext";

fetch("https://craftlink-ka01.onrender.com/");

ReactDOM.createRoot(document.getElementById("root")).render(




ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <MessageUnreadProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "rgba(20,16,12,0.95)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    backdropFilter: "blur(12px)",
                  },
                }}
              />
              <App />
            </MessageUnreadProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);