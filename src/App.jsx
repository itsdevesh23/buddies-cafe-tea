import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop/Shop';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Tasting from './pages/Tasting/Tasting';
import KombuchaPage from './pages/Kombucha/KombuchaPage';
import HeritagePage from './pages/HeritagePage/HeritagePage';
import FounderPage from './pages/FounderPage/FounderPage';
import CafePage from './pages/CafePage/CafePage';
import GalleryPage from './pages/Gallery/GalleryPage';
import JournalPage from './pages/Journal/JournalPage';
import ArticlePage from './pages/Journal/ArticlePage';
import ContactPage from './pages/Contact/ContactPage';
import FAQPage from './pages/FAQ/FAQPage';
import ShippingPage from './pages/Shipping/ShippingPage';
import ShippingPolicy from './pages/Policies/ShippingPolicy';
import RefundPolicy from './pages/Policies/RefundPolicy';
import Disclaimer from './pages/Policies/Disclaimer';
import AccountPage from './pages/Account/AccountPage';
import BookingPage from './pages/Booking/BookingPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import UpdatePassword from './pages/UpdatePassword/UpdatePassword';
import BrewingGuidePage from './pages/BrewingGuidePage/BrewingGuidePage';

import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import OrderTracking from './pages/OrderTracking/OrderTracking';
import AdminDashboard from './pages/Admin/AdminDashboard';
import TermsAndConditions from './pages/Policies/TermsAndConditions';
import PrivacyPolicy from './pages/Policies/PrivacyPolicy';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <WishlistProvider>
            <CartProvider>
              <Toaster 
                position="top-center" 
                toastOptions={{
                  style: {
                    background: '#0f172a',
                    color: '#f8fafc',
                    border: '1px solid #4ade80',
                  },
                  success: {
                    iconTheme: {
                      primary: '#4ade80',
                      secondary: '#0f172a',
                    },
                  },
                }}
              />
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/tasting" element={<Tasting />} />
                  <Route path="/kombucha" element={<KombuchaPage />} />
                  <Route path="/heritage" element={<HeritagePage />} />
                  <Route path="/founder" element={<FounderPage />} />
                  <Route path="/cafe" element={<CafePage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/journal" element={<JournalPage />} />
                  <Route path="/journal/:slug" element={<ArticlePage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/shipping" element={<ShippingPage />} />
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
                  <Route path="/track-order" element={<OrderTracking />} />
                  <Route path="/tracking" element={<OrderTracking />} />
                  <Route path="/brewing-guide" element={<BrewingGuidePage />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/shipping" element={<ShippingPolicy />} />
                  <Route path="/refunds" element={<RefundPolicy />} />
                  <Route path="/disclaimer" element={<Disclaimer />} />
                </Route>
                
                {/* Admin Route - No Layout Header/Footer */}
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </CartProvider>
          </WishlistProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
