# Phase 5: Complete Checkout & Order Tracking System

The goal of this phase is to make the E-Commerce flow fully functional by linking the cart to the checkout, implementing a mock UPI payment flow, and building a dynamic order tracking system.

## Proposed Changes

### Component Changes

#### [MODIFY] [Cart.jsx](file:///C:/Users/deves/OneDrive/Documents/Tea/src/components/Cart/Cart.jsx)
- Connect the "Proceed to Checkout" button to navigate to the `/checkout` route.
- Ensure the cart slide-out closes when navigation occurs.

#### [MODIFY] [CheckoutPage.jsx](file:///C:/Users/deves/OneDrive/Documents/Tea/src/pages/Checkout/CheckoutPage.jsx)
- Wire up local state to capture shipping details (Name, Address).
- **UPI Flow**: Add an interactive UPI ID input field (e.g., `user@okicici`) or a mock QR code display when the UPI payment method is selected.
- Update the "Place Order" button to:
  - Generate a random Order ID (e.g., `BC-84920`).
  - Save the order details and initial "Processing" status to `localStorage`.
  - Trigger `clearCart()` from the context.
  - Redirect the user to `/order-confirmation/:orderId`.

#### [NEW] [OrderConfirmation.jsx](file:///C:/Users/deves/OneDrive/Documents/Tea/src/pages/OrderConfirmation/OrderConfirmation.jsx)
- A beautifully designed success page thanking the user for their purchase.
- Display the Order ID and a summary of what they bought.
- Include a prominent "Track Your Order" button.

#### [NEW] [OrderTracking.jsx](file:///C:/Users/deves/OneDrive/Documents/Tea/src/pages/OrderTracking/OrderTracking.jsx)
- A dedicated tracking page (accessible at `/track-order`).
- An input field where users can manually enter their Order ID to track it.
- A dynamic, cinematic visual timeline showing the status:
  - Order Placed
  - Processing
  - Shipped
  - Out for Delivery
  - Delivered

#### [MODIFY] [App.jsx](file:///C:/Users/deves/OneDrive/Documents/Tea/src/App.jsx)
- Add routes for `/order-confirmation/:id` and `/track-order`.

## Open Questions
- Do you want a mock UPI QR Code image to scan (for visual flair), or just a simple text input field for the user to type their UPI ID?
- Where should we place the "Track Order" link in the global navigation? (e.g., in the Footer, or in the User Account dropdown menu?)
