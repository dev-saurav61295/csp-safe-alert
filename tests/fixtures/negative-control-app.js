// External script that attempts inline style attribute mutation to trigger securitypolicyviolation
window.__cspViolations = [];
document.addEventListener('securitypolicyviolation', (e) => {
  window.__cspViolations.push({
    blockedURI: e.blockedURI,
    violatedDirective: e.violatedDirective,
  });
});

try {
  const p = document.getElementById('status');
  if (p) {
    p.setAttribute('style', 'color: red;');
  }
} catch {
  // Ignored
}
