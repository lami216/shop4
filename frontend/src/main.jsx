import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import LanguageProvider from "./components/LanguageProvider.jsx";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
        <StrictMode>
                <LanguageProvider>
                        <BrowserRouter>
                                <AppErrorBoundary>
                                        <App />
                                </AppErrorBoundary>
                        </BrowserRouter>
                </LanguageProvider>
        </StrictMode>
);
