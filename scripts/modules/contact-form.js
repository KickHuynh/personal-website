/**
 * modules/contact-form.js
 * Contact form validation and submission.
 */

import { API_BASE } from "../config.js";

/* ------------------------------------------------------------------
   Helpers
   ------------------------------------------------------------------ */

/** @param {string} value @returns {boolean} */
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Show a status message using CSS classes (not inline styles).
 * @param {HTMLElement} el
 * @param {string} message
 * @param {'success'|'error'} type
 */
function showMessage(el, message, type) {
  el.textContent = message;
  el.className = `form-message ${type === "success" ? "is-success" : "is-error"}`;
}

/** @param {HTMLElement} el */
function clearMessage(el) {
  el.textContent = "";
  el.className = "form-message";
}

/**
 * Toggle submit button loading state.
 * @param {HTMLButtonElement} btn
 * @param {boolean} loading
 * @param {string} label
 */
function setButtonLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = label;
}

/* ------------------------------------------------------------------
   Public API
   ------------------------------------------------------------------ */

/**
 * Initialize the contact form: validation + API submission.
 * @param {string} [formId="contactForm"]
 */
export function initContactForm(formId = "contactForm") {
  const form = document.getElementById(formId);
  if (!form) return;

  const nameInput    = document.getElementById("name");
  const emailInput   = document.getElementById("email");
  const subjectInput = document.getElementById("subject");
  const messageInput = document.getElementById("message");
  const msgEl        = document.getElementById("formMessage");

  if (!nameInput || !emailInput || !messageInput || !msgEl) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(msgEl);

    const name    = nameInput.value.trim();
    const email   = emailInput.value.trim();
    const subject = subjectInput?.value.trim() ?? "";
    const message = messageInput.value.trim();

    // Client-side validation
    if (!name || !email || !message) {
      showMessage(msgEl, "Vui lòng nhập đầy đủ họ tên, email và nội dung.", "error");
      return;
    }
    if (!isValidEmail(email)) {
      showMessage(msgEl, "Email không đúng định dạng.", "error");
      return;
    }
    if (message.length < 10) {
      showMessage(msgEl, "Nội dung phải có ít nhất 10 ký tự.", "error");
      return;
    }

    // Submit
    const submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true, "Đang gửi...");

    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const result = await response.json();

      if (result.success) {
        showMessage(msgEl, "Gửi lời nhắn thành công! Tôi sẽ phản hồi sớm nhất có thể.", "success");
        form.reset();
      } else {
        showMessage(msgEl, result.message || "Gửi thất bại. Vui lòng thử lại.", "error");
      }
    } catch (error) {
      console.error("[contact-form] Submit error:", error);
      showMessage(msgEl, "Không thể kết nối tới server. Vui lòng thử lại sau.", "error");
    } finally {
      setButtonLoading(submitBtn, false, "Gửi lời nhắn");
    }
  });
}
