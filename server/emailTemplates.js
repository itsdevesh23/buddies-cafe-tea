export const generateCustomerReceipt = (orderData) => {
  let baseSubtotal = 0;
  let totalGst = 0;
  orderData.items?.forEach(item => {
    const gstRate = (item.sub_total && item.gst) ? (item.gst / item.sub_total) : 0;
    const basePrice = item.price / (1 + gstRate);
    const gstAmt = item.price - basePrice;
    baseSubtotal += basePrice * item.quantity;
    totalGst += gstAmt * item.quantity;
  });

  const itemsHtml = orderData.items.map(item => {
    const gstRate = (item.sub_total && item.gst) ? (item.gst / item.sub_total) : 0;
    const basePrice = item.price / (1 + gstRate);
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.name} x ${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${Math.round(basePrice * item.quantity)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
      <div style="background: #1e293b; padding: 20px; text-align: center;">
        <h1 style="color: #4ade80; margin: 0;">Buddies Cafe</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="margin-top: 0;">Thank you for your order!</h2>
        <p>Hi ${orderData.shippingInfo.firstName},</p>
        <p>We've received your order <strong>#${orderData.orderId}</strong> and are getting it ready. Here are the details:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f8fafc; text-align: left;">
              <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Item</th>
              <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 10px; font-weight: bold; text-align: right;">Subtotal:</td>
              <td style="padding: 10px; text-align: right;">₹${Math.round(baseSubtotal)}</td>
            </tr>
            ${totalGst > 0 ? `
            <tr>
              <td style="padding: 10px; color: #64748b; text-align: right;">CGST:</td>
              <td style="padding: 10px; color: #64748b; text-align: right;">₹${(totalGst / 2).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; color: #64748b; text-align: right;">SGST:</td>
              <td style="padding: 10px; color: #64748b; text-align: right;">₹${(totalGst / 2).toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px; font-weight: bold; text-align: right;">Total:</td>
              <td style="padding: 10px; font-weight: bold; text-align: right; color: #4ade80; font-size: 1.1em;">₹${orderData.total}</td>
            </tr>
          </tfoot>
        </table>
        
        <h3>Shipping Address:</h3>
        <p style="background: #f8fafc; padding: 15px; border-radius: 4px; border: 1px solid #e2e8f0;">
          ${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}<br>
          ${orderData.shippingInfo.address}<br>
          ${orderData.shippingInfo.city}, ${orderData.shippingInfo.state} - ${orderData.shippingInfo.pinCode}
        </p>
        
        <p>If you have any questions, reply to this email or contact us at <a href="mailto:support@buddiescafe.com">support@buddiescafe.com</a>.</p>
        <p>Cheers,<br>The Buddies Cafe Team</p>
      </div>
    </div>
  `;
};

export const generateAdminAlert = (orderData) => {
  let baseSubtotal = 0;
  let totalGst = 0;
  orderData.items?.forEach(item => {
    const gstRate = (item.sub_total && item.gst) ? (item.gst / item.sub_total) : 0;
    const basePrice = item.price / (1 + gstRate);
    const gstAmt = item.price - basePrice;
    baseSubtotal += basePrice * item.quantity;
    totalGst += gstAmt * item.quantity;
  });

  const itemsHtml = orderData.items.map(item => {
    const gstRate = (item.sub_total && item.gst) ? (item.gst / item.sub_total) : 0;
    const basePrice = item.price / (1 + gstRate);
    return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.name} x ${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${Math.round(basePrice * item.quantity)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>New Order Received! 🚀</h2>
      <p>A new order (<strong>#${orderData.orderId}</strong>) was just placed for <strong>₹${orderData.total}</strong>.</p>
      
      <h3>Customer Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${orderData.shippingInfo.firstName} ${orderData.shippingInfo.lastName}</li>
        <li><strong>Email:</strong> ${orderData.shippingInfo.email}</li>
        <li><strong>Phone:</strong> ${orderData.shippingInfo.phone}</li>
      </ul>
      
      <h3>Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f8fafc; text-align: left;">
            <th style="padding: 8px; border-bottom: 2px solid #cbd5e1;">Item</th>
            <th style="padding: 8px; border-bottom: 2px solid #cbd5e1; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 8px; font-weight: bold; text-align: right;">Subtotal:</td>
            <td style="padding: 8px; text-align: right;">₹${Math.round(baseSubtotal)}</td>
          </tr>
          ${totalGst > 0 ? `
          <tr>
            <td style="padding: 8px; color: #64748b; text-align: right;">CGST:</td>
            <td style="padding: 8px; color: #64748b; text-align: right;">₹${(totalGst / 2).toFixed(2)}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #64748b; text-align: right;">SGST:</td>
            <td style="padding: 8px; color: #64748b; text-align: right;">₹${(totalGst / 2).toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px; font-weight: bold; text-align: right;">Total:</td>
            <td style="padding: 8px; font-weight: bold; text-align: right; color: #4ade80;">₹${orderData.total}</td>
          </tr>
        </tfoot>
      </table>
      
      <p>Check your <a href="https://buddies-cafe-tea.vercel.app/admin">Admin Dashboard</a> for full details and to process shipping.</p>
    </div>
  `;
};

export const generateBookingAlert = (bookingData) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h2>New Reservation Request! 📅</h2>
      <p>You have received a new booking request for a <strong>${bookingData.experience_type === 'tasting' ? 'Private Tasting' : 'Cafe Table'}</strong>.</p>
      
      <h3>Booking Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${bookingData.full_name}</li>
        <li><strong>Email:</strong> ${bookingData.email}</li>
        <li><strong>Phone:</strong> ${bookingData.phone}</li>
        <li><strong>Date:</strong> ${bookingData.date}</li>
        <li><strong>Time:</strong> ${bookingData.time}</li>
        <li><strong>Guests:</strong> ${bookingData.guests}</li>
      </ul>
      
      ${bookingData.special_requests ? `<h3>Special Requests:</h3><p><em>"${bookingData.special_requests}"</em></p>` : ''}
      
      <p>Check your <a href="http://localhost:5173/admin">Admin Dashboard</a> to confirm or cancel this booking.</p>
    </div>
  `;
};

export const generateBookingConfirmedEmail = (bookingData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
      <div style="background: #1e293b; padding: 20px; text-align: center;">
        <h1 style="color: #4ade80; margin: 0;">Buddies Cafe</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="margin-top: 0; color: #1e293b;">Reservation Confirmed! 🎉</h2>
        <p>Hi ${bookingData.full_name},</p>
        <p>Great news! Your table at Buddies Cafe has been officially confirmed. We can't wait to host you.</p>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Booking Details</h3>
          <p><strong>Experience:</strong> ${bookingData.experience_type === 'tasting' ? 'Private Tasting Session' : 'Cafe Table'}</p>
          <p><strong>Date:</strong> ${new Date(bookingData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Time:</strong> ${bookingData.time}</p>
          <p><strong>Guests:</strong> ${bookingData.guests} People</p>
        </div>
        
        <p>If you need to make any changes to your reservation, please reply to this email or call us.</p>
        <p>See you soon,<br><strong>The Buddies Cafe Team</strong></p>
      </div>
    </div>
  `;
};

export const generateBookingCancelledEmail = (bookingData) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
      <div style="background: #1e293b; padding: 20px; text-align: center;">
        <h1 style="color: #4ade80; margin: 0;">Buddies Cafe</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="margin-top: 0; color: #1e293b;">Reservation Update</h2>
        <p>Hi ${bookingData.full_name},</p>
        <p>We're very sorry, but we are unable to accommodate your reservation request for <strong>${new Date(bookingData.date).toLocaleDateString()}</strong> at <strong>${bookingData.time}</strong>.</p>
        
        <p>We are likely fully booked during that time or hosting a private event. We would love to host you on another day, so please feel free to make a new request on our website!</p>
        
        <p>If you have any questions, reply to this email or contact us directly.</p>
        <p>Warm regards,<br><strong>The Buddies Cafe Team</strong></p>
      </div>
    </div>
  `;
};

export const generateOrderCancellationEmail = (orderData) => {
  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.name} x ${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;">
      <div style="background: #1e293b; padding: 20px; text-align: center;">
        <h1 style="color: #4ade80; margin: 0;">Buddies Cafe</h1>
      </div>
      <div style="padding: 20px;">
        <h2 style="margin-top: 0; color: #ef4444;">Order Cancelled</h2>
        <p>Hi ${orderData.shippingInfo.firstName},</p>
        <p>We are writing to inform you that your order <strong>#${orderData.orderId}</strong> has been cancelled.</p>
        <p>If you have already been charged for this order, a full refund will be initiated immediately and should reflect in your original payment method shortly.</p>
        
        <h3>Cancelled Items:</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f8fafc; text-align: left;">
              <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Item</th>
              <th style="padding: 10px; border-bottom: 2px solid #cbd5e1; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 10px; font-weight: bold; text-align: right;">Total:</td>
              <td style="padding: 10px; font-weight: bold; text-align: right; color: #ef4444; font-size: 1.1em;">₹${orderData.total}</td>
            </tr>
          </tfoot>
        </table>
        
        <p>We apologize for any inconvenience this may have caused. If you have any questions or concerns, please reply to this email or contact us at <a href="mailto:support@buddiescafe.com">support@buddiescafe.com</a>.</p>
        <p>Warm regards,<br><strong>The Buddies Cafe Team</strong></p>
      </div>
    </div>
  `;
};
