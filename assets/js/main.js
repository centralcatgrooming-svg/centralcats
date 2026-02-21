/* =========================================
   CENTRAL CAT’S MAIN JS
   Clean Production Version
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  /* =========================================
     MOBILE MENU
  ========================================= */

  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const overlay = document.querySelector(".overlay");

  if (hamburger && mobileMenu && overlay) {
    hamburger.addEventListener("click", () => {
      mobileMenu.classList.toggle("active");
      overlay.classList.toggle("active");
      document.body.classList.toggle("no-scroll");
    });

    overlay.addEventListener("click", closeMenu);

    document.querySelectorAll(".mobile-menu a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    function closeMenu() {
      mobileMenu.classList.remove("active");
      overlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }
  }

  /* =========================================
     LOGO INTRO REMOVE
  ========================================= */

  const intro = document.getElementById("logoIntro");
  if (intro) {
    setTimeout(() => {
      intro.remove();
    }, 2300);
  }

  /* =========================================
     TRUST STRIP ANIMATION
  ========================================= */

  const trustItems = document.querySelectorAll(".trust-item");
  if (trustItems.length > 0) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    }, { threshold: 0.2 });

    trustItems.forEach(item => observer.observe(item));
  }

  /* =========================================
     CHAT ASSISTANT
  ========================================= */

  const ccTrigger = document.getElementById("ccTrigger");
  const ccPanel = document.getElementById("ccPanel");
  const ccClose = document.getElementById("ccClose");
  const ccChat = document.getElementById("ccChat");
  const ccInput = document.getElementById("ccName");
  const ccStart = document.getElementById("ccStart");

  if (ccTrigger && ccPanel) {

    let step = "name";
    let userData = {};

    /* OPEN / CLOSE */

    ccTrigger.addEventListener("click", () => {
      ccPanel.style.display = "flex";
      ccTrigger.style.display = "none";
      ccInput.focus();
    });

    ccClose.addEventListener("click", () => {
      ccPanel.style.display = "none";
      ccTrigger.style.display = "flex";
    });

    /* ENABLE BUTTON */

    ccInput.addEventListener("input", () => {
      ccStart.disabled = !ccInput.value.trim();
    });

    ccInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !ccStart.disabled) {
        e.preventDefault();
        ccStart.click();
      }
    });

    /* MAIN FLOW */

    ccStart.addEventListener("click", () => {
      const val = ccInput.value.trim();
      if (!val) return;

      addMessage(val, "user");
      ccInput.value = "";
      ccStart.disabled = true;

      if (step === "name") {
        userData.name = val;
        step = "menu";
        botReply(`Terima kasih ${val} 😊 Silakan pilih layanan:`);
        setTimeout(showServiceOptions, 800);
      }

      else if (step === "phone") {
        userData.phone = val;
        step = "done";
        finishBooking();
      }
    });

    /* SERVICES */

    function showServiceOptions() {
      const services = [
        "Daily Grooming",
        "Grooming Jamur",
        "Beauty Grooming",
        "Lion Cut",
        "Cat Hotel"
      ];

      services.forEach(service => {
        const btn = document.createElement("button");
        btn.className = "cc-msg cc-bot";
        btn.textContent = service;
        btn.style.cursor = "pointer";

        btn.onclick = () => {
          addMessage(service, "user");
          userData.service = service;
          step = "phone";
          botReply("Mohon nomor WhatsApp aktif Anda 😊");
        };

        ccChat.appendChild(btn);
      });

      ccChat.scrollTop = ccChat.scrollHeight;
    }

    /* BOOKING FINISH */

    function finishBooking() {
      botReply("Kami siapkan detail reservasi Anda...");

      const message =
        `Halo Central Cat’s,%0A` +
        `Nama: ${userData.name}%0A` +
        `Layanan: ${userData.service}%0A` +
        `No WA: ${userData.phone}%0A` +
        `Saya ingin melakukan reservasi.`;

      setTimeout(() => {
        window.open(
          `https://wa.me/6282111827798?text=${message}`,
          "_blank"
        );
        resetChat();
      }, 1000);
    }

    /* MESSAGE FUNCTION */

    function addMessage(text, type) {
      const msg = document.createElement("div");
      msg.className = "cc-msg " + (type === "bot" ? "cc-bot" : "cc-user");
      msg.textContent = text;
      ccChat.appendChild(msg);
      ccChat.scrollTop = ccChat.scrollHeight;
    }

    function botReply(text) {
      setTimeout(() => {
        addMessage(text, "bot");
      }, 600);
    }

    function resetChat() {
      ccChat.innerHTML = "";
      step = "name";
      userData = {};
      startConversation();
    }

    function startConversation() {
      botReply("Selamat datang di Central Cat’s ✨ Boleh tahu nama Anda?");
    }

    startConversation();
  }

});
