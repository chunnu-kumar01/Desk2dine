var resetToken = new URLSearchParams(window.location.search).get("token");

if (!resetToken) {
  showToast("This reset link is missing its token. Please request a new one.", true);
}

document.getElementById("newPassword").addEventListener("input", function(e) {
  var password = e.target.value;
  var score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@#$%^&+=!_\-]/.test(password)) score++;
  var fill = document.getElementById("strengthFill");
  fill.style.width = (score / 4) * 100 + "%";
  fill.style.background = score <= 1 ? "#ef4444" : score === 2 ? "#f59e0b" : score === 3 ? "#c9d323" : "#10b981";
});

document.getElementById("resetForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  var form = e.target;
  clearFieldErrors(form);

  var newPassword = document.getElementById("newPassword").value;
  var confirmPassword = document.getElementById("confirmPassword").value;

  var hasError = false;
  if (!isStrongPassword(newPassword)) {
    setFieldError("newPassword", "Min 8 chars with upper, lower, number & special character");
    hasError = true;
  }
  if (newPassword !== confirmPassword) {
    setFieldError("confirmPassword", "Passwords do not match");
    hasError = true;
  }
  if (!resetToken) {
    showToast("Missing reset token. Please request a new reset link.", true);
    hasError = true;
  }
  if (hasError) return;

  var btn = document.getElementById("resetBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Resetting...';

  try {
    await api("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: resetToken, newPassword: newPassword, confirmPassword: confirmPassword })
    });
    showToast("Password reset! Please log in.");
    setTimeout(function(){ window.location.href = "login.html"; }, 800);
  } catch (err) {
    showToast(err.message, true);
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">lock_reset</span> Reset Password';
  }
});
