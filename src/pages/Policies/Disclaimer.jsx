import React from 'react';
import './Policies.css';

export default function Disclaimer() {
  return (
    <div className="policy-container">
      <div className="policy-header">
        <h1>Disclaimer</h1>
        <p>Last updated: October 2023</p>
      </div>

      <div className="policy-content">
        <h2>Copyright & Trademark</h2>
        <p>This website contains material protected under local, national and international Trademark and Copyright Laws and Treaties. Unauthorized reprint of this material is prohibited. No part of this website catalogue/book/document may be reproduced, reprinted, transferred or transmitted in any form of printing, electronic, photocopying, recording, or any other way or system without the written permission from the owners/authors.</p>
        <p>Trademark 2018, DANJOTEAS.com India, Coimbatore.</p>

        <h2>Health & Medical Disclaimer</h2>
        <div style={{ background: 'var(--bg-surface-alt)', padding: '1.5rem', borderRadius: '8px', borderLeft: '4px solid var(--primary-color)' }}>
          <p style={{ margin: 0 }}>
            <strong>Disclaimer:</strong> Any health statements have not been evaluated by the Food and Drug Administration or any statutory authority. The Products on the website are not intended to Diagnose, treat, and cure or prevent any diseases. Like fruits, vegetables and other nutritional foods, teas positive contribution to diet must be seen in the context of a general healthy lifestyle.
          </p>
        </div>
      </div>
    </div>
  );
}
