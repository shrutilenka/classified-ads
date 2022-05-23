// expects __UXConstraints__

export function markRequiredInputs() {
    if (!window.__UXConstraints__) return
    for (let [formName, constraint] of Object.entries(window.__UXConstraints__)) {
        if (constraint.requiredUXInputs.length === 0) continue
        const form = document.querySelector(`form[name="${formName}"]`)
        if (form) {
            const inputs = form.elements
            for (let i = 0; i < inputs.length; i++) {
                if (
                    inputs[i].nodeName === 'INPUT' &&
                    constraint.requiredUXInputs.indexOf(inputs[i].name) > -1
                ) {
                    inputs[i].setAttribute('required', 'required')
                }
                if (inputs[i].nodeName === 'INPUT' && constraint.minInputs[inputs[i].name]) {
                    inputs[i].setAttribute('minlength', constraint.minInputs[inputs[i].name])
                }
            }
        }
    }
}

export function updatePostPostInputs() {
    if (!window.__formData__) return
    for (let [inputName, value] of Object.entries(window.__formData__)) {
        const input = document.querySelector(`input[name="${inputName}"]`)
        if (input) {
            input.value = value
        }
    }
}
