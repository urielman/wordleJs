import { LetterStatus } from '../Game/LetterInput.js'

export class Key {
  ref
  #key
  #code
  status = LetterStatus.UNDEFINED
  /**
   * @param {KeyboardEvent['code']} code
   * @param {string} key
   * @param {(letter: Key) => void} [onPressKeyCb]
  */
  constructor (code, key, onPressKeyCb) {
    this.#code = code
    this.#key = key
    this.ref = document.createElement('button')
    this.ref.classList.add('key')
    this.ref.innerText = key
    this.ref.type = 'button'
    this.ref.title = key
    this.onPressKeyCb = onPressKeyCb
    this.ref.addEventListener('click', this.onPressKey.bind(this))

    if (this.code === 'Enter') {
      this.ref.classList.add('enter')
    }

    if (this.code === 'Backspace') {
      this.ref.classList.add('backspace')
      this.ref.innerHTML = '&#9003;'
    }
  }

  onPressKey () {
    this.onPressKeyCb(this)
  }

  get code () {
    return this.#code
  }

  get key () {
    return this.#key
  }
}
