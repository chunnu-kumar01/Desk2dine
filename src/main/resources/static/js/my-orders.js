let currentPage = 0;
const PAGE_SIZE = 8;

const STATUS_ICONS = {
  PLACED: "add_shopping_cart",
  DELIVERED: "local_shipping",
  RECEIVED: "mark_email_read",
  BILLED: "receipt",
  PAID: "payments",
  COMPLETED: "check_circle",
  CANCELLED: "cancel"
};

const STATUS_COLORS = {
  PLACED: "#3b82f6",
  DELIVERED: "#f59e0b",
  RECEIVED: "#8b5cf6",
  BILLED: "#e11d48",
  PAID: "#22c55e",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444"
};

async function init() {
  const user = await requireAuth(["FACULTY"]);
  if (!user) return;

  // Show skeletons while loading
  renderOrderSkeletons(document.getElementById("ordersWrap"), 4);

  document.getElementById("statusFilter").addEventListener("change", function(){ currentPage = 0; loadOrders(); });
  if (document.getElementById("searchInput")) {
    document.getElementById("searchInput").addEventListener("input", debounce(function(){ currentPage = 0; loadOrders(); }, 350));
  }
  await loadOrders();
}

function debounce(fn, delay) {
  let timer;
  return function(){ clearTimeout(timer); timer = setTimeout(function(){ fn(); }, delay); };
}

async function loadOrders() {
  const status = document.getElementById("statusFilter").value;
  try {
    const result = await api("/api/orders/mine?status=" + status + "&page=" + currentPage + "&size=" + PAGE_SIZE);
    renderOrders(result.content);
    renderPagination(document.getElementById("pagination"), result.page, result.totalPages, function(p) { currentPage = p; loadOrders(); });
    setTimeout(initScrollAnimations, 100);
  } catch (e) {
    showToast(e.message, true);
  }
}

function renderOrders(orders) {
  const wrap = document.getElementById("ordersWrap");
  if (!orders.length) {
    wrap.innerHTML = '<div class="empty-state"><div class="empty-icon"><span class="material-symbols-outlined">receipt_long</span></div><div class="big">No orders yet</div><p>Head to <a href="faculty.html">Place Order</a> to order something delicious.</p></div>';
    return;
  }
  const cards = orders.map(function(order) {
    const icon = STATUS_ICONS[order.status] || "receipt";
    const color = STATUS_COLORS[order.status] || "#94a3b8";
    let actionBtn = "";
    if (order.status === "DELIVERED") {
      actionBtn = '<button class="btn btn-outline btn-sm" onclick="markReceived(' + order.id + ')"><span class="material-symbols-outlined">done_all</span> Mark Received</button>';
    } else if (order.status === "BILLED") {
      actionBtn = '<a class="btn btn-success btn-sm" href="order-details.html?id=' + order.id + '"><span class="material-symbols-outlined">payment</span> Pay Now</a>';
    }
    return '<div class="order-card">' +
      '<div class="order-card-header">' +
        '<div class="order-card-id">#' + order.id + '</div>' +
        '<span class="status-pill ' + order.status + '">' + order.status + '</span>' +
      '</div>' +
      '<div class="order-card-body">' +
        '<div class="order-card-row"><span class="material-symbols-outlined" style="font-size:16px;color:#94a3b8;">schedule</span> ' + formatDateTime(order.orderTime) + '</div>' +
        '<div class="order-card-row"><span class="material-symbols-outlined" style="font-size:16px;color:#94a3b8;">location_on</span> ' + escapeHtml(order.deliveryLocationName) + '</div>' +
        '<div class="order-card-row"><span class="material-symbols-outlined" style="font-size:16px;color:#94a3b8;">payments</span> <strong>' + formatMoney(order.totalAmount) + '</strong></div>' +
      '</div>' +
      '<div class="order-card-footer">' +
        '<a class="btn btn-primary btn-sm" href="order-details.html?id=' + order.id + '"><span class="material-symbols-outlined">visibility</span> View Details</a>' +
        actionBtn +
      '</div>' +
    '</div>';
  }).join("");

  wrap.innerHTML = '<div class="orders-grid">' + cards + '</div>';
}

async function markReceived(id) {
  try {
    await api("/api/orders/" + id + "/receive", { method: "PATCH" });
    showToast("Marked as received");
    loadOrders();
  } catch (e) {
    showToast(e.message, true);
  }
}

init();
