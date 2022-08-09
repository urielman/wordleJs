import { Form } from './forms.js'

const frmContactRef = document.getElementById('frmContact')
const frmContact = new Form(frmContactRef)

frmContact.onSubmit = () => {
  const { name, email, message } = frmContact.data
  window.location.href = `mailto:${email}?subject=Mensaje de ${name} desde Wordle&body=${message}`
}
