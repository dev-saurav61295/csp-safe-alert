// External JS fixture controller for strict CSP test page
(() => {
  const CspAlert = (window.CspAlert && window.CspAlert.fire) ? window.CspAlert : (window.CspAlert && window.CspAlert.default) ? window.CspAlert.default : window.CspAlert;

  window.__cspViolations = [];
  document.addEventListener('securitypolicyviolation', (e) => {
    window.__cspViolations.push({
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy,
    });
  });

  const outputEl = document.getElementById('result-output');
  function showResult(text) {
    if (outputEl) outputEl.textContent = text;
  }

  document.getElementById('btn-basic-alert')?.addEventListener('click', async () => {
    const res = await CspAlert.fire({
      title: 'Strict CSP Alert',
      text: 'This alert operates without inline scripts or inline styles.',
      icon: 'success',
    });
    showResult(`Basic Alert: ${res.isConfirmed ? 'confirmed' : 'dismissed'}`);
  });

  document.getElementById('btn-confirm-dialog')?.addEventListener('click', async () => {
    const res = await CspAlert.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Yes, proceed',
      denyButtonText: 'No, deny',
      cancelButtonText: 'Cancel',
      focusCancel: true,
    });
    showResult(`Confirm Dialog: confirmed=${res.isConfirmed}, denied=${res.isDenied}, dismissed=${res.isDismissed}`);
  });

  document.getElementById('btn-input-prompt')?.addEventListener('click', async () => {
    const res = await CspAlert.fire({
      title: 'What is your username?',
      input: 'text',
      inputPlaceholder: 'Enter username',
      showCancelButton: true,
    });
    showResult(`Input Prompt: value=${res.value}`);
  });

  document.getElementById('btn-validation-prompt')?.addEventListener('click', async () => {
    const res = await CspAlert.fire({
      title: 'Enter your email',
      input: 'email',
      inputPlaceholder: 'user@example.com',
      showCancelButton: true,
      inputValidator: (val) => {
        if (!val || !val.includes('@')) {
          return 'Please enter a valid email address';
        }
        return null;
      },
    });
    showResult(`Validation Prompt: value=${res.value}`);
  });

  document.getElementById('btn-toast')?.addEventListener('click', async () => {
    const res = await CspAlert.fire({
      toast: true,
      position: 'top-end',
      title: 'Settings updated',
      icon: 'info',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    showResult(`Toast: dismissed=${res.isDismissed}`);
  });

  document.getElementById('btn-timer')?.addEventListener('click', async () => {
    const res = await CspAlert.fire({
      title: 'Auto closing in 1.5s',
      timer: 1500,
      timerProgressBar: true,
    });
    showResult(`Timer Alert: dismiss=${res.dismiss}`);
  });

  document.getElementById('btn-dark-theme')?.addEventListener('click', async () => {
    const res = await CspAlert.fire({
      title: 'Dark Theme Alert',
      text: 'Rendered with dark theme tokens.',
      icon: 'question',
      theme: 'dark',
    });
    showResult(`Dark Theme: confirmed=${res.isConfirmed}`);
  });

  document.getElementById('btn-high-contrast')?.addEventListener('click', async () => {
    const res = await CspAlert.fire({
      title: 'High Contrast Mode',
      text: 'High contrast styling for maximum visibility.',
      icon: 'warning',
      theme: 'high-contrast',
    });
    showResult(`High Contrast: confirmed=${res.isConfirmed}`);
  });

  document.getElementById('btn-async-loader')?.addEventListener('click', async () => {
    const res = await CspAlert.fire({
      title: 'Submit payment',
      showCancelButton: true,
      beforeConfirm: async () => {
        await new Promise((r) => setTimeout(r, 300));
        return { status: 'success', transactionId: 'TX-12345' };
      },
    });
    showResult(`Async Loader: ${JSON.stringify(res.value)}`);
  });
})();
