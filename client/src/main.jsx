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

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <MessageUnreadProvider>
            <NotificationProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  style: {
                    background: "var(--surface-1)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)",
                    backdropFilter: "blur(12px)",
                  },
                }}
              />
              <App />
            </NotificationProvider>
          </MessageUnreadProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
