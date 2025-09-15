// ================= CACHE DE ELEMENTOS =================
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const header = document.querySelector('.header');

// ================= MOBILE NAV TOGGLE =================
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// FORM
const form = document.getElementById("meuForm")
const submitBtn = form.querySelector(".submit-btn")
const btnText = submitBtn.querySelector(".btn-text")
const btnLoading = submitBtn.querySelector(".btn-loading")

form.addEventListener("submit", (e) => {
  e.preventDefault() // evita que a página recarregue

  // Adiciona estado de loading
  submitBtn.classList.add("loading")
  submitBtn.disabled = true

  const data = new FormData(form)
  const payload = new URLSearchParams()

  payload.append("entry.1655741229", data.get("entry.1655741229"))
  payload.append("entry.777068924", data.get("entry.777068924"))
  payload.append("entry.429007067", data.get("entry.429007067"))
  payload.append("entry.374350221", data.get("entry.374350221"))

  const googleFormURL =
    "https://docs.google.com/forms/d/e/1FAIpQLSeyqQ9yL68Kcrg6FxqLm1DvMhurPQSsMapzum6f8IQuAGa4Cw/formResponse"

  fetch(googleFormURL, {
    method: "POST",
    body: payload,
    mode: "no-cors",
  })
    .then(() => {
      // Remove estado de loading
      submitBtn.classList.remove("loading")
      submitBtn.disabled = false

      // Mostra mensagem de sucesso
      showSuccessMessage()

      // Limpa o formulário
      form.reset()
    })
    .catch((error) => {
      console.error("Erro:", error)

      // Remove estado de loading
      submitBtn.classList.remove("loading")
      submitBtn.disabled = false

      // Mostra mensagem de sucesso mesmo assim (devido ao no-cors)
      showSuccessMessage()
      form.reset()
    })
})

function showSuccessMessage() {
  // Cria elemento de mensagem de sucesso se não existir
  let successMessage = document.querySelector(".success-message")
  if (!successMessage) {
    successMessage = document.createElement("div")
    successMessage.className = "success-message"
    successMessage.innerHTML =
      "<strong>Denúncia enviada com sucesso!</strong> Agradecemos por nos ajudar a manter um ambiente seguro. Sua denúncia será analisada com total confidencialidade."
    form.parentNode.insertBefore(successMessage, form)
  }

  // Mostra a mensagem
  successMessage.classList.add("show")

  // Remove a mensagem após 5 segundos
  setTimeout(() => {
    successMessage.classList.remove("show")
  }, 5000)

  // Scroll para o topo da página
  window.scrollTo({ top: 0, behavior: "smooth" })
}

// Validação em tempo real
const requiredFields = form.querySelectorAll("[required]")
requiredFields.forEach((field) => {
  field.addEventListener("blur", function () {
    validateField(this)
  })

  field.addEventListener("input", function () {
    if (this.classList.contains("error")) {
      validateField(this)
    }
  })
})

function validateField(field) {
  const value = field.value.trim()
  const isValid = field.checkValidity() && value !== ""

  if (isValid) {
    field.classList.remove("error")
    removeErrorMessage(field)
  } else {
    field.classList.add("error")
    showErrorMessage(field)
  }

  return isValid
}

function showErrorMessage(field) {
  removeErrorMessage(field) // Remove mensagem anterior se existir

  const errorDiv = document.createElement("div")
  errorDiv.className = "error-message"
  errorDiv.style.color = "#dc3545"
  errorDiv.style.fontSize = "0.875rem"
  errorDiv.style.marginTop = "0.25rem"

  if (field.type === "email") {
    errorDiv.textContent = "Por favor, insira um e-mail válido."
  } else if (field.tagName === "SELECT") {
    errorDiv.textContent = "Por favor, selecione uma opção."
  } else if (field.tagName === "TEXTAREA") {
    errorDiv.textContent = "Por favor, descreva a denúncia."
  } else {
    errorDiv.textContent = "Este campo é obrigatório."
  }

  field.parentNode.appendChild(errorDiv)
}

function removeErrorMessage(field) {
  const errorMessage = field.parentNode.querySelector(".error-message")
  if (errorMessage) {
    errorMessage.remove()
  }
}

// Adiciona estilos para campos com erro
const style = document.createElement("style")
style.textContent = `
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #dc3545;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }
`
document.head.appendChild(style)
