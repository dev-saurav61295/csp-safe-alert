(() => {
  const CspAlert = (window.CspAlert && window.CspAlert.fire) ? window.CspAlert : (window.CspAlert && window.CspAlert.default) ? window.CspAlert.default : window.CspAlert;

  const resultBox = document.getElementById('demo-result-box');
  function displayResult(data) {
    if (resultBox) {
      resultBox.textContent = JSON.stringify(data, null, 2);
    }
  }

  // 1. Basic Alerts
  document.getElementById('demo-basic-success')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Success!',
      text: 'Your profile changes were saved successfully.',
      icon: 'success',
    });
    displayResult(result);
  });

  document.getElementById('demo-basic-error')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Operation Failed',
      text: 'Unable to connect to the authentication server.',
      icon: 'error',
      confirmButtonVariant: 'danger',
    });
    displayResult(result);
  });

  document.getElementById('demo-basic-warning')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Delete Repository?',
      text: 'This action is permanent and cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Delete Permanently',
      confirmButtonVariant: 'danger',
      denyButtonText: 'Archive instead',
      cancelButtonText: 'Keep repository',
      focusCancel: true,
    });
    displayResult(result);
  });

  document.getElementById('demo-basic-info')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Maintenance Notice',
      text: 'Scheduled system maintenance will occur tonight at 02:00 UTC.',
      icon: 'info',
      footer: 'For support, visit help.example.com',
    });
    displayResult(result);
  });

  document.getElementById('demo-basic-question')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Enable Notifications?',
      text: 'Would you like to receive browser notifications for new messages?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Allow',
      cancelButtonText: 'Block',
    });
    displayResult(result);
  });

  // 2. Form Inputs & Validation
  document.getElementById('demo-input-text')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Enter Workspace Name',
      input: 'text',
      inputLabel: 'Workspace Identifier',
      inputPlaceholder: 'e.g. acme-corp',
      showCancelButton: true,
      inputValidator: (val) => {
        if (!val) return 'Workspace name cannot be empty.';
        if (val.length < 3) return 'Workspace name must be at least 3 characters.';
        return null;
      },
    });
    displayResult(result);
  });

  document.getElementById('demo-input-select')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Select Region',
      input: 'select',
      inputLabel: 'Deployment Region',
      inputPlaceholder: 'Choose a region...',
      inputOptions: {
        us_east: 'US East (N. Virginia)',
        us_west: 'US West (Oregon)',
        eu_west: 'Europe (Frankfurt)',
        ap_south: 'Asia Pacific (Mumbai)',
      },
      showCancelButton: true,
    });
    displayResult(result);
  });

  document.getElementById('demo-input-radio')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Choose Delivery Speed',
      input: 'radio',
      inputLabel: 'Shipping Method',
      inputOptions: {
        standard: 'Standard Shipping (3-5 days)',
        express: 'Express Shipping (1-2 days)',
        overnight: 'Overnight Delivery (Next morning)',
      },
      inputValue: 'standard',
      showCancelButton: true,
    });
    displayResult(result);
  });

  document.getElementById('demo-input-textarea')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Provide Feedback',
      input: 'textarea',
      inputPlaceholder: 'Tell us how we can improve...',
      showCancelButton: true,
    });
    displayResult(result);
  });

  document.getElementById('demo-input-file')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Upload Configuration',
      input: 'file',
      showCancelButton: true,
      inputAttributes: {
        accept: '.json,.yaml,.yml',
      },
    });
    displayResult(result);
  });

  // 3. Async & Timers
  document.getElementById('demo-async-loader')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Process Payment',
      text: 'Click confirm to initiate the charge of $49.00.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Pay $49.00',
      beforeConfirm: async () => {
        // Simulate network request
        await new Promise((resolve) => setTimeout(resolve, 1500));
        return { status: 'success', receiptId: 'REC-99482' };
      },
    });
    displayResult(result);
  });

  document.getElementById('demo-timer-progress')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Session Timeout',
      text: 'Your session will expire automatically in 3 seconds.',
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: true,
      confirmButtonText: 'Extend Session',
    });
    displayResult(result);
  });

  document.getElementById('demo-multi-step')?.addEventListener('click', async () => {
    const steps = [
      {
        title: 'Step 1 of 3: Account Name',
        input: 'text' as const,
        inputPlaceholder: 'Full Name',
        showCancelButton: true,
      },
      {
        title: 'Step 2 of 3: Account Email',
        input: 'email' as const,
        inputPlaceholder: 'Email Address',
        showCancelButton: true,
      },
      {
        title: 'Step 3 of 3: Confirm Setup',
        text: 'Ready to finish account creation?',
        icon: 'question' as const,
        confirmButtonText: 'Complete',
      },
    ];

    const results = await CspAlert.queue(steps);
    displayResult(results);
  });

  // 4. Toasts & Themes
  document.getElementById('demo-toast-success')?.addEventListener('click', async () => {
    const Toast = CspAlert.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    const result = await Toast.fire({
      icon: 'success',
      title: 'Copied to clipboard!',
    });
    displayResult(result);
  });

  document.getElementById('demo-toast-bottom')?.addEventListener('click', async () => {
    const Toast = CspAlert.mixin({
      toast: true,
      position: 'bottom-start',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    const result = await Toast.fire({
      icon: 'info',
      title: 'New message from Alice',
    });
    displayResult(result);
  });

  document.getElementById('demo-theme-dark')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'Dark Theme Modal',
      text: 'Engineered with tailored dark tokens and high contrast.',
      icon: 'info',
      theme: 'dark',
      showCancelButton: true,
    });
    displayResult(result);
  });

  document.getElementById('demo-theme-contrast')?.addEventListener('click', async () => {
    const result = await CspAlert.fire({
      title: 'High Contrast Mode',
      text: 'Designed specifically for high-visibility accessibility.',
      icon: 'warning',
      theme: 'high-contrast',
      showCancelButton: true,
    });
    displayResult(result);
  });
})();
