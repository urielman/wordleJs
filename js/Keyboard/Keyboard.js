// @ts-check
// eslint-disable-next-line no-unused-vars
import { LetterInput, LetterStatus } from '../Game/LetterInput.js'
// eslint-disable-next-line no-unused-vars
import { Word } from '../Game/Word.js'
import { Key } from './Key.js'

export class Keyboard {
  /** @type {Key[]} */
  #keys = []
  #ref
  #layout = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['ENVIAR', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
  ]

  /**
   * @param {(key: Key) => void} onPressKeyCb
   */
  constructor (onPressKeyCb) {
    // this.#keys = this.#layout.map(row => row.map(key => new Key(key)))
    for (let i = 0; i < this.#layout.length; i++) {
      for (let j = 0; j < this.#layout[i].length; j++) {
        const key = this.#layout[i][j]
        let code = `Key${key}`
        if (key === 'Ñ') {
          code = 'Semicolon'
        }

        if (key === 'ENVIAR') {
          code = 'Enter'
        }

        if (key === 'BACKSPACE') {
          code = 'Backspace'
        }
        const newKey = new Key(code, key, onPressKeyCb)
        this.#keys.push(newKey)
      }
    }
    this.element = document.createElement('section')
    this.element.classList.add('keyboard')
    document.addEventListener('keydown', this.onListenKeyPress.bind(this, onPressKeyCb))
    this.render()
  }

  /**
   * @param {(key: Key) => void} onPressKeyCb
   * @param {Key} key
   */
  onListenKeyPress (onPressKeyCb, key) {
    if (!this.isValidKey(key)) {
      return
    }
    onPressKeyCb(key)
  }

  /** @param {Key} key */
  isValidKey (key) {
    if ((key.code === 'Semicolon' && key.key === ';')) {
      return false
    }
    return this.#keys.some(k => k.code === key.code)
  }

  render () {
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild)
    }
    for (let i = 0; i < this.#layout.length; i++) {
      const keyRow = document.createElement('div')
      keyRow.classList.add('keyboard__row')
      for (let j = 0; j < this.#layout[i].length; j++) {
        const keyElement = this.#keys.find(k => k.key === this.#layout[i][j])?.ref
        if (keyElement) {
          keyRow.appendChild(keyElement)
        }
      }
      this.element.append(keyRow)
    }
  }

  /** @param {LetterInput[]} letters */
  refreshKeys (letters) {
    letters.forEach((letter, index) => {
      if (letter.status === LetterStatus.MATCHED) {
        const key = this.#keys.find(key => key.key === letter.letter)
        key?.ref.classList.toggle('matched', true)
      }
      if (letter.status === LetterStatus.INCLUDED) {
        const existMatchedLetter = letters.some(l => l.letter === letter.letter && l.status === LetterStatus.MATCHED)
        if (existMatchedLetter) {
          return
        }
        const key = this.#keys.find(key => key.key === letter.letter)
        key?.ref.classList.toggle('included', true)
      }
      if (letter.status === LetterStatus.NOT_INCLUDED) {
        const existIncludedOrMatched = letters.some(l => l.letter === letter.letter && (l.status === LetterStatus.MATCHED || l.status === LetterStatus.INCLUDED))
        if (existIncludedOrMatched) {
          return
        }
        const key = this.#keys.find(key => key.key === letter.letter)
        key?.ref.classList.toggle('notincluded', true)
      }
    })
  }

  clearKeys () {
    this.#keys.forEach((key) => {
      key?.ref.classList.remove('notincluded', 'matched', 'included')
    })
  }
}
