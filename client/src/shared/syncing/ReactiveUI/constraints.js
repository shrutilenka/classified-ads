// expects __UXConstraints__

export function markRequiredInputs() {
  
  for (let [formName, constraint] of Object.entries(window.__UXConstraints__)) {
    if (constraint.requiredUXInputs.length === 0)
      continue
    const form = document.querySelector(`form[name="${formName}"]`)
    if (form) {
      const inputs = form.elements
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].nodeName === "INPUT" && constraint.requiredUXInputs.indexOf(inputs[i].name) > -1) {
          inputs[i].setAttribute('required', 'required');
        }
      }
    }
  }
}
