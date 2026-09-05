var params = new URLSearchParams(window.location.search);
if (params.get("expired") === "1") {
  showToast("Your session expired. Please log in again.", true);
}

document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  var form = e.target;
  clearFieldErrors(form);

  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;

  var hasError = false;
  if (!isValidEmail(email)) {
    setFieldError("email", "Enter a valid email address");
    hasError = true;
  }
  if (!password) {
    setFieldError("password", "Password is required");
    hasError = true;
  }
  if (hasError) return;

  var btn = document.getElementById("loginBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Logging in...';

  try {
    var user = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password })
    });
    showToast("Welcome back, " + user.fullName + "!");
    setTimeout(function(){
      window.location.href = user.role === "ADMIN" ? "admin.html" : "faculty.html";
    }, 400);
  } catch (err) {
    showToast(err.message, true);
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">login</span> Log In';
  }
});
