// @ts-check
import { wordRepository } from '../../data/WordRepository.js'
// eslint-disable-next-line no-unused-vars
import { LetterInput, LetterStatus } from './LetterInput.js'
import { Scoreboard } from './Scoreboard.js'
import { Timer } from './Timer.js'
import { Word } from './Word.js'
// eslint-disable-next-line no-unused-vars
import { Wordle } from './Wordle.js'

export const GameStatus = Object.freeze({
  IN_PROGRESS: 0,
  VICTORY: 1,
  DEFEAT: 2
})

export class Gameboard {
  game
  #wordToGuess
  /** @type {Scoreboard} */
  scoreboard
  status = GameStatus.IN_PROGRESS
  /**
   * @type {{
   *  matched: LetterInput[],
   *  included: LetterInput[],
   *  notIncluded: LetterInput[],
   * }}
   */
  score = {
    matched: [],
    included: [],
    notIncluded: []
  }

  nameElement
  playerName = ''

  currentLetter = {
    wordNumber: 0,
    letterNumber: 0
  }

  /** @type {Timer} */
  timer
  /** @type {Word[]} */
  wordInputs = []

  round = 1

  get wordToGuess() { return this.#wordToGuess }

  /**
   * @param {Wordle} game
   */
  constructor(game) {
    this.scoreboard = new Scoreboard()
    this.repository = wordRepository
    this.timer = new Timer()
    this.game = game
  }

  /** @param {Word} word */
  set wordToGuess(word) {
    this.#wordToGuess = word
  }

  setRandomWord() {
    const newRandomWord = this.repository.getRandomWord()
    this.wordToGuess = new Word(newRandomWord)
  }

  /** @param {number} seconds */
  setGameTimeLimit(seconds) {
    this.timer.timeLimit = seconds
  }

  startGame() {
    this.setRandomWord()
    this.status = GameStatus.IN_PROGRESS
    this.timer.startCountdown(this.endGameInDefeat)
  }

  clearWords() {
    this.wordInputs.forEach(word => {
      word.clearLetters()
    })
    this.wordInputs.forEach(word => {
      word.refreshColors()
    })
  }

  showWord() {
    const wrapper = document.createElement('div')
    wrapper.classList.add('modal_wrapper')
    const element = document.createElement('div')
    element.classList.add('info', 'modal')
    element.innerHTML = `
    <div>
      <h1 class="h1">${this.status === GameStatus.DEFEAT ? 'Derrota' : ''}</h1>
      <p>La palabra a adivinar era <strong>${this.wordToGuess.word}</strong></p>
      <button id="btnLoadGame" class="btn" type="button" title="Cargar partida">Cargar partida</button>
      <button id="btnPlayAgain" class="btn btnPlay" type="button" title="Jugar de nuevo">Jugar de nuevo</button>
    </div>`
    wrapper.appendChild(element)
    document.body.appendChild(wrapper)

    element.querySelector('#btnPlayAgain')?.addEventListener('click', () => {
      Wordle.startGame(this.playerName, this.game.game)
      document.body.removeChild(wrapper)
    })
    element.querySelector('#btnLoadGame')?.addEventListener('click', () => {
      document.body.removeChild(wrapper)
      this.game.showSaveGameMenu()
    })
  }

  endGameInDefeat = () => {
    if (this.status !== GameStatus.DEFEAT) {
      this.status = GameStatus.DEFEAT
      this.timer.stop()
      this.showWord()
      this.scoreboard.saveGame({
        playerName: this.playerName,
        remainingSeconds: this.timer.time,
        wordToGuess: this.wordToGuess.word,
        status: this.status,
      })
    }
  }

  saveGame = () => {
    this.scoreboard.saveGame({
      playerName: this.playerName,
      remainingSeconds: this.timer.time,
      wordToGuess: this.wordToGuess.word,
      status: this.status,
    })
  }

  endGameInVictory = () => {
    this.status = GameStatus.VICTORY
    this.timer.stop()

    const victoryMessage = document.createElement('div')
    victoryMessage.className = 'info modal'
    victoryMessage.innerHTML = `
      <div class="mainMenu">
        <h3 class="h3">Victoria!</h3>
        <button id="btnLoadGame" class="btn btnLoadGame" type="button" title="Cargar partida">Cargar partida</button>
        <button id="btnPlayAgain" class="btn btnPlay" type="button" title="Jugar de nuevo">Jugar de nuevo</button>
      </div>
      `
    victoryMessage.querySelector('#btnLoadGame')?.addEventListener('click', () => {
      document.body.removeChild(victoryMessage)
      this.game.showSaveGameMenu()
    })
    victoryMessage.querySelector('#btnPlayAgain')?.addEventListener('click', () => {
      document.body.removeChild(victoryMessage)
      // this.resetGame()
      Wordle.startGame(this.playerName, this.game.game)
    })
    document.body.appendChild(victoryMessage)
    this.scoreboard.saveGame({
      playerName: this.playerName,
      remainingSeconds: this.timer.time,
      wordToGuess: this.wordToGuess.word,
      status: this.status,
    })
  }

  /** @param {Word} word */
  validateWord = (word, addToScore = true) => {
    const wordExist = this.repository.findWord(word.word)
    if (!wordExist) {
      alert('La palabra no está en la lista')
      return false
    }
    let currentScore = 0
    for (const letter of word.letters) {
      if (!this.#wordToGuess.letters.some(l => l.letter === letter.letter)) {
        this.score.notIncluded.push(letter)
        letter.status = LetterStatus.NOT_INCLUDED
        continue
      }
      const letterAtSameIndex = this.#wordToGuess.letters.find(l => l.index === letter.index)
      if (letter.letter === letterAtSameIndex?.letter) {
        this.score.matched.push(letter)
        letter.status = LetterStatus.MATCHED
        currentScore++
        continue
      }
      this.score.included.push(letter)
      letter.status = LetterStatus.INCLUDED
    }

    word.refreshColors()
    if (addToScore) {
      this.scoreboard.addWordToScore(word)
    }
    if (currentScore === Word.MAX_LETTERS) {
      this.endGameInVictory()
      return
    }
    if (this.round >= 6) {
      // Verifies if max round
      this.endGameInDefeat()
      // Clear interval
    }
    this.round++
    return true
  }
}
