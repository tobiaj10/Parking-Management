import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { format } from "date-fns";

// Extend Date prototype for formatting
declare global {
  interface Date {
    toFormattedString(): string;
  }
}

// Add custom formatting method to Date prototype
Date.prototype.toFormattedString = function() {
  return format(this, "h:mm a - MMMM d, yyyy");
};

createRoot(document.getElementById("root")!).render(<App />);
