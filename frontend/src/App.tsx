import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { WorkOrderPage } from './pages/WorkOrderPage';
import { CheckoutPage }  from './pages/CheckoutPage';
import { ReceiptPage }   from './pages/ReceiptPage';
import { HistoryPage }   from './pages/HistoryPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <Routes>
            <Route path="/"               element={<WorkOrderPage />} />
            <Route path="/checkout"       element={<CheckoutPage />} />
            <Route path="/receipt/:id"    element={<ReceiptPage />} />
            <Route path="/history"        element={<HistoryPage />} />
          </Routes>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
