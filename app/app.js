(function () {
  "use strict";

  var CONFIG = window.INVOICESNAP_CONFIG || {};
  var isPro = CONFIG.proUnlocked === true;

  var $ = function (id) { return document.getElementById(id); };

  var itemsBody = $("itemsBody");

  function currency() { return $("currency").value; }

  function fmt(n) {
    return currency() + (Number(n) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    });
  }

  function addItem(desc, qty, rate) {
    var tr = document.createElement("tr");
    tr.innerHTML =
      '<td><input class="i-desc" value="' + (desc || "") + '" placeholder="Design work" /></td>' +
      '<td><input class="i-qty" type="number" min="0" step="1" value="' + (qty || 1) + '" /></td>' +
      '<td><input class="i-rate" type="number" min="0" step="0.01" value="' + (rate || 0) + '" /></td>' +
      '<td><button class="item-remove" title="Remove">&times;</button></td>';
    tr.querySelector(".item-remove").addEventListener("click", function () {
      tr.remove();
      render();
    });
    tr.querySelectorAll("input").forEach(function (inp) {
      inp.addEventListener("input", render);
    });
    itemsBody.appendChild(tr);
  }

  function collectItems() {
    var rows = [];
    itemsBody.querySelectorAll("tr").forEach(function (tr) {
      var desc = tr.querySelector(".i-desc").value;
      var qty = parseFloat(tr.querySelector(".i-qty").value) || 0;
      var rate = parseFloat(tr.querySelector(".i-rate").value) || 0;
      rows.push({ desc: desc, qty: qty, rate: rate, amount: qty * rate });
    });
    return rows;
  }

  function render() {
    var items = collectItems();
    var subtotal = items.reduce(function (s, i) { return s + i.amount; }, 0);
    var taxRate = parseFloat($("taxRate").value) || 0;
    var discount = parseFloat($("discount").value) || 0;
    var tax = (subtotal - discount) * (taxRate / 100);
    var total = subtotal - discount + tax;

    var rowsHtml = items.map(function (i) {
      return "<tr><td>" + escapeHtml(i.desc || "&mdash;") + "</td><td>" + i.qty +
        "</td><td>" + fmt(i.rate) + "</td><td style='text-align:right'>" + fmt(i.amount) + "</td></tr>";
    }).join("");

    var brandFooter = isPro ? "" :
      '<div class="pv-brand">Made with InvoiceSnap</div>';

    $("preview").innerHTML =
      '<div class="inv-head">' +
        '<div><div class="biz">' + escapeHtml($("bizName").value || "Your Business") + '</div>' +
        '<div style="color:#666;white-space:pre-line">' + escapeHtml($("bizInfo").value) + '</div></div>' +
        '<div class="inv-meta"><h1>INVOICE</h1>' +
        '<div>' + escapeHtml($("invNumber").value || "INV-001") + '</div>' +
        '<div>Issued: ' + (escapeHtml($("issueDate").value) || "—") + '</div>' +
        '<div>Due: ' + (escapeHtml($("dueDate").value) || "—") + '</div></div>' +
      '</div>' +
      '<div><strong>Bill to:</strong><br/>' + escapeHtml($("clientName").value || "Client") +
        '<div style="color:#666;white-space:pre-line">' + escapeHtml($("clientInfo").value) + '</div></div>' +
      '<table><thead><tr><th>Description</th><th>Qty</th><th>Rate</th><th style="text-align:right">Amount</th></tr></thead>' +
        '<tbody>' + (rowsHtml || '<tr><td colspan="4" style="color:#999">No items yet</td></tr>') + '</tbody></table>' +
      '<div class="pv-totals">' +
        '<div class="pv-row"><span>Subtotal</span><span>' + fmt(subtotal) + '</span></div>' +
        (discount ? '<div class="pv-row"><span>Discount</span><span>-' + fmt(discount) + '</span></div>' : '') +
        (taxRate ? '<div class="pv-row"><span>Tax (' + taxRate + '%)</span><span>' + fmt(tax) + '</span></div>' : '') +
        '<div class="pv-row pv-grand"><span>Total</span><span>' + fmt(total) + '</span></div>' +
      '</div>' +
      ($("notes").value ? '<div class="pv-footer"><strong>Notes:</strong><br/>' + escapeHtml($("notes").value) + '</div>' : '') +
      brandFooter;
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // PDF export
  function downloadPdf() {
    var node = $("preview");
    html2canvas(node, { scale: 2, backgroundColor: "#ffffff" }).then(function (canvas) {
      var imgData = canvas.toDataURL("image/png");
      var pdf = new window.jspdf.jsPDF("p", "mm", "a4");
      var pageWidth = pdf.internal.pageSize.getWidth();
      var imgWidth = pageWidth - 20;
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      var name = ($("invNumber").value || "invoice").replace(/[^a-z0-9\-_]/gi, "_");
      pdf.save(name + ".pdf");
    });
  }

  // Persist business defaults locally
  var DEFAULT_KEYS = ["bizName", "bizInfo", "currency", "taxRate", "notes"];
  function saveDefaults() {
    var data = {};
    DEFAULT_KEYS.forEach(function (k) { data[k] = $(k).value; });
    localStorage.setItem("invoicesnap_defaults", JSON.stringify(data));
    var btn = $("saveDefaults");
    var old = btn.textContent;
    btn.textContent = "Saved ✓";
    setTimeout(function () { btn.textContent = old; }, 1500);
  }
  function loadDefaults() {
    try {
      var data = JSON.parse(localStorage.getItem("invoicesnap_defaults") || "{}");
      DEFAULT_KEYS.forEach(function (k) { if (data[k] != null) $(k).value = data[k]; });
    } catch (e) {}
  }

  // Init
  function init() {
    var today = new Date().toISOString().slice(0, 10);
    $("issueDate").value = today;
    var due = new Date(); due.setDate(due.getDate() + 14);
    $("dueDate").value = due.toISOString().slice(0, 10);
    $("invNumber").value = "INV-" + String(Date.now()).slice(-5);

    loadDefaults();
    addItem("", 1, 0);

    document.querySelectorAll("input, textarea, select").forEach(function (el) {
      el.addEventListener("input", render);
    });
    $("addItem").addEventListener("click", function () { addItem("", 1, 0); render(); });
    $("downloadPdf").addEventListener("click", downloadPdf);
    $("printBtn").addEventListener("click", function () { window.print(); });
    $("saveDefaults").addEventListener("click", saveDefaults);

    render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
