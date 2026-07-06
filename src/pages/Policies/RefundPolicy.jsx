import React from 'react';
import './Policies.css';

export default function RefundPolicy() {
  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>Refund & Return Policy</h1>
        <p>Last updated: October 2023</p>
      </div>

      <div className="policy-content">
        <h2>Returns</h2>
        <p>Our policy lasts 7 days. If 7 days have gone by since your purchase, unfortunately we can’t offer you a refund or exchange.</p>
        <p>To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging. Several types of goods are exempt from being returned.</p>

        <h3>Additional non-returnable items:</h3>
        <ul>
          <li>Accessories</li>
          <li>Breakages on transport</li>
        </ul>
        <p>To complete your return, we require a receipt or proof of purchase. Please do not send your purchase back to the manufacturers, unless its been called for.</p>

        <h3>There are certain situations where only partial refunds are granted: (if applicable)</h3>
        <ul>
          <li>Any item not in its original condition, is damaged or missing parts for reasons not due to our error.</li>
          <li>Any item that is returned more than 7 days after delivery</li>
        </ul>

        <h2>Refunds (if applicable)</h2>
        <p>Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.</p>
        <p>If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.</p>

        <h3>Late or missing refunds (if applicable)</h3>
        <p>If you haven’t received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted. Next contact your bank. There is often some processing time before a refund is posted.</p>
        <p>If you’ve done all of this and you still have not received your refund yet, please contact us at <strong>buddiescafecbe@gmail.com</strong>.</p>

        <h2>Sale items (if applicable)</h2>
        <p>Only regular priced items may be refunded, unfortunately sale items cannot be refunded.</p>

        <h2>Exchanges (if applicable)</h2>
        <p>We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at <strong>buddiescafecbe@gmail.com</strong> and send your item to:</p>
        <div style={{ background: 'var(--bg-surface-alt)', padding: '1.5rem', borderRadius: '8px', margin: '1rem 0' }}>
          <strong>INFUSION, BUDDIES CAFE</strong><br/>
          RCTC Building, Garden Road,<br/>
          Ooty - 643001
        </div>

        <h2>Return Shipping</h2>
        <p>You will be responsible for paying for your own shipping costs for returning your item. Shipping costs are non-refundable. If you receive a refund, the cost of return shipping will be deducted from your refund.</p>
        <p>Depending on where you live, the time it may take for your exchanged product to reach you, may vary.</p>
        <p>If you are shipping an item over 4999 INR, you should consider using a trackable shipping service or purchasing shipping insurance. We don’t guarantee that we will receive your returned item.</p>
      </div>
    </div>
  );
}
