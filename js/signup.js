var selectedRole = "FACULTY";

document.querySelectorAll(".role-option").forEach(function(el) {
  el.addEventListener("click", function() {
    if (el.style.display === "none" || el.dataset.role !== "FACULTY") return;
    document.querySelectorAll(".role-option").forEach(function(o){ o.classList.remove("selected"); });
    el.classList.add("selected");
    selectedRole = el.dataset.role;
    document.getElementById("selectedRole").value = selectedRole;
  });
});

function passwordStrengthScore(password) {
  var score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@#$%^&+=!_\-]/.test(password)) score++;
  return score;
}

document.getElementById("password").addEventListener("input", function(e) {
  var score = passwordStrengthScore(e.target.value);
  var fill = document.getElementById("strengthFill");
  var pct = (score / 4) * 100;
  fill.style.width = pct + "%";
  fill.style.background = score <= 1 ? "#ef4444" : score === 2 ? "#f59e0b" : score === 3 ? "#c9d323" : "#10b981";
});

document.getElementById("signupForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  var form = e.target;
  clearFieldErrors(form);

  var fullName = document.getElementById("fullName").value.trim();
  var email = document.getElementById("email").value.trim();
  var mobileNumber = document.getElementById("mobileNumber").value.trim();
  var password = document.getElementById("password").value;
  var confirmPassword = document.getElementById("confirmPassword").value;

  var hasError = false;
  if (!fullName) { setFieldError("fullName", "Full name is required"); hasError = true; }
  if (!isValidEmail(email)) { setFieldError("email", "Enter a valid email address"); hasError = true; }
  if (!isValidMobile(mobileNumber)) { setFieldError("mobileNumber", "Enter a valid 10-digit mobile number"); hasError = true; }
  if (!isStrongPassword(password)) {
    setFieldError("password", "Min 8 chars with upper, lower, number & special character");
    hasError = true;
  }
  if (password !== confirmPassword) {
    setFieldError("confirmPassword", "Passwords do not match");
    hasError = true;
  }
  if (hasError) return;

  var btn = document.getElementById("signupBtn");
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Creating account...';

  try {
    await api("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ fullName: fullName, email: email, mobileNumber: mobileNumber, password: password, confirmPassword: confirmPassword, role: "FACULTY" })
    });
    showToast("Account created! Please log in.");
    setTimeout(function(){ window.location.href = "login.html"; }, 800);
  } catch (err) {
    showToast(err.message, true);
    btn.disabled = false;
    btn.innerHTML = '<span class="material-symbols-outlined">person_add</span> Create Account';
  }
});
