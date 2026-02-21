// ============================
// CENTRAL CAT'S MAIN JS
// ============================

document.addEventListener("DOMContentLoaded", function () {

  /* ============================
     HAMBURGER MENU
  ============================ */

  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.overlay');

  if (hamburger && mobileMenu && overlay) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.classList.toggle('no-scroll');
    });

    overlay.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    });
  }

  /* ============================
     CHAT ASSISTANT
  ============================ */

  const ccTrigger = document.getElementById('ccTrigger');
  const ccPanel = document.getElementById('ccPanel');
  const ccClose = document.getElementById('ccClose');
  const ccChat = document.getElementById('ccChat');
  const ccInput = document.getElementById('ccName');
  const ccStart = document.getElementById('ccStart');

  if (ccTrigger && ccPanel) {

    ccTrigger.addEventListener('click', () => {
      ccPanel.style.display = 'flex';
      ccTrigger.style.display = 'none';
      if (ccInput) ccInput.focus();
    });

  }

  if (ccClose && ccPanel && ccTrigger) {

    ccClose.addEventListener('click', () => {
      ccPanel.style.display = 'none';
      ccTrigger.style.display = 'flex';
    });

  }

});
