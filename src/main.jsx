import React from "react";
import ReactDOM from "react-dom/client";


// // Import CSS của các thư viện
// import 'antd/dist/reset.css'; // Ant Design
// import 'react-toastify/dist/ReactToastify.css'; // React Toastify
// import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap (nếu dùng)

import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
