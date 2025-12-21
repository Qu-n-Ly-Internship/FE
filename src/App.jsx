// src/App.jsx
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNotification } from "./hooks/useNotification";
import AppRouter from "./router/AppRouter";

export default function App() {
  // Kích hoạt notification listener
  useNotification();

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        closeOnUnmount={false}
      />

      
      {/* Router của bạn */}
      <AppRouter />
    </>
  );
}