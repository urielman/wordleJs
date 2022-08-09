export class Form {
  #ref
  #inputRefs
  onSubmit = () => {}
  constructor (ref) {
    this.#ref = ref
    this.#inputRefs = this.#ref.querySelectorAll('[name]')

    this.#inputRefs.forEach(input => {
      const validations = input.dataset.rules
      const name = input.name
      if (!validations) return

      input.addEventListener('blur', e => {
        // const res = validation.test(input.value);
        const res = this.#validateInput(validations, input.value, name)
        if (res.result) {
          this.#setErrorMessageVisibility(input, false, res.message)
          return
        }
        this.#setErrorMessageVisibility(input, true, res.message)
      })

      input.addEventListener('focus', e => {
        this.#setErrorMessageVisibility(input, false)
      })
    })

    this.#ref.addEventListener('submit', e => {
      e.preventDefault()
      if (this.#onValidate()) {
        this.onSubmit()
      }
    })
  }

  get data () {
    const formData = new FormData(this.#ref)
    const data = {}
    for (const key of formData.keys()) {
      const value = formData.getAll(key)
      data[key] = value.length > 1 ? value : value[0]
    }
    return data
  }

  #validateInput = (toValidate, inputValue, name) => {
    const rules = toValidate.replace(/\s/g, '').split(',')
    const validations = rules.map(rule => rule.split(':'))

    let result = false
    let message = ''
    validations.some(validation => {
      const [rule, value] = validation
      switch (rule) {
        case 'type':
          switch (value) {
            case 'alphanumeric':
              result = /^\w+$/.test(inputValue)
              message = 'Debe ser alfanumérico'
              break
            case 'email':
              result = this.#checkEmail(inputValue)
              message = 'Debe ser un correo electrónico.'
              break
            case 'password':
              result = /^(?=.*[0-9])(?=.*[a-zA-Z])([a-zA-Z0-9]+)$/.test(inputValue)
              message = 'Debe tener al menos un número y una letra.'
              break
            case 'phone':
              result = /^[0-9]{7,}$/.test(inputValue)
              message = 'Debe contener al menos 7 números y sin símbolos o espacios.'
              break
            case 'number':
              result = !isNaN(inputValue) && !isNaN(parseFloat(inputValue))
              message = 'Debe ser un número.'
              break
            case 'address':
              result = /^[a-zA-Z]*\s[0-9]*$/.test(inputValue)
              message = 'Debe contener calle y altura, con un espacio en el medio.'
              break
            case 'letters':
              result = /^[a-zA-Z\s]*$/.test(inputValue)
              message = 'No son solo letras.'
              break
          }
          break
        case 'minlength':
          result = inputValue.trim().length >= value
          message = 'Debe tener más de ' + value + ' caracteres.'
          break
        case 'maxlength':
          result = inputValue.trim().length <= value
          break
        case 'min':
          message = 'Debe ser mayor a ' + value
          result = +inputValue > value
          break
        case 'max':
          message = 'Debe ser menor a ' + value
          result = +inputValue < value
          break
        case 'required':
          switch (value) {
            case 'radio':
            {
              message = `El campo ${name} es requerido`
              const radios = this.#ref.querySelectorAll(`input[name="${name}"][type="radio"]`)
              result = Array.from(radios).some(radio => radio.checked)
              break
            }
            case 'checkbox':
            {
              message = `El campo ${name} es requerido`
              const checkboxes = this.#ref.querySelectorAll(`input[name="${name}"][type="checkbox"]`)
              result = Array.from(checkboxes).some(checkbox => checkbox.checked)
              break
            }
            default:
              message = 'El campo es requerido'
              result = inputValue.trim().length > 0
              break
          }
      }

      return !result
    })
    return {
      result,
      message
    }
  }

  #setErrorMessageVisibility = (input, value, message) => {
    const label = input.parentElement.querySelector('label')
    const errorDiv = input.parentElement.querySelector('div.error')
    input.classList.toggle('error', value)
    if (label) label.classList.toggle('error', value)
    if (errorDiv) {
      errorDiv.classList.toggle('error--shown', value)
      errorDiv.querySelector('p.errorMessage').textContent = message
    }
    if (input.type === 'radio') {
      const radios = this.#ref.querySelectorAll(`input[name="${input.name}"][type="radio"]`)
      radios.forEach(radio => {
        radio.classList.toggle('error', value)
        const label = radio.parentNode.getElementsByTagName('label')[0]
        radio.parentElement.querySelector('div.error').classList.toggle('error--shown', value)
        label.classList.toggle('error', value)
      })
    }

    if (input.type === 'checkbox') {
      const checkboxes = this.#ref.querySelectorAll(`input[name="${input.name}"][type="checkbox"]`)
      checkboxes.forEach(checkbox => {
        checkbox.classList.toggle('error', value)
        const label = checkbox.parentNode.getElementsByTagName('label')[0]
        checkbox.parentElement.querySelector('div.error').classList.toggle('error--shown', value)
        label.classList.toggle('error', value)
      })
    }
  }

  #onValidate = () => {
    let status = true
    this.#inputRefs.forEach(input => {
      const validations = input.dataset.rules
      const res = this.#validateInput(validations, input.value, input.name)
      status = !res.result ? res.result : status
      if (res.result) {
        this.#setErrorMessageVisibility(input, false, res.message)
        return
      }
      this.#setErrorMessageVisibility(input, true, res.message)
    })
    return status
  }

  #checkEmail (emailAddress) {
    return /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/.test(emailAddress)
  }

  setError (name, message) {
    const input = Array.from(this.#inputRefs).find(ref => ref.name === name)
    this.#setErrorMessageVisibility(input, true, message)
  }
}
