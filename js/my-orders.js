let currentUser = null;
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

async function init() {
  currentUser = await getCurrentUser();
  renderTopbarUser(currentUser);
  CartManager.updateBadge();

  const wrap = document.getElementById("ordersWrap");
  const filterRow = document.getElementById("ordersFilterRow");

  if (!currentUser) {
    if (filterRow) filterRow.style.display = "none";
    if (wrap) {
      wrap.innerHTML =
        '<div class="empty-state" style="background:#fff;padding:48px 24px;border-radius:4px;border:1px solid var(--fk-border);max-width:520px;margin:32px auto;box-shadow:0 1px 4px rgba(0,0,0,0.06);">' +
          '<div class="empty-icon" style="width:72px;height:72px;background:#eef4ff;color:var(--fk-blue);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">' +
            '<span class="material-symbols-outlined" style="font-size:36px;">receipt_long</span>' +
          '</div>' +
          '<div class="big" style="font-size:20px;font-weight:700;margin-bottom:8px;color:var(--fk-text);">Login to view your orders</div>' +
          '<p style="color:var(--fk-text-light);font-size:14px;margin-bottom:24px;line-height:1.5;">' +
            'Please log in with your faculty account to see your canteen orders, check live delivery status, and view invoices.' +
          '</p>' +
          '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">' +
            '<button class="btn btn-primary" onclick="showAuthModal({ title: \'Login to view your orders\', subtitle: \'Sign in to access your order history and live status\', redirectUrl: \'my-orders.html\' })">' +
              '<span class="material-symbols-outlined">login</span> Log In to Continue' +
            '</button>' +
            '<a href="index.html" class="btn btn-outline">' +
              '<span class="material-symbols-outlined">restaurant_menu</span> Browse Menu' +
            '</a>' +
          '</div>' +
        '</div>';
    }
    return;
  }

  if (filterRow) filterRow.style.display = "flex";

  // Show skeletons while loading
  renderOrderSkeletons(wrap, 4);

  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", function(){ currentPage = 0; loadOrders(); });
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(function(){ currentPage = 0; loadOrders(); }, 350));
  }

  await loadOrders();
}

function debounce(fn, delay) {
  let timer;
  return function(){
    clearTimeout(timer);
    const args = arguments;
    timer = setTimeout(function(){ fn.apply(null, args); }, delay);
  };
}

async function loadOrders() {
  const statusEl = document.getElementById("statusFilter");
  const status = statusEl ? statusEl.value : "";
  try {
    const result = await api("/api/orders/mine?status=" + encodeURIComponent(status) + "&page=" + currentPage + "&size=" + PAGE_SIZE);
    renderOrders(result.content);
    renderPagination(document.getElementById("pagination"), result.page, result.totalPages, function(p) {
      currentPage = p;
      loadOrders();
    });
    setTimeout(initScrollAnimations, 100);
  } catch (e) {
    showToast(e.message, true);
  }
}

function renderOrders(orders) {
  const wrap = document.getElementById("ordersWrap");
  if (!wrap) return;

  if (!orders || !orders.length) {
    wrap.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon"><span class="material-symbols-outlined">receipt_long</span></div>' +
        '<div class="big">No orders found</div>' +
        '<p>You have not placed any orders matching the selection. Explore our delicious menu!</p>' +
        '<a href="index.html" class="btn btn-primary" style="margin-top:16px;">' +
          '<span class="material-symbols-outlined">restaurant_menu</span> Browse Canteen Menu' +
        '</a>' +
      '</div>';
    return;
  }

  const cards = orders.map(function(order) {
    let actionBtn = "";
    if (order.status === "DELIVERED") {
      actionBtn = '<button class="btn btn-outline btn-sm" onclick="markReceived(' + order.id + ')"><span class="material-symbols-outlined">done_all</span> Mark Received</button>';
    } else if (order.status === "BILLED") {
      actionBtn = '<a class="btn btn-success btn-sm" href="order-details.html?id=' + order.id + '"><span class="material-symbols-outlined">payment</span> Pay Now</a>';
    }

    const itemsSummary = (order.items && order.items.length)
      ? order.items.map(function(it){ return escapeHtml(it.itemName) + ' &times; ' + it.quantity; }).join(', ')
      : 'Canteen food items';

    return '<div class="order-card">' +
      '<div class="order-card-header">' +
        '<div class="order-card-id">Order #' + order.id + '</div>' +
        '<span class="status-pill ' + order.status + '">' + order.status + '</span>' +
      '</div>' +
      '<div class="order-card-body">' +
        '<div class="order-card-row" style="color:#555;font-weight:500;margin-bottom:6px;">' +
          '<span class="material-symbols-outlined" style="font-size:16px;color:#94a3b8;">restaurant</span> ' +
          '<span>' + itemsSummary + '</span>' +
        '</div>' +
        '<div class="order-card-row"><span class="material-symbols-outlined" style="font-size:16px;color:#94a3b8;">schedule</span> ' + formatDateTime(order.orderTime) + '</div>' +
        '<div class="order-card-row"><span class="material-symbols-outlined" style="font-size:16px;color:#94a3b8;">location_on</span> ' + escapeHtml(order.deliveryLocationName || "Campus Cabin") + '</div>' +
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
    showToast("Order marked as received!");
    loadOrders();
  } catch (e) {
    showToast(e.message, true);
  }
}

init();
