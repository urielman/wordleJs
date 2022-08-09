// @ts-check

// eslint-disable-next-line no-unused-vars
import { Key } from '../Keyboard/Key.js'
import { Keyboard } from '../Keyboard/Keyboard.js'
import { Gameboard, GameStatus } from './Gameboard.js'
import { Word } from './Word.js'

export const GameUIStatus = Object.freeze({
  LOBBY: 0,
  PLAYING: 1,
  HOWTOPLAYMENU: 2,
  SAVEGAMEMENU: 3
})

export class Wordle {
  status = GameUIStatus.LOBBY

  /** @type {{elem: HTMLElement | null; showLoadGameMenu: () => void}} */
  game
  gameboard
  /** @type {Keyboard} */
  keyboard

  numberOfWords = 6

  /** @type {HTMLDivElement} */
  elem
  /** @param {{elem: HTMLElement | null; showLoadGameMenu: () => void}} game */
  constructor(game) {
    this.gameboard = new Gameboard(this)
    this.game = game
    this.elem = document.createElement('div')
    this.elem.id = 'wordleContainer'
    this.elem.classList.add('container')
    game.elem?.appendChild(this.elem)
  }

  /** @param {{playerName: string; wordToGuess: string; remainingSeconds: number; score: string[]}} [savedGame] */
  initializeElement(savedGame) {
    const btnShowHowToPlay = document.createElement('button')
    btnShowHowToPlay.type = 'button'
    btnShowHowToPlay.title = 'Mostrar cómo jugar'
    btnShowHowToPlay.innerText = 'Cómo Jugar'
    btnShowHowToPlay.addEventListener('click', this.showHowToPlay.bind(this))
    btnShowHowToPlay.className = 'btnShowHowToPlay'
    const nameElement = document.createElement('p')
    nameElement.innerText = `Jugador: ${this.gameboard?.playerName || 'Anónimo'}`
    nameElement.className = 'playerName paddingBottom'

    const btnShowSaveGameMenu = document.createElement('button')
    btnShowSaveGameMenu.innerText = 'Cargar partida'
    btnShowSaveGameMenu.className = 'btn btnPlay paddingBottom'
    btnShowSaveGameMenu.addEventListener('click', () => {
      this.showSaveGameMenu()
      this.status = GameUIStatus.SAVEGAMEMENU
      this.gameboard.timer.stop()
    })
    const btnSaveGame = document.createElement('button')
    btnSaveGame.title = 'Guardar partida'
    btnSaveGame.innerText = 'Guardar partida'
    btnSaveGame.className = 'btn btnLoadGame paddingBottom'
    btnSaveGame.addEventListener('click', () => {
      this.gameboard.saveGame()
    })
    const btnContainer = document.createElement('div')
    btnContainer.className = 'btnContainer'
    btnContainer.appendChild(btnSaveGame)
    btnContainer.appendChild(btnShowSaveGameMenu)

    this.elem.appendChild(btnContainer)
    this.elem.appendChild(nameElement)
    this.elem.appendChild(btnShowHowToPlay)
    this.elem.appendChild(this.gameboard.timer.element)
    // START COUNTDOWN
    this.gameboard.startGame()
    const wordleWrapper = document.createElement('div')
    wordleWrapper.classList.add('wordle')
    // LOADING WORDS
    if (savedGame?.wordToGuess) {
      this.gameboard.wordToGuess = new Word(savedGame.wordToGuess)
    } else {
      this.gameboard.setRandomWord()
    }
    for (let i = 0; i < this.numberOfWords; i++) {
      const word = this.gameboard?.scoreboard?.enteredWords[i] ?? undefined
      const newWord = new Word(this.gameboard.scoreboard.enteredWords[i] || '')
      this.gameboard.wordInputs.push(newWord)
      if (word) {
        this.validateWord(false)
      }
      wordleWrapper.appendChild(newWord.element)
    }
    this.keyboard = new Keyboard(this.onPressKey.bind(this))
    this.elem.appendChild(wordleWrapper)
    this.elem.appendChild(this.keyboard.element)
    this.refreshKeys()
  }

  setPlayerName(name) {
    this.gameboard.playerName = name
  }

  validateWord(addToScore = true) {
    const round = this.gameboard.round - 1
    const word = this.gameboard.wordInputs[round]
    if (word.letters.some(letter => letter.isEmpty())) {
      return
    }
    if (this.gameboard.validateWord(word, addToScore)) {
      this.gameboard.currentLetter.wordNumber++
      this.gameboard.currentLetter.letterNumber = 0
    }
  }

  showSaveGameMenu() {
    this.game.showLoadGameMenu()
  }

  refreshKeys() {
    const letters = this.gameboard.wordInputs.flatMap(word => word.letters)
    this.keyboard.refreshKeys(letters)
  }

  /**
   * @param {Key} key
   */
  onPressKey(key) {
    if (this.status !== GameUIStatus.PLAYING || this.gameboard.status !== GameStatus.IN_PROGRESS) {
      return
    }
    const currentLetterInput = this.gameboard.wordInputs[this.gameboard.currentLetter.wordNumber].letters[this.gameboard.currentLetter.letterNumber]
    switch (key.code) {
      case 'Enter': {
        this.validateWord()
        this.refreshKeys()
        break
      }
      case 'Backspace': {
        if (this.gameboard.currentLetter.letterNumber <= 0) {
          return
        }
        const previousLetterInput = this.gameboard.wordInputs[this.gameboard.currentLetter.wordNumber].letters[this.gameboard.currentLetter.letterNumber - 1]
        previousLetterInput.letter = ''
        this.gameboard.currentLetter.letterNumber--
        break
      }
      default:
        if (this.gameboard.currentLetter.letterNumber >= Word.MAX_LETTERS) {
          return
        }
        currentLetterInput.letter = key.key
        this.gameboard.currentLetter.letterNumber++
        break
    }
  }

  startGame() {
    this.status = GameUIStatus.PLAYING
    this.initializeElement()
  }

  showHowToPlay() {
    if (this.status === GameUIStatus.HOWTOPLAYMENU) return
    this.status = GameUIStatus.HOWTOPLAYMENU
    const elem = document.createElement('div')
    elem.classList.add('info')
    elem.innerHTML = `
      <div class="info__header">
        <button id="btnCloseHowToPlay" type="button" title="Cerrar">&times;</button>
      </div>
      <h1>Cómo jugar</h1>
      <p>Adiviná la palabra oculta en seis intentos</p>
      <p>Cada intento debe ser una palabra válida de cinco letras</p>
      <p>Después de cada intento el color de las letras cambia para mostrar qué tanto te acercaste a la palabra</p>
      <p><strong>Ejemplos</strong></p>
      <div class="word">
        <div class="letter matched">L</div>
        <div class="letter">E</div>
        <div class="letter">T</div>
        <div class="letter">R</div>
        <div class="letter">A</div>
      </div>
      <p>La letra <strong>L</strong> está en la palabra y en la posición correcta</p>
      <div class="word">
        <div class="letter">B</div>
        <div class="letter">R</div>
        <div class="letter included">O</div>
        <div class="letter">T</div>
        <div class="letter">E</div>
      </div>
      <p>La letra <strong>O</strong> está en la palabra pero no en la posición correcta</p>
      <div class="word">
        <div class="letter">B</div>
        <div class="letter">O</div>
        <div class="letter">L</div>
        <div class="letter">S</div>
        <div class="letter notincluded">A</div>
      </div>
      <p>La letra <strong>A</strong> no está en la palabra</p>
      <p>Puede haber letras repetidas y en ese caso, las pistas son independientes para cada letra y tienen prioridad</p>
    `
    elem.querySelector('#btnCloseHowToPlay')?.addEventListener('click', () => {
      this.status = GameUIStatus.PLAYING
      this.elem.removeChild(elem)
    })
    this.elem.appendChild(elem)
  }

  /**
   * @param {string} playerName
   * @param {{elem: HTMLElement | null; showLoadGameMenu: () => void}} game
   */
  static startGame(playerName, game) {
    while (game.elem?.firstChild) {
      game.elem.removeChild(game.elem.firstChild)
    }
    const newGame = new Wordle(game)
    newGame.setPlayerName(playerName)
    newGame.startGame()
  }

  static loadGame(savedGame, game) {
    const loadedGame = new Wordle(game)
    loadedGame.loadGame(savedGame)
  }

  /** @param {{playerName: string; wordToGuess: string; remainingSeconds: number; score: string[]}} savedGame */
  loadGame(savedGame) {
    this.gameboard.wordToGuess = new Word(savedGame.wordToGuess)
    this.gameboard.scoreboard.loadScore(savedGame)
    this.gameboard.setGameTimeLimit(savedGame.remainingSeconds)
    this.setPlayerName(savedGame.playerName)
    this.status = GameUIStatus.PLAYING
    this.initializeElement(savedGame)
  }
}
