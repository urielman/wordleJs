// @ts-check

/**
 * @readonly
 * @enum {number}
 */
export const LetterStatus = Object.freeze({
  UNDEFINED: 0,
  MATCHED: 1,
  INCLUDED: 2,
  NOT_INCLUDED: 3
})

export class LetterInput {
  #letter
  index
  /** @type {LetterStatus} */
  status = LetterStatus.UNDEFINED
  /** @type {HTMLElement} */
  element

  /**
   * @param {number} index
   * @param {string} [letter]
   */
  constructor(index, letter) {
    this.#letter = letter ?? ''
    this.index = index

    this.initializeElement()
  }

  initializeElement() {
    this.element = document.createElement('div')
    this.element.classList.add('letter')
    this.element.innerText = this.letter
  }

  get letter() {
    return this.#letter
  }

  set letter(letter) {
    const newLetter = letter?.toUpperCase()
    this.#letter = newLetter
    this.element.innerText = newLetter
  }

  isEmpty() {
    return this.#letter?.length === 0
  }

  clear() {
    this.letter = ''
    this.status = LetterStatus.UNDEFINED
  }
}
