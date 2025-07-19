import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Analytics } from "@vercel/analytics/react"; // ✅ Tambahan untuk Analytics

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div>
      <App />
      <Analytics /> {/* ✅ Analytics aktif untuk seluruh aplikasi */}
    </div>
  </React.StrictMode>
);
