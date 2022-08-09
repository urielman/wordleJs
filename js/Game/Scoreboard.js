// @ts-check
// eslint-disable-next-line no-unused-vars
import { Word } from './Word.js'

export class Scoreboard {
  static SCORE_KEY = 'wordle_score'
  /** @type {string[]} */
  enteredWords
  constructor() {
    this.enteredWords = []
  }

  /** @param {Word} word */
  addWordToScore(word) {
    this.enteredWords.push(word.word)
  }

  /** @param {{playerName: string; wordToGuess: string; remainingSeconds: number; status: number}} data */
  saveGame(data) {
    const saveGame = {
      playerName: data.playerName,
      wordToGuess: data.wordToGuess,
      score: this.enteredWords,
      remainingSeconds: data.remainingSeconds / 1000,
      date: new Date(),
      status: data.status
    }
    const savedGames = Scoreboard.getSavedGamesList()
    savedGames.push(saveGame)
    localStorage.setItem(Scoreboard.SCORE_KEY, JSON.stringify(savedGames))
  }

  /** @param {{playerName: string; wordToGuess: string; remainingSeconds: number; score: string[]}} savedGame */
  loadScore(savedGame) {
    this.enteredWords = savedGame.score
  }

  static getSavedGamesList() {
    const savedGames = localStorage.getItem(Scoreboard.SCORE_KEY)
    if (!savedGames) {
      return []
    }
    const savedData = JSON.parse(savedGames)
    const savedGameList = savedData.map(game => ({
      playerName: game.playerName,
      wordToGuess: game.wordToGuess,
      score: game.score,
      remainingSeconds: game.remainingSeconds,
      date: new Date(game.date),
      status: game.status,
    }))
    return savedGameList
  }
}
