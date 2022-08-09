// @ts-check
import { LetterInput, LetterStatus } from './LetterInput.js'

export class Word {
  /** @type {LetterInput[]} */
  letters = []
  /** @type {Element} element */
  element
  static MAX_LETTERS = 5

  constructor(word = '') {
    if (word.length > 0) {
      Array.from(word).forEach((letter, i) => {
        const newLetter = new LetterInput(i, letter.toUpperCase())
        this.letters.push(newLetter)
      })
    } else {
      for (let i = 0; i < Word.MAX_LETTERS; i++) {
        const newLetter = new LetterInput(i)
        this.letters.push(newLetter)
      }
    }
    this.initializeElement()
  }

  get word() {
    const word = this.letters.reduce((prevChar, letter) => prevChar + letter.letter ?? '', '')
    return word
  }

  initializeElement() {
    this.element = document.createElement('div')
    this.element.classList.add('word')
    this.letters.forEach(letter => {
      this.element.appendChild(letter.element)
    })
  }

  refreshColors() {
    this.letters.forEach(letter => {
      let colorClass = ''
      if (letter.status === LetterStatus.INCLUDED) {
        colorClass = 'included'
      }
      if (letter.status === LetterStatus.MATCHED) {
        colorClass = 'matched'
      }
      if (letter.status === LetterStatus.NOT_INCLUDED) {
        colorClass = 'notincluded'
      }
      if (!colorClass) {
        letter.element.classList.remove('included')
        letter.element.classList.remove('matched')
        letter.element.classList.remove('notincluded')
        return
      }
      letter.element.classList.toggle(colorClass, true)
    })
  }

  clearLetters() {
    this.letters.forEach(letter => {
      letter.clear()
    })
  }

  /** @param {string} word */
  static async digest(word) {
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(word)).then(async (hash) => {
      Array.prototype.map
        .call(
          new Uint8Array(
            await crypto.subtle.digest('SHA-256', new TextEncoder().encode(word))
          ),
          (x) => ('0' + x.toString(16)).slice(-2)
        )
        .join()
    })
  }
}
