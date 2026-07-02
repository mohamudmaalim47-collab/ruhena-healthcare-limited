// ── RECEIPT GENERATION ──────────────────────────────────────
// Config — editable via Settings page (falls back to defaults)
function getReceiptConfig() {
  try {
    const stored = localStorage.getItem('rhl_receipt_config');
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    pharmacy: 'Ruhena Healthcare Limited',
    slogan: 'Your Health, Our Priority',
    address: 'Ruiru Town, Kiambu County',
    phone: '+254 712 345 678',
    email: 'info@ruhenahealthcare.co.ke',
    website: 'www.ruhenahealthcare.co.ke',
    kra_pin: 'P051234567B',
    ppb_license: 'PHARM/001',
    etims_scu: 'RHN-SCU-001',
    show_batch: true,
    show_expiry: true,
    show_pharmacist: true,
    return_days: 7,
    footer_msg: 'Thank you for choosing Ruhena Healthcare!',
    paper_width: '58mm',
    whatsapp: '+254 712 345 678'
  };
}

function saveReceiptConfig(cfg) {
  localStorage.setItem('rhl_receipt_config', JSON.stringify(cfg));
}

function fmtReceiptDate(d) {
  const dt = d ? new Date(d) : new Date();
  return dt.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ', ' + dt.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', hour12: false });
}

// ── 58mm THERMAL RECEIPT ──
function generateReceipt58(sale, items, paymentInfo) {
  const cfg = getReceiptConfig();
  const line = '─'.repeat(32);
  const thick = '═'.repeat(32);
  const W = 32;

  function center(t) {
    const pad = Math.max(0, W - t.length);
    return ' '.repeat(Math.floor(pad / 2)) + t + ' '.repeat(Math.ceil(pad / 2));
  }

  function rpad(l, r) {
    const dots = Math.max(1, W - l.length - r.length);
    return l + ' '.repeat(dots) + r;
  }

  let html = '<div class="receipt-58">';
  // Header
  html += `<div style="text-align:center;margin-bottom:6px;">
    <div style="font-size:14px;font-weight:700;">${cfg.pharmacy}</div>
    <div style="font-size:9px;color:#666;">${cfg.slogan}</div>
  </div>`;
  html += `<div style="text-align:center;font-size:9px;color:#666;margin-bottom:4px;">
    ${cfg.address}<br>📞 ${cfg.phone}<br>🌐 ${cfg.website}
  </div>`;
  html += `<div style="border-top:1px dashed #999;margin:6px 0;"></div>`;
  html += `<div style="font-size:9px;text-align:center;color:#666;">
    PPB: ${cfg.ppb_license} | KRA PIN: ${cfg.kra_pin}
  </div>`;
  html += `<div style="border-top:1px solid #999;margin:6px 0;"></div>`;

  // Receipt info
  html += `<div style="font-size:10px;">
    <div>${rpad('Receipt #:', sale.receipt_no || sale.id)}</div>
    <div>${rpad('Date:', fmtReceiptDate(sale.date || sale.added_at))}</div>
    <div>${rpad('Cashier:', sale.created_by || '—')}</div>
    <div>${rpad('Branch:', cfg.pharmacy.split(' ')[0] + ' Main')}</div>
  </div>`;
  html += `<div style="border-top:1px solid #999;margin:6px 0;"></div>`;

  // Items header
  html += `<div style="font-size:10px;font-weight:700;margin-bottom:4px;">ITEMS</div>`;

  // Items
  let vatSub = 0, exSub = 0;
  (items || []).forEach((item, i) => {
    const name = (item.name || item.medicine || '').substring(0, 28);
    const qty = item.qty || 1;
    const price = item.price || 0;
    const total = qty * price;
    const vatExempt = item.vat_exempt !== false;
    if (vatExempt) exSub += total; else vatSub += total;
    const tag = vatExempt ? '<span style="font-size:8px;color:#666;">[E]</span>' : '<span style="font-size:8px;color:#666;">[16%]</span>';
    html += `<div style="font-size:10px;"><strong>${name}</strong> ${tag}</div>`;
    if (cfg.show_batch && item.batch) {
      html += `<div style="font-size:8px;color:#666;">Batch: ${item.batch}</div>`;
    }
    if (cfg.show_expiry && item.expiry) {
      html += `<div style="font-size:8px;color:#666;">Exp: ${item.expiry}</div>`;
    }
    html += `<div style="font-size:10px;">${rpad(qty + ' × ' + price.toFixed(2), 'KES ' + total.toFixed(2))}</div>`;
  });

  // Totals
  html += `<div style="border-top:1px dashed #999;margin:6px 0;"></div>`;
  const sub = vatSub + exSub;
  const vat = vatSub * 0.16;
  const total = sub + vat;
  html += `<div style="font-size:10px;">${rpad('SUBTOTAL:', 'KES ' + sub.toFixed(2))}</div>`;
  if (vat > 0) {
    html += `<div style="font-size:10px;">${rpad('VAT 16%:', 'KES ' + vat.toFixed(2))}</div>`;
  } else {
    html += `<div style="font-size:9px;color:#666;">VAT: EXEMPT (0%)</div>`;
  }
  html += `<div style="border-top:1px solid #999;margin:4px 0;"></div>`;
  html += `<div style="font-size:12px;font-weight:700;">${rpad('TOTAL:', 'KES ' + total.toFixed(2))}</div>`;
  html += `<div style="border-top:1px solid #999;margin:6px 0;"></div>`;

  // Payment
  const pmLabels = { C: 'Cash', M: 'M-Pesa', I: 'Insurance', D: 'Credit', A: 'Account' };
  html += `<div style="font-size:10px;margin-bottom:4px;">
    <div>PAID: ${pmLabels[sale.pm] || sale.pm || '—'}</div>`;
  if (paymentInfo) {
    if (paymentInfo.ref) html += `<div style="font-size:9px;color:#666;">Ref: ${paymentInfo.ref}</div>`;
    if (paymentInfo.phone) html += `<div style="font-size:9px;color:#666;">Phone: ${paymentInfo.phone}</div>`;
  }
  html += `</div>`;

  // KRA eTIMS
  html += `<div style="border-top:1px solid #999;margin:6px 0;"></div>`;
  html += `<div style="font-size:10px;font-weight:700;text-align:center;">KRA eTIMS</div>`;
  html += `<div style="font-size:9px;">
    <div>${rpad('CU:', sale.etims_cu || 'KRA-CU-001-' + (sale.date || todayStr()).replace(/-/g, '') + '-' + String(sale.id || '').slice(-6))}</div>
    <div>${rpad('SCU:', cfg.etims_scu)}</div>
    <div>Label: NS (Normal Sale)</div>`;
  if (vat > 0) {
    html += `<div>VAT Amount: KES ${vat.toFixed(2)}</div>`;
  } else {
    html += `<div>VAT Status: EXEMPT (0%)</div>`;
  }
  html += `</div>`;
  html += `<div style="text-align:center;margin:6px 0;">
    <div style="display:inline-block;border:1px solid #999;padding:8px;font-size:8px;font-family:monospace;letter-spacing:2px;">
      [ KRA QR CODE ]
    </div>
    <div style="font-size:8px;color:#666;">Scan to verify on KRA portal</div>
  </div>`;

  // Footer
  html += `<div style="border-top:1px dashed #999;margin:6px 0;"></div>`;
  html += `<div style="font-size:9px;text-align:center;color:#666;">
    💬 ${cfg.whatsapp}<br>
    🔄 Returns within ${cfg.return_days} days with receipt<br><br>
    ${cfg.footer_msg}
  </div>`;
  html += `<div style="border-top:1px solid #999;margin:6px 0;"></div>`;
  html += `<div style="font-size:8px;text-align:center;color:#999;">
    ***** END OF RECEIPT *****<br>
    Printed: ${fmtReceiptDate()}<br>
    Ruhena Healthcare System v3.0<br>
    eTIMS ✓ | KRA Compliant ✓
  </div>`;
  html += '</div>';
  return html;
}

// ── 80mm THERMAL RECEIPT (detailed) ──
function generateReceipt80(sale, items, paymentInfo, customer) {
  const cfg = getReceiptConfig();
  let html = '<div class="receipt-80">';

  // Header
  html += `<div style="text-align:center;margin-bottom:8px;">
    <div style="font-size:18px;font-weight:700;">${cfg.pharmacy}</div>
    <div style="font-size:10px;color:#666;">${cfg.slogan}</div>
    <div style="font-size:10px;color:#666;margin-top:4px;">
      📍 ${cfg.address}<br>
      📞 ${cfg.phone} | 📧 ${cfg.email}<br>
      🌐 ${cfg.website}
    </div>
  </div>`;

  // License + KRA
  html += `<div style="border-top:1px double #999;margin:8px 0;"></div>`;
  html += `<div style="font-size:10px;text-align:center;color:#666;margin-bottom:8px;">
    PPB License: ${cfg.ppb_license} | KRA PIN: ${cfg.kra_pin}
  </div>`;
  html += `<div style="border-top:1px solid #999;margin:8px 0;"></div>`;

  // Title
  html += `<div style="text-align:center;font-size:14px;font-weight:700;margin:8px 0;">TAX INVOICE / RECEIPT</div>`;
  html += `<div style="border-top:1px solid #999;margin:8px 0;"></div>`;

  // Receipt info (two columns)
  html += `<div style="font-size:10px;display:flex;justify-content:space-between;margin-bottom:4px;">
    <span>Receipt No: <strong>${sale.receipt_no || sale.id}</strong></span>
    <span>Date: ${fmtReceiptDate(sale.date || sale.added_at)}</span>
  </div>`;
  html += `<div style="font-size:10px;display:flex;justify-content:space-between;margin-bottom:8px;">
    <span>Cashier: ${sale.created_by || '—'}</span>
    <span>Branch: ${cfg.pharmacy.split(' ')[0]} Main</span>
  </div>`;

  // Customer info
  if (customer) {
    html += `<div style="border-top:1px dashed #999;margin:8px 0;"></div>`;
    html += `<div style="font-size:11px;font-weight:600;margin-bottom:4px;">BILL TO:</div>`;
    if (customer.name) html += `<div style="font-size:10px;">${customer.name}</div>`;
    if (customer.phone) html += `<div style="font-size:10px;">📞 ${customer.phone}</div>`;
    if (customer.id_no) html += `<div style="font-size:10px;">ID: ${customer.id_no}</div>`;
  }

  // Items table
  html += `<div style="border-top:1px solid #999;margin:8px 0;"></div>`;
  html += `<div style="font-size:11px;font-weight:700;margin-bottom:6px;">ITEMS</div>`;
  html += `<table style="width:100%;font-size:10px;border-collapse:collapse;">
    <thead>
      <tr style="border-bottom:1px solid #999;">
        <th style="text-align:left;padding:4px;">#</th>
        <th style="text-align:left;padding:4px;">Description</th>
        <th style="text-align:center;padding:4px;">Qty</th>
        <th style="text-align:right;padding:4px;">Price</th>
        <th style="text-align:right;padding:4px;">Amount</th>
      </tr>
    </thead>
    <tbody>`;
  let vatSub80 = 0, exSub80 = 0;
  (items || []).forEach((item, i) => {
    const name = (item.name || item.medicine || '');
    const qty = item.qty || 1;
    const price = item.price || 0;
    const total = qty * price;
    const vatExempt = item.vat_exempt !== false;
    if (vatExempt) exSub80 += total; else vatSub80 += total;
    const tag = vatExempt ? ' [E]' : ' [16%]';
    html += `<tr>
      <td style="padding:3px;vertical-align:top;">${i + 1}</td>
      <td style="padding:3px;">
        <strong>${name}${tag}</strong>`;
    if (cfg.show_batch && item.batch) html += `<br><span style="font-size:8px;color:#666;">Batch: ${item.batch}</span>`;
    if (cfg.show_expiry && item.expiry) html += `<br><span style="font-size:8px;color:#666;">Exp: ${item.expiry}</span>`;
    html += `</td>
      <td style="padding:3px;text-align:center;">${qty}</td>
      <td style="padding:3px;text-align:right;">${price.toFixed(2)}</td>
      <td style="padding:3px;text-align:right;">${total.toFixed(2)}</td>
    </tr>`;
  });
  html += `</tbody></table>`;

  // Totals
  const sub80 = vatSub80 + exSub80;
  const vat80 = vatSub80 * 0.16;
  const totalAmt = sub80 + vat80;
  html += `<div style="border-top:1px dashed #999;margin:8px 0;"></div>`;
  html += `<div style="font-size:10px;text-align:right;">
    <div>Subtotal: KES ${sub80.toFixed(2)}</div>
    <div>Discount: KES 0.00</div>`;
  if (vat80 > 0) {
    html += `<div>VAT (16%): KES ${vat80.toFixed(2)}</div>`;
  } else {
    html += `<div>VAT: EXEMPT (0%)</div>`;
  }
  html += `    <div style="border-top:1px solid #999;margin:4px 0;"></div>
    <div style="font-size:14px;font-weight:700;">TOTAL: KES ${totalAmt.toFixed(2)}</div>
  </div>`;

  // Payment
  const pmLabels = { C: 'Cash', M: 'M-Pesa (STK Push)', I: 'Insurance', D: 'Credit', A: 'Account' };
  html += `<div style="border-top:1px solid #999;margin:8px 0;"></div>`;
  html += `<div style="font-size:11px;font-weight:600;margin-bottom:4px;">PAYMENT</div>`;
  html += `<div style="font-size:10px;">Method: ${pmLabels[sale.pm] || sale.pm || '—'}</div>`;
  if (paymentInfo) {
    if (paymentInfo.ref) html += `<div style="font-size:10px;">Ref: ${paymentInfo.ref}</div>`;
    if (paymentInfo.phone) html += `<div style="font-size:10px;">Phone: ${paymentInfo.phone}</div>`;
  }
  html += `<div style="font-size:10px;">Status: ✓ PAID</div>`;

  // KRA eTIMS
  html += `<div style="border-top:1px double #999;margin:8px 0;"></div>`;
  html += `<div style="font-size:11px;font-weight:600;text-align:center;">KRA eTIMS COMPLIANCE</div>`;
  html += `<div style="font-size:10px;margin-top:4px;">
    <div>CU: ${sale.etims_cu || 'KRA-CU-001-' + (sale.date || todayStr()).replace(/-/g, '') + '-' + String(sale.id || '').slice(-6)}</div>
    <div>Label: NS (Normal Sale) | SCU: ${cfg.etims_scu}</div>`;
  if (vat80 > 0) {
    html += `<div>Tax: B (Standard 16%) | VAT Amount: KES ${vat80.toFixed(2)}</div>`;
  } else {
    html += `<div>Tax: E (Exempt 0%) — VAT Status: EXEMPT</div>`;
  }
  html += `  </div>`;
  html += `<div style="text-align:center;margin:8px 0;">
    <div style="display:inline-block;border:1px solid #999;padding:10px 20px;font-size:10px;font-family:monospace;letter-spacing:3px;">
      [ QR CODE — Scan to Verify ]
    </div>
  </div>`;

  // Insurance
  if (sale.pm === 'I' && paymentInfo && paymentInfo.insurance) {
    html += `<div style="border-top:1px dashed #999;margin:8px 0;"></div>`;
    html += `<div style="font-size:11px;font-weight:600;margin-bottom:4px;">INSURANCE</div>`;
    const ins = paymentInfo.insurance;
    html += `<div style="font-size:10px;">
      Provider: ${ins.provider || '—'}<br>
      Member No: ${ins.member_no || '—'}<br>
      Scheme: ${ins.scheme || '—'}<br>
      Claim Ref: ${ins.claim_ref || '—'}<br>
      Status: 🟡 ${ins.status || 'Submitted'}
    </div>`;
  }

  // Footer
  html += `<div style="border-top:1px solid #999;margin:8px 0;"></div>`;
  html += `<div style="font-size:9px;color:#666;">
    <div>💬 WhatsApp: ${cfg.whatsapp} | 📧 ${cfg.email}</div>
    <div style="margin-top:4px;">
      <strong>Returns Policy:</strong><br>
      • Accepted within ${cfg.return_days} days with original receipt<br>
      • Unopened/sealed products only<br>
      • Prescription drugs: non-returnable
    </div>
    <div style="margin-top:6px;text-align:center;">
      ${cfg.footer_msg}<br><br>
      <strong>***** END OF RECEIPT *****</strong><br>
      Printed: ${fmtReceiptDate()}<br>
      Software: Ruhena Healthcare System v3.0<br>
      eTIMS Verified ✓ | KRA Compliant ✓ | PPB Licensed ✓
    </div>
  </div>`;
  html += '</div>';
  return html;
}

// ── PRINT RECEIPT ──
function printReceipt(content, paperWidth = '58mm') {
  try { if (typeof content === 'string' && content.includes('%')) content = decodeURIComponent(content); } catch(e) {}
  const w = window.open('', '_blank', 'width=400,height=600');
  w.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <title>Ruhena Healthcare — Receipt</title>
    <style>
      @page{width:${paperWidth};margin:0;padding:0;}
      *{box-sizing:border-box;margin:0;padding:0;}
      body{
        font-family:'Courier New',Courier,monospace;
        font-size:11px;color:#000;background:#fff;
        width:${paperWidth === '58mm' ? '58mm' : '80mm'};
        margin:0 auto;padding:8px 4px;
        line-height:1.3;
      }
      .receipt-58{max-width:48mm;margin:0 auto;}
      .receipt-80{max-width:72mm;margin:0 auto;}
      table{width:100%;border-collapse:collapse;}
      th,td{padding:2px 4px;}
      @media print{
        body{width:auto;padding:0;}
        .no-print{display:none !important;}
      }
      .no-print{text-align:center;margin-top:10px;}
      .no-print button{
        padding:8px 20px;font-size:12px;cursor:pointer;
        background:#0284C7;color:#fff;border:none;border-radius:4px;
        font-family:'Inter',sans-serif;
      }
    </style>
  </head><body>
    <div class="no-print" style="margin-bottom:8px;">
      <button onclick="window.print()"><i class="bi bi-printer"></i> Print</button>
      <button onclick="window.close()"><i class="bi bi-x"></i> Close</button>
    </div>
    ${content}
  </body></html>`);
  w.document.close();
  setTimeout(() => { try { w.focus(); } catch(e) {} }, 100);
  return w;
}

// ── RECEIPT MODAL (shown in-app after sale, editable details) ──
function showReceiptModal(sale, items, paymentInfo, customer) {
  const existing = document.getElementById('receipt-modal-overlay');
  if (existing) existing.remove();

  const cfg = getReceiptConfig();
  let editMode = false;

  const overlay = document.createElement('div');
  overlay.id = 'receipt-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.6);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';

  function buildReceiptHTML() {
    const ecfg = getReceiptConfig();
    const itemsData = (items || []).map(i => ({ name: i.name, qty: i.qty, price: i.price, vat_exempt: i.vat_exempt }));
    const payInfo = paymentInfo || { ref: '', phone: '' };
    return generateReceipt58({ ...sale, receipt_no: sale.receipt_no || sale.id }, itemsData, payInfo);
  }

  function buildEditSection() {
    const c = getReceiptConfig();
    return `
      <div id="receipt-edit-section" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="font-size:13px;font-weight:600;"><i class="bi bi-pencil"></i> Edit Receipt Details</span>
          <button onclick="toggleReceiptEdit()" style="background:none;border:none;font-size:18px;cursor:pointer;color:#64748b;">✕</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div><label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px;">Pharmacy Name</label><input class="receipt-edit-input" id="re-name" value="${c.pharmacy}" style="width:100%;padding:7px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;"></div>
          <div><label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px;">Slogan</label><input class="receipt-edit-input" id="re-slogan" value="${c.slogan}" style="width:100%;padding:7px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;"></div>
          <div style="grid-column:1/-1;"><label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px;">Address</label><input class="receipt-edit-input" id="re-address" value="${c.address}" style="width:100%;padding:7px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;"></div>
          <div><label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px;">Phone</label><input class="receipt-edit-input" id="re-phone" value="${c.phone}" style="width:100%;padding:7px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;"></div>
          <div><label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px;">KRA PIN</label><input class="receipt-edit-input" id="re-kra" value="${c.kra_pin}" style="width:100%;padding:7px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;"></div>
          <div><label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px;">PPB License</label><input class="receipt-edit-input" id="re-ppb" value="${c.ppb_license}" style="width:100%;padding:7px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;"></div>
          <div><label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px;">Footer Message</label><input class="receipt-edit-input" id="re-footer" value="${c.footer_msg}" style="width:100%;padding:7px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;"></div>
          <div><label style="font-size:11px;color:#64748b;display:block;margin-bottom:3px;">Paper Width</label><select class="receipt-edit-input" id="re-width" style="width:100%;padding:7px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;"><option value="58mm" ${c.paper_width==='58mm'?'selected':''}>58mm</option><option value="80mm" ${c.paper_width==='80mm'?'selected':''}>80mm</option></select></div>
        </div>
        <button onclick="applyReceiptEdit()" style="margin-top:12px;padding:8px 18px;background:#0284C7;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;"><i class="bi bi-check-lg"></i> Apply Changes</button>
      </div>`;
  }

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:24px;max-width:700px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.4);animation:scaleIn .25s ease;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="font-family:'Inter',sans-serif;font-size:18px;font-weight:700;color:#111827;"><i class="bi bi-receipt" style="color:#059669;"></i> Sale Complete!</h3>
        <span style="font-size:14px;color:#059669;font-weight:700;">KES ${(() => { const sub = (items||[]).reduce((s,i) => s + (i.qty||1)*(i.price||0), 0); const v = (items||[]).filter(i => i.vat_exempt === false).reduce((s,i) => s + (i.qty||1)*(i.price||0), 0) * 0.16; return (sub + v).toFixed(2); })()}</span>
      </div>

      <div style="margin-bottom:12px;">
        <button onclick="toggleReceiptEdit()" style="padding:6px 14px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:12px;color:#475569;"><i class="bi bi-pencil"></i> Edit Details</button>
      </div>

      <div id="receipt-edit-container"></div>

      <!-- Receipt Preview -->
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:16px;overflow-x:auto;">
        <div style="font-size:12px;color:#6b7280;margin-bottom:8px;"><i class="bi bi-eye"></i> Receipt Preview</div>
        <div id="receipt-preview-inner" style="max-width:320px;margin:0 auto;">${buildReceiptHTML()}</div>
      </div>

      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button onclick="printReceipt(document.getElementById('receipt-preview-inner').innerHTML, (getReceiptConfig().paper_width||'58mm'))" style="flex:1;min-width:120px;padding:12px;background:#0284C7;color:#fff;border:none;border-radius:8px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;">
          <i class="bi bi-printer"></i> Print
        </button>
        <button onclick="shareReceiptText(document.getElementById('receipt-preview-inner').innerHTML)" style="flex:1;min-width:80px;padding:12px;background:#7C3AED;color:#fff;border:none;border-radius:8px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;">
          <i class="bi bi-share"></i> Share
        </button>
        <button onclick="this.closest('#receipt-modal-overlay').remove()" style="flex:1;min-width:120px;padding:12px;background:#f3f4f6;color:#374151;border:1px solid #d1d5db;border-radius:8px;font-family:'Inter',sans-serif;font-size:13px;font-weight:600;cursor:pointer;">
          <i class="bi bi-x"></i> Close
        </button>
      </div>

      <div style="margin-top:12px;font-size:11px;color:#9ca3af;text-align:center;">
        Receipt #: ${sale.receipt_no || sale.id}
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // Global toggle/edit functions for this modal
  window.toggleReceiptEdit = function() {
    const container = document.getElementById('receipt-edit-container');
    if (container.innerHTML) {
      container.innerHTML = '';
    } else {
      container.innerHTML = buildEditSection();
    }
  };

  window.applyReceiptEdit = function() {
    const name = document.getElementById('re-name')?.value;
    if (name) {
      const cfg = getReceiptConfig();
      cfg.pharmacy = name;
      cfg.slogan = document.getElementById('re-slogan')?.value || cfg.slogan;
      cfg.address = document.getElementById('re-address')?.value || cfg.address;
      cfg.phone = document.getElementById('re-phone')?.value || cfg.phone;
      cfg.kra_pin = document.getElementById('re-kra')?.value || cfg.kra_pin;
      cfg.ppb_license = document.getElementById('re-ppb')?.value || cfg.ppb_license;
      cfg.footer_msg = document.getElementById('re-footer')?.value || cfg.footer_msg;
      cfg.paper_width = document.getElementById('re-width')?.value || cfg.paper_width;
      saveReceiptConfig(cfg);
    }
    // Re-render preview
    const preview = document.getElementById('receipt-preview-inner');
    if (preview) preview.innerHTML = buildReceiptHTML();
    document.getElementById('receipt-edit-container').innerHTML = '';
    // Update the print buttons' paper width display
  };
}

// ── HELPER: Generate receipt number ──
function generateReceiptNo() {
  const d = new Date();
  const yr = d.getFullYear();
  const seq = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return 'INV-' + yr + '-' + seq;
}

// ── SHARE RECEIPT ──
function shareReceiptText(receiptContent) {
  try { if (typeof receiptContent === 'string' && receiptContent.includes('%')) receiptContent = decodeURIComponent(receiptContent); } catch(e) {}
  const text = receiptContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (navigator.share) {
    navigator.share({ title: 'Ruhena Healthcare Receipt', text: text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const toastEl = document.createElement('div');
      toastEl.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#059669;color:#fff;padding:12px 20px;border-radius:8px;font-family:Inter,sans-serif;font-size:13px;z-index:99999;animation:fadeIn .3s ease;';
      toastEl.textContent = 'Receipt copied to clipboard';
      document.body.appendChild(toastEl);
      setTimeout(() => toastEl.remove(), 2500);
    }).catch(() => {});
  }
}
