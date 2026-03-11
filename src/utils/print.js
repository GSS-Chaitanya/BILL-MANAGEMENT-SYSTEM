import { fmt, escHtml } from './format.js';

/* ─────────────────────────────────────────────
   CONFIG  —  edit these once for your store
───────────────────────────────────────────── */
var UPI_ID      = 'srinivasahardwares@upi';   // your UPI ID
var UPI_NAME    = 'Srinivasa Hardwares';       // payee name (no spaces > 20 chars recommended)
var UPI_BANK    = 'UPI / Any App';             // displayed label
var GSTIN       = '37XXXXX0000X1ZX';
var PAN         = 'ABCDE1234F';
var PHONE       = '+91 98765 43210';
var CITY        = 'Visakhapatnam, Andhra Pradesh';

/* ─────────────────────────────────────────────
   Filename: Bill_0042_11-03-2025_02-45-PM.pdf
───────────────────────────────────────────── */
export function buildPdfFilename(b) {
    var d   = b.date ? new Date(b.date) : new Date();
    var dd  = String(d.getDate()).padStart(2, '0');
    var mm  = String(d.getMonth() + 1).padStart(2, '0');
    var yy  = d.getFullYear();
    var h   = d.getHours();
    var min = String(d.getMinutes()).padStart(2, '0');
    var ap  = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    var inv = String(b.invNum ?? 0).padStart(4, '0');
    return 'Bill_' + inv + '_' + dd + '-' + mm + '-' + yy + '_' +
           String(h).padStart(2, '0') + '-' + min + '-' + ap + '.pdf';
}

/* ─────────────────────────────────────────────
   Build UPI deep-link string
   Format: upi://pay?pa=ID&pn=NAME&am=AMOUNT&cu=INR&tn=NOTE
───────────────────────────────────────────── */
function buildUpiString(total, billNo) {
    var note = 'Bill%20%23' + billNo + '%20-%20' + encodeURIComponent(UPI_NAME);
    return 'upi://pay?pa=' + encodeURIComponent(UPI_ID) +
           '&pn=' + encodeURIComponent(UPI_NAME) +
           '&am=' + total.toFixed(2) +
           '&cu=INR' +
           '&tn=' + note;
}

/* ─────────────────────────────────────────────
   Amount in words
───────────────────────────────────────────── */
function numToWords(n) {
    if (n === 0) return 'Zero';
    var ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
        'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    var tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
    var whole = Math.floor(n);
    var paise = Math.round((n - whole) * 100);
    var w = '';
    if (whole >= 10000000) w += ones[Math.floor(whole/10000000)] + ' Crore ';
    var lakh = Math.floor((whole % 10000000) / 100000);
    if (lakh) w += (lakh < 20 ? ones[lakh] : tens[Math.floor(lakh/10)] + ' ' + ones[lakh%10]) + ' Lakh ';
    var thou = Math.floor((whole % 100000) / 1000);
    if (thou) w += (thou < 20 ? ones[thou] : tens[Math.floor(thou/10)] + ' ' + ones[thou%10]) + ' Thousand ';
    var hund = Math.floor((whole % 1000) / 100);
    if (hund) w += ones[hund] + ' Hundred ';
    var rem = whole % 100;
    if (rem) { if (w) w += 'and '; w += rem < 20 ? ones[rem] : tens[Math.floor(rem/10)] + ' ' + ones[rem%10]; }
    w = w.trim() + ' Rupees';
    if (paise) w += ' and ' + (paise < 20 ? ones[paise] : tens[Math.floor(paise/10)] + ' ' + ones[paise%10]) + ' Paise';
    return w + ' Only';
}

/* ─────────────────────────────────────────────
   HTML builder — MNC Professional + UPI QR
───────────────────────────────────────────── */
export function buildBillHTML(b) {
    var d          = new Date(b.date);
    var dateStr    = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    var timeStr    = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    var disc       = b.discount || 0;
    var billNo     = String(b.invNum).padStart(4, '0');
    var seqNum     = b.seqNum || '';
    var totalItems = b.items.reduce(function(s,i){ return s + i.qty; }, 0);
    var filename   = buildPdfFilename(b);
    var upiStr     = buildUpiString(b.total, billNo);

    /* item rows */
    var itemRows = b.items.map(function(i, idx) {
        return '<tr class="item-row">' +
            '<td class="td-sl">' + (idx + 1) + '</td>' +
            '<td class="td-desc">' +
                '<span class="item-name">' + escHtml(i.name) + '</span>' +
                (i.sku ? '<span class="item-sku">SKU: ' + escHtml(i.sku) + '</span>' : '') +
                (i.cat ? '<span class="item-cat">' + escHtml(i.cat) + '</span>' : '') +
            '</td>' +
            '<td class="td-num">' + i.qty + '</td>' +
            '<td class="td-num">&#8377;' + Number(i.unitPrice).toFixed(2) + '</td>' +
            '<td class="td-num td-total">&#8377;' + (i.unitPrice * i.qty).toFixed(2) + '</td>' +
        '</tr>';
    }).join('');

    /* summary rows */
    var taxRows = '';
    if (disc) {
        taxRows += '<tr class="summary-row">' +
            '<td class="s-label">Discount (' + disc + '&#37;)</td>' +
            '<td class="s-value neg">&#8722;&#8377;' + fmt(b.subtotal * disc / 100) + '</td>' +
        '</tr>';
    }
    if (b.gstRate) {
        taxRows += '<tr class="summary-row">' +
            '<td class="s-label">GST (' + b.gstRate + '&#37;)</td>' +
            '<td class="s-value">&#8377;' + fmt(b.gst) + '</td>' +
        '</tr>';
    }

    return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
'<meta charset="UTF-8">\n' +
'<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
'<title>' + filename.replace('.pdf','') + '</title>\n' +

/* Google Fonts */
'<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">\n' +

/* QRCode.js from CDN — generates QR as <canvas> client-side */
'<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>\n' +

'<style>\n' +
'*{margin:0;padding:0;box-sizing:border-box}\n' +
'@page{size:A4 portrait;margin:0}\n' +
'html,body{width:210mm;min-height:297mm;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'body{font-family:"DM Sans","Helvetica Neue",Helvetica,Arial,sans-serif;font-size:9.5pt;color:#111827;line-height:1.5}\n' +
':root{--brand:#111827;--accent:#4338ca;--accent2:#6366f1;--accent-light:#eef2ff;--border:#e5e7eb;--muted:#6b7280;--soft:#f9fafb;--green:#16a34a;--green-bg:#f0fdf4}\n' +
'.page{display:flex;flex-direction:column;min-height:297mm}\n' +

/* header */
'.header-band{background:var(--brand);padding:26pt 36pt 20pt;display:flex;justify-content:space-between;align-items:flex-start;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.company-logo{display:flex;align-items:center;gap:10pt;margin-bottom:12pt}\n' +
'.logo-mark{width:34pt;height:34pt;background:var(--accent);border-radius:8pt;display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.logo-mark svg{width:18pt;height:18pt;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}\n' +
'.company-name{font-size:15pt;font-weight:700;color:#fff;letter-spacing:-0.3pt;line-height:1.1}\n' +
'.company-tagline{font-size:6.5pt;color:rgba(255,255,255,0.4);letter-spacing:2pt;text-transform:uppercase;margin-top:2pt}\n' +
'.company-address{font-size:7.5pt;color:rgba(255,255,255,0.45);line-height:1.8;margin-top:4pt}\n' +
'.hb-right{text-align:right}\n' +
'.inv-label{font-size:6.5pt;font-weight:600;color:rgba(255,255,255,0.4);letter-spacing:2.5pt;text-transform:uppercase;margin-bottom:4pt}\n' +
'.inv-number{font-family:"DM Mono",monospace;font-size:24pt;font-weight:500;color:#fff;letter-spacing:-0.5pt;line-height:1}\n' +
'.inv-status{display:inline-block;margin-top:8pt;padding:3pt 10pt;background:rgba(99,102,241,0.2);border:1pt solid rgba(99,102,241,0.45);border-radius:20pt;font-size:6.5pt;font-weight:600;color:#a5b4fc;letter-spacing:1.5pt;text-transform:uppercase;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.accent-stripe{height:3pt;background:linear-gradient(90deg,#4338ca,#818cf8,#c7d2fe,#e0e7ff);-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +

/* meta strip */
'.meta-strip{display:flex;background:var(--soft);border-bottom:1pt solid var(--border);padding:9pt 36pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.meta-cell{flex:1;padding:0 12pt 0 0;border-right:1pt solid var(--border)}\n' +
'.meta-cell:last-child{border-right:none;padding-right:0;padding-left:12pt;flex:none;text-align:right}\n' +
'.meta-cell:first-child{padding-left:0}\n' +
'.meta-key{font-size:6pt;font-weight:600;color:var(--muted);letter-spacing:1.5pt;text-transform:uppercase;margin-bottom:2pt}\n' +
'.meta-val{font-family:"DM Mono",monospace;font-size:8.5pt;font-weight:500;color:var(--brand)}\n' +
'.meta-val.accent{color:var(--accent)}\n' +

/* body */
'.body{flex:1;padding:20pt 36pt 16pt}\n' +

/* parties */
'.parties{display:flex;gap:0;margin-bottom:18pt;border:1pt solid var(--border);border-radius:6pt;overflow:hidden}\n' +
'.party{flex:1;padding:12pt 16pt}\n' +
'.party:first-child{border-right:1pt solid var(--border)}\n' +
'.party-label{font-size:6pt;font-weight:700;color:var(--muted);letter-spacing:2pt;text-transform:uppercase;margin-bottom:5pt;display:flex;align-items:center;gap:5pt}\n' +
'.party-label::before{content:"";display:block;width:12pt;height:1.5pt;background:var(--accent);-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.party-name{font-size:11pt;font-weight:700;color:var(--brand);margin-bottom:3pt;line-height:1.2}\n' +
'.party-detail{font-size:8pt;color:var(--muted);line-height:1.7}\n' +
'.bill-type-badge{display:inline-block;margin-top:5pt;padding:2pt 7pt;border-radius:3pt;font-size:6.5pt;font-weight:700;letter-spacing:1pt;text-transform:uppercase;background:var(--accent-light);color:var(--accent);-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +

/* table */
'.table-wrap{border:1pt solid var(--border);border-radius:6pt;overflow:hidden;margin-bottom:0}\n' +
'.inv-table{width:100%;border-collapse:collapse}\n' +
'.inv-table thead{background:var(--brand);-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.inv-table thead th{padding:7pt 11pt;font-size:6.5pt;font-weight:600;color:rgba(255,255,255,0.7);letter-spacing:1.5pt;text-transform:uppercase;text-align:left}\n' +
'.inv-table thead th.td-num{text-align:right}\n' +
'.inv-table tbody tr.item-row{border-bottom:1pt solid var(--border)}\n' +
'.inv-table tbody tr.item-row:last-child{border-bottom:none}\n' +
'.inv-table tbody tr.item-row:nth-child(even){background:#fafafa;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.td-sl{width:20pt;padding:8pt 11pt;font-family:"DM Mono",monospace;font-size:7.5pt;color:var(--muted);text-align:center;vertical-align:top}\n' +
'.td-desc{padding:8pt 11pt;vertical-align:top}\n' +
'.td-num{padding:8pt 11pt;text-align:right;vertical-align:top;font-family:"DM Mono",monospace;font-size:8pt;white-space:nowrap}\n' +
'.td-total{font-weight:600;color:var(--brand)}\n' +
'.item-name{display:block;font-size:8.5pt;font-weight:600;color:var(--brand);line-height:1.3}\n' +
'.item-sku{display:block;font-size:7pt;color:var(--muted);font-family:"DM Mono",monospace;margin-top:1pt}\n' +
'.item-cat{display:inline-block;margin-top:2pt;padding:1pt 4pt;border-radius:2pt;font-size:6pt;font-weight:700;letter-spacing:0.5pt;text-transform:uppercase;background:var(--green-bg);color:var(--green);-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +

/* ── bottom section: summary LEFT, QR RIGHT ── */
'.bottom-section{display:flex;gap:0;border:1pt solid var(--border);border-top:none;border-radius:0 0 6pt 6pt;overflow:hidden}\n' +

/* summary */
'.summary-side{flex:1;border-right:1pt solid var(--border)}\n' +
'.summary-table{width:100%;border-collapse:collapse}\n' +
'.summary-row td{padding:6pt 14pt;border-top:1pt solid var(--border)}\n' +
'.summary-row:first-child td{border-top:none}\n' +
'.s-label{font-size:8.5pt;color:var(--muted)}\n' +
'.s-value{font-family:"DM Mono",monospace;font-size:8.5pt;text-align:right;font-weight:500;color:var(--brand)}\n' +
'.s-value.neg{color:#dc2626}\n' +
'.summary-subtotal td{background:var(--soft);-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.summary-total{background:var(--brand);-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.summary-total .s-label{font-size:9.5pt;font-weight:700;color:#fff}\n' +
'.summary-total .s-value{font-size:11pt;font-weight:700;color:#fff}\n' +

/* ── UPI QR panel ── */
'.qr-panel{width:148pt;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14pt 12pt;background:#fafffe;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.qr-title{font-size:6.5pt;font-weight:700;letter-spacing:1.5pt;text-transform:uppercase;color:var(--green);margin-bottom:8pt;display:flex;align-items:center;gap:4pt}\n' +
'.qr-title::before{content:"";display:block;width:8pt;height:8pt;border-radius:50%;background:var(--green);-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'#qr-canvas{border-radius:4pt;overflow:hidden}\n' +
'.qr-amount{margin-top:6pt;font-family:"DM Mono",monospace;font-size:11pt;font-weight:700;color:var(--brand)}\n' +
'.qr-upi-id{margin-top:2pt;font-family:"DM Mono",monospace;font-size:6.5pt;color:var(--muted);word-break:break-all;text-align:center}\n' +
'.qr-apps{margin-top:6pt;font-size:6.5pt;color:var(--muted);text-align:center;line-height:1.6}\n' +
'.qr-apps strong{color:var(--green)}\n' +
'.qr-note{margin-top:5pt;font-size:6pt;color:#9ca3af;text-align:center;font-style:italic}\n' +

/* words & notes */
'.words-block{margin-top:14pt;padding:9pt 13pt;background:var(--soft);border:1pt solid var(--border);border-radius:5pt;font-size:8pt;color:var(--muted)}\n' +
'.words-block strong{color:var(--brand);font-weight:600}\n' +
'.words-text{margin-top:2pt;font-style:italic;line-height:1.6;color:#374151}\n' +
'.notes-block{margin-top:9pt;padding:9pt 13pt;border-left:3pt solid var(--accent);background:var(--accent-light);border-radius:0 4pt 4pt 0;font-size:8pt;color:#374151;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.notes-block strong{color:var(--accent);font-weight:600;text-transform:uppercase;font-size:6.5pt;letter-spacing:1pt}\n' +

/* signatures */
'.sig-row{display:flex;gap:0;margin-top:18pt;border:1pt solid var(--border);border-radius:5pt;overflow:hidden}\n' +
'.sig-cell{flex:1;padding:30pt 16pt 10pt;border-right:1pt solid var(--border);text-align:center}\n' +
'.sig-cell:last-child{border-right:none}\n' +
'.sig-label{font-size:6.5pt;font-weight:600;color:var(--muted);letter-spacing:1.5pt;text-transform:uppercase}\n' +

/* footer */
'.footer{background:var(--soft);border-top:1pt solid var(--border);padding:10pt 36pt;display:flex;justify-content:space-between;align-items:center;margin-top:auto;-webkit-print-color-adjust:exact;print-color-adjust:exact}\n' +
'.footer-left{font-size:7.5pt;color:var(--muted);line-height:1.7}\n' +
'.footer-left strong{color:var(--brand)}\n' +
'.footer-right{text-align:right;font-size:7pt;color:#9ca3af;font-family:"DM Mono",monospace;line-height:1.7}\n' +

'@media print{.page{min-height:0}}\n' +
'</style>\n' +
'</head>\n' +
'<body>\n' +
'<div class="page">\n' +

/* ══ HEADER ══ */
'<div class="header-band">\n' +
'  <div>\n' +
'    <div class="company-logo">\n' +
'      <div class="logo-mark"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg></div>\n' +
'      <div>\n' +
'        <div class="company-name">Srinivasa Hardwares</div>\n' +
'        <div class="company-tagline">Hardware &nbsp;&bull;&nbsp; Electrical &nbsp;&bull;&nbsp; Plumbing</div>\n' +
'      </div>\n' +
'    </div>\n' +
'    <div class="company-address">\n' +
'      GSTIN: ' + GSTIN + ' &nbsp;&bull;&nbsp; PAN: ' + PAN + '<br>\n' +
'      ' + CITY + ' &nbsp;&bull;&nbsp; ' + PHONE + '\n' +
'    </div>\n' +
'  </div>\n' +
'  <div class="hb-right">\n' +
'    <div class="inv-label">Tax Invoice</div>\n' +
'    <div class="inv-number">#' + billNo + '</div>\n' +
'    <div class="inv-status">&#9679;&nbsp; ' + escHtml(b.billType || 'Retail') + '</div>\n' +
'  </div>\n' +
'</div>\n' +
'<div class="accent-stripe"></div>\n' +

/* ══ META STRIP ══ */
'<div class="meta-strip">\n' +
'  <div class="meta-cell"><div class="meta-key">Invoice No.</div><div class="meta-val accent">#' + billNo + '</div></div>\n' +
'  <div class="meta-cell"><div class="meta-key">Date</div><div class="meta-val">' + dateStr + '</div></div>\n' +
'  <div class="meta-cell"><div class="meta-key">Time</div><div class="meta-val">' + timeStr + '</div></div>\n' +
'  <div class="meta-cell"><div class="meta-key">Items / Units</div><div class="meta-val">' + b.items.length + ' &nbsp;/&nbsp; ' + totalItems + '</div></div>\n' +
(seqNum ? '  <div class="meta-cell"><div class="meta-key">Sequence</div><div class="meta-val">' + seqNum + '</div></div>\n' : '') +
'</div>\n' +

/* ══ BODY ══ */
'<div class="body">\n' +

/* parties */
'  <div class="parties">\n' +
'    <div class="party">\n' +
'      <div class="party-label">Bill To</div>\n' +
'      <div class="party-name">' + escHtml(b.customer || 'Walk-in Customer') + '</div>\n' +
'      <div class="party-detail">\n' +
(b.phone   ? '        &#128222;&nbsp; ' + escHtml(b.phone)   + '<br>\n' : '') +
(b.address ? '        &#128205;&nbsp; ' + escHtml(b.address) + '<br>\n' : '') +
'      </div>\n' +
'      <span class="bill-type-badge">' + escHtml(b.billType || 'Retail') + '</span>\n' +
'    </div>\n' +
'    <div class="party">\n' +
'      <div class="party-label">Payment Info</div>\n' +
'      <div class="party-name" style="font-size:10pt">Cash / UPI</div>\n' +
'      <div class="party-detail">Due Date: &nbsp;Immediate<br>Currency: &nbsp;INR (&#8377;)<br>UPI: &nbsp;' + UPI_ID + '</div>\n' +
'    </div>\n' +
'  </div>\n' +

/* items table */
'  <div class="table-wrap">\n' +
'    <table class="inv-table">\n' +
'      <thead><tr>\n' +
'        <th style="width:20pt;text-align:center">#</th>\n' +
'        <th>Description</th>\n' +
'        <th class="td-num" style="width:36pt">Qty</th>\n' +
'        <th class="td-num" style="width:68pt">Unit Price</th>\n' +
'        <th class="td-num" style="width:76pt">Amount</th>\n' +
'      </tr></thead>\n' +
'      <tbody>\n' + itemRows + '\n      </tbody>\n' +
'    </table>\n' +
'  </div>\n' +

/* ── bottom: summary + QR side by side ── */
'  <div class="bottom-section">\n' +

'    <div class="summary-side">\n' +
'      <table class="summary-table">\n' +
'        <tr class="summary-row summary-subtotal"><td class="s-label">Subtotal</td><td class="s-value">&#8377;' + fmt(b.subtotal) + '</td></tr>\n' +
         taxRows +
'        <tr class="summary-row summary-total"><td class="s-label">Total Payable</td><td class="s-value">&#8377;' + fmt(b.total) + '</td></tr>\n' +
'      </table>\n' +
'    </div>\n' +

/* QR panel */
'    <div class="qr-panel">\n' +
'      <div class="qr-title">Scan &amp; Pay</div>\n' +
'      <div id="qr-canvas"></div>\n' +
'      <div class="qr-amount">&#8377;' + fmt(b.total) + '</div>\n' +
'      <div class="qr-upi-id">' + UPI_ID + '</div>\n' +
'      <div class="qr-apps"><strong>GPay &nbsp;|&nbsp; PhonePe &nbsp;|&nbsp; Paytm</strong><br>BHIM &nbsp;|&nbsp; Any UPI App</div>\n' +
'      <div class="qr-note">Scan with any UPI app to pay</div>\n' +
'    </div>\n' +

'  </div>\n' + /* end bottom-section */

/* amount in words */
'  <div class="words-block">\n' +
'    <strong>Amount in Words</strong>\n' +
'    <div class="words-text">' + numToWords(b.total) + '</div>\n' +
'  </div>\n' +

(b.notes ? '  <div class="notes-block"><strong>Notes</strong><br>' + escHtml(b.notes) + '</div>\n' : '') +

/* signatures */
'  <div class="sig-row">\n' +
'    <div class="sig-cell"><div class="sig-label">Customer Signature</div></div>\n' +
'    <div class="sig-cell"><div class="sig-label">Prepared By</div></div>\n' +
'    <div class="sig-cell"><div class="sig-label">Authorised Signatory</div></div>\n' +
'  </div>\n' +

'</div>\n' + /* end body */

/* ══ FOOTER ══ */
'<div class="footer">\n' +
'  <div class="footer-left"><strong>Srinivasa Hardwares</strong><br>Thank you for your business. Goods once sold will not be taken back.<br>Subject to Visakhapatnam jurisdiction only.</div>\n' +
'  <div class="footer-right">\n' +
'    Bill #' + billNo + '&nbsp;&nbsp;|&nbsp;&nbsp;' + dateStr + '&nbsp;&nbsp;' + timeStr + (seqNum ? '&nbsp;&nbsp;|&nbsp;&nbsp;Seq: ' + seqNum : '') + '<br>\n' +
'    Generated by Srinivasa Hardwares Billing System\n' +
'  </div>\n' +
'</div>\n' +

'</div>\n' + /* end page */

/* ══ QR generation script ══
   Runs after DOM is ready. QRCode.js draws onto #qr-canvas.
   The UPI string encodes payee, amount and bill reference.
*/
'<script>\n' +
'(function(){\n' +
'  var upiStr = ' + JSON.stringify(upiStr) + ';\n' +
'  function makeQR(){\n' +
'    var el = document.getElementById("qr-canvas");\n' +
'    if(!el || typeof QRCode === "undefined") return;\n' +
'    new QRCode(el, {\n' +
'      text: upiStr,\n' +
'      width:  108,\n' +
'      height: 108,\n' +
'      colorDark:  "#111827",\n' +
'      colorLight: "#ffffff",\n' +
'      correctLevel: QRCode.CorrectLevel.M\n' +
'    });\n' +
'  }\n' +
'  if(document.readyState === "loading"){\n' +
'    document.addEventListener("DOMContentLoaded", makeQR);\n' +
'  } else {\n' +
'    makeQR();\n' +
'  }\n' +
'})();\n' +
'<\/script>\n' +

'</body>\n</html>';
}

/* ─────────────────────────────────────────────
   Save as PDF  —  Bill_0042_11-03-2025_02-45-PM.pdf
───────────────────────────────────────────── */
export async function saveAsPDF(b) {
    var filename = buildPdfFilename(b);
    var html     = buildBillHTML(b);

    var h2p = (typeof window !== 'undefined' && window.html2pdf) || null;
    if (!h2p) {
        try { var mod = await import('html2pdf.js'); h2p = mod.default || mod; }
        catch(e) { /* not installed */ }
    }

    if (h2p) {
        var wrap = document.createElement('div');
        wrap.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;';
        wrap.innerHTML = html;
        document.body.appendChild(wrap);

        /* Let QR render before capture */
        await new Promise(function(r){ setTimeout(r, 600); });

        try {
            await h2p()
                .set({
                    margin:      [0, 0, 0, 0],
                    filename:    filename,
                    image:       { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, logging: false, allowTaint: true },
                    jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
                    pagebreak:   { mode: ['avoid-all', 'css'] },
                })
                .from(wrap)
                .save();
        } finally {
            document.body.removeChild(wrap);
        }
        return;
    }

    _printIframe(html, 'pdf-save-iframe');
}

/* ─────────────────────────────────────────────
   Iframe print  (unchanged)
───────────────────────────────────────────── */
export function printViaIframe(html) {
    _printIframe(html, 'print-iframe');
}

function _printIframe(html, id) {
    var old = document.getElementById(id);
    if (old) old.remove();

    var iframe = document.createElement('iframe');
    iframe.id = id;
    iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:800px;height:600px;border:0;visibility:hidden;';
    iframe.srcdoc = html;
    document.body.appendChild(iframe);

    iframe.onload = function() {
        /* Wait for QRCode.js to render the canvas before printing */
        setTimeout(function() {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } catch(e) {
                var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                var url  = URL.createObjectURL(blob);
                var w    = window.open(url, '_blank');
                if (w) { w.onload = function(){ w.print(); }; }
                setTimeout(function(){ URL.revokeObjectURL(url); }, 120000);
            }
        }, 700);   /* 700ms gives QRCode.js time to draw */
    };

    setTimeout(function(){ try{ iframe.remove(); }catch(e){} }, 120000);
}