import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.APP_CONFIG || {};
const isConfigured =
  config.SUPABASE_URL &&
  config.SUPABASE_ANON_KEY &&
  !config.SUPABASE_URL.startsWith("TODO_") &&
  !config.SUPABASE_ANON_KEY.startsWith("TODO_");

const supabase = isConfigured
  ? createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
  : null;

const form = document.getElementById("lead-form");
const submitBtn = document.getElementById("submit-btn");
const statusEl = document.getElementById("form-status");

const PHONE_RE = /^[\d\s()+-]{7,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let isSubmitting = false;

function setFieldError(fieldName, message) {
  const el = form.querySelector(`[data-error-for="${fieldName}"]`);
  if (el) el.textContent = message || "";
}

function clearErrors() {
  form.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
  statusEl.textContent = "";
  statusEl.removeAttribute("data-state");
}

function validate(data) {
  let valid = true;

  if (!data.name.trim()) {
    setFieldError("name", "Name is required.");
    valid = false;
  }

  if (!data.phone.trim()) {
    setFieldError("phone", "Phone is required.");
    valid = false;
  } else if (!PHONE_RE.test(data.phone.trim())) {
    setFieldError("phone", "Enter a valid phone number.");
    valid = false;
  }

  if (!data.email.trim()) {
    setFieldError("email", "Email is required.");
    valid = false;
  } else if (!EMAIL_RE.test(data.email.trim())) {
    setFieldError("email", "Enter a valid email address.");
    valid = false;
  }

  return valid;
}

function showSuccess() {
  form.innerHTML = "";
  statusEl.setAttribute("data-state", "success");
  statusEl.textContent = "Thanks — we've got your info and will be in touch shortly.";
}

function showError(message) {
  statusEl.setAttribute("data-state", "error");
  statusEl.textContent = message;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (isSubmitting) return;
  clearErrors();

  const data = {
    name: form.name.value,
    phone: form.phone.value,
    email: form.email.value,
    company: form.company.value, // honeypot
  };

  // Honeypot tripped: pretend success, never call Supabase.
  if (data.company.trim() !== "") {
    showSuccess();
    return;
  }

  if (!validate(data)) return;

  if (!supabase) {
    console.warn(
      "[form.js] Supabase is not configured yet — fill in js/config.js with your real SUPABASE_URL and SUPABASE_ANON_KEY."
    );
    showError("This form isn't fully set up yet. Please try again later.");
    return;
  }

  isSubmitting = true;
  submitBtn.disabled = true;

  const { error } = await supabase.from("leads").insert({
    name: data.name.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    source: "landing-page",
  });

  if (error) {
    console.error("[form.js] Supabase insert failed:", error);
    showError("Something went wrong. Please try again in a moment.");
    isSubmitting = false;
    submitBtn.disabled = false;
    return;
  }

  showSuccess();
});
