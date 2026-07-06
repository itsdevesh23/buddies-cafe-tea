import React from 'react';
import './Policies.css';

export default function ShippingPolicy() {
  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>Shipping & Delivery Policy</h1>
        <p>Last updated: October 2023</p>
      </div>

      <div className="policy-content">
        <h2>General Shipping Information</h2>
        <p>All Orders above Rs 4999/- shall be eligible for Free Delivery within India (select pin codes and billing value/subtotal order value after discount).</p>
        <p>Orders received before 12:00 AM IST (Indian Standard Time) usually ship out the same business day. Orders received after this time generally leave the next business day. We deliver within 3 – 7 working days. Please note that our International delivery partner, INDIA POST, DHL/FedEx do not deliver orders on weekends.</p>

        <h2>Important Notice (Octroi, Local Inward Taxes and Levies etc.)</h2>
        <p>In certain states/cities/zones, local authorities, state or municipal agencies may levy an additional amount as entry fee. We at DANJOTEAS.com work in a way that the clearance with different authorities and govt. agencies is smooth to ensure that the package reaches you as quickly as possible, but in these specific cases, the additional charge will have to be borne the customer.</p>
        
        <h2>Customs & International Shipping</h2>
        <p>It has come to our notice that the Customs Department in Italy, Costa-Rica and Czech Republic may have begun charging an additional amount as Custom Clearance fee. We at DANJOTEAS.com work with the customs clearance departments of different countries to ensure that the package reaches you as quickly as possible, but in these specific cases, the additional charge will have to be borne the customer.</p>
      </div>
    </div>
  );
}
