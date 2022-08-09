// @ts-check
export class Timer {
  /** @type {HTMLElement} */
  element

  #percentageWarning = 50
  #percentageDanger = 25
  #interval
  #gameTimeLimit = 180
  #time = 180

  constructor() {
    this.element = document.createElement('div')
    this.element.classList.add('timer')
  }

  /** @param {number} seconds */
  /** @param {() => void} callback */
  startCountdown(callback) {
    this.element.classList.toggle('danger', false)
    this.element.classList.toggle('warning', false)
    const intervalRate = Timer.convertSecondsToMS(1)
    const startTime = Timer.convertSecondsToMS(this.#gameTimeLimit)
    this.#time = startTime
    const calculatePercentage = (number, percentage) => {
      return number * percentage / 100
    }
    this.#interval = setInterval(() => {
      this.#time -= intervalRate
      if (this.#time <= 0) {
        clearInterval(this.#interval)
        callback()
      }
      this.element.innerText = Timer.convertTimeToMMSS(this.#time / 1000)
      if (this.#time < calculatePercentage(startTime, this.#percentageWarning) && this.#time > calculatePercentage(startTime, this.#percentageDanger)) {
        this.element.classList.toggle('warning', true)
      } else if (this.#time < calculatePercentage(startTime, this.#percentageDanger)) {
        this.element.classList.remove('warning')
        this.element.classList.toggle('danger', true)
      }
    }, intervalRate)
  }

  get time() {
    return this.#time
  }

  get timeLimit() {
    return this.#gameTimeLimit
  }

  set timeLimit(seconds) {
    this.element.innerText = Timer.convertTimeToMMSS(seconds)
    this.#gameTimeLimit = seconds
  }

  stop() {
    clearInterval(this.#interval)
  }

  /** @param {number} seconds */
  static convertTimeToMMSS(seconds) {
    const minutes = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  /** @param {number} seconds */
  static convertSecondsToMS(seconds) {
    return seconds * 1000
  }

  /** @param {number} minutes */
  static convertMinutesToSeconds(minutes) {
    return minutes * 60
  }
}
