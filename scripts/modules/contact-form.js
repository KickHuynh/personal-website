import { apiUrl, requestJson } from "./http.js";

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function showMessage(el, message, type) {
  el.textContent = message;
  el.className = `form-message ${type === "success" ? "is-success" : "is-error"}`;
}

function clearMessage(el) {
  el.textContent = "";
  el.className = "form-message";
}

function setButtonLoading(btn, loading, label) {
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = label;
}

export function initContactForm(formId = "contactForm") {
  const form = document.getElementById(formId);
  if (!form) return;

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const subjectInput = document.getElementById("subject");
  const messageInput = document.getElementById("message");
  const msgEl = document.getElementById("formMessage");

  if (!nameInput || !emailInput || !messageInput || !msgEl) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage(msgEl);

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput?.value.trim() ?? "";
    const message = messageInput.value.trim();

    if (!name || !email || !message) {
      showMessage(msgEl, "Vui long nhap day du ho ten, email va noi dung.", "error");
      return;
    }
    if (!isValidEmail(email)) {
      showMessage(msgEl, "Email khong dung dinh dang.", "error");
      return;
    }
    if (message.length < 10) {
      showMessage(msgEl, "Noi dung phai co it nhat 10 ky tu.", "error");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true, "Dang gui...");

    try {
      await requestJson(apiUrl("/messages"), {
        method: "POST",
        body: { name, email, subject, message },
      });

      showMessage(msgEl, "Gui loi nhan thanh cong. Toi se phan hoi som nhat co the.", "success");
      form.reset();
    } catch (error) {
      console.error("[contact-form] Submit error:", error);
      showMessage(msgEl, error.message || "Khong the ket noi toi server. Vui long thu lai sau.", "error");
    } finally {
      setButtonLoading(submitBtn, false, "Gui loi nhan");
    }
  });
}
