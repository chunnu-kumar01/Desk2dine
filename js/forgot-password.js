document.getElementById("forgotForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  var form = e.target;
  clearFieldErrors(form);

  var email = document.getElementById("email").value.trim();
  if (!isValidEmail(email)) {
    setFieldError("email", "Enter a valid email address");
    return;
  }

  var btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending...';

  try {
    await api("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: email })
    });
    showToast("If that email is registered, a reset link has been sent.");
    document.getElementById("forgotForm").reset();

    var hint = document.getElementById("devHint");
    hint.style.display = "block";
    hint.textContent = "Local dev note: since no SMTP is configured, check the server console log " +
        "for the reset link (it's printed there instead of emailed).";
  } catch (err) {
    showToast(err.message, true);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">send</span> Send Reset Link';
  }
});
