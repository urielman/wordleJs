class WordRepository {
  #words = []

  async initWords () {
    const words = await fetch('./data/words.json')
    const data = await words.json()
    this.#words = data
  }

  findWord (word) {
    const normalizedWord = this.#normalizeWord(word)
    return this.#words.some(w => this.#normalizeWord(w) === normalizedWord)
  }

  getRandomWord () {
    return this.#words[Math.floor(Math.random() * this.#words.length)]
  }

  async loadWords () {
    return fetch('./data/words.json').then(data => data.json())
      .then(words => {
        this.#words = words
      })
  }

  #normalizeWord (word) {
    return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  }
}

export const wordRepository = new WordRepository()
