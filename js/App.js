//  @ts-check
// import { wordRepository } from '../data/WordRepository.js'
import { wordRepository } from '../data/WordRepository.js'
import { GameStatus } from './Game/Gameboard.js'
import { Scoreboard } from './Game/Scoreboard.js'
import { Timer } from './Game/Timer.js'
import { Wordle } from './Game/Wordle.js'

const wordleWrapper = document.getElementById('wordle')

const mainMenu = document.createElement('div')

const startNewGame = () => {
  const nameInput = document.createElement('div')
  const formName = document.createElement('form')
  formName.className = 'frmPlayerName'
  nameInput.appendChild(formName)
  formName.innerHTML = `
    <label for="name">Nombre</label>
    <input type="text" name="name" id="name" required />
    <button class="btn btnPlay" type="submit" title="Empezar">Empezar</button>`
  formName.classList.add('wordle')
  formName.addEventListener('submit', (e) => {
    e.preventDefault()
    const formData = new FormData(formName)
    const playerName = formData.get('name')?.toString() || ''
    wordleWrapper?.removeChild(nameInput)
    Wordle.startGame(playerName, {
      elem: wordleWrapper,
      showLoadGameMenu
    })
  })
  wordleWrapper?.appendChild(nameInput)
  wordleWrapper?.removeChild(mainMenu)
}

const loadGame = (savedGame) => {
  Wordle.loadGame(savedGame, {
    elem: wordleWrapper,
    showLoadGameMenu
  })
}

// mostrar menu "partidas guardadas"
const showLoadGameMenu = () => {
  while (wordleWrapper?.firstChild) {
    wordleWrapper.removeChild(wordleWrapper.firstChild)
  }
  const saveGameMenu = document.createElement('div')
  saveGameMenu.className = 'info'
  const savedGames = Scoreboard.getSavedGamesList()
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-AR').format(date)
  }

  saveGameMenu.innerHTML = `
  <div class="info__header">
      <button id="btnCloseSaveGameMenu" type="button" title="Cerrar" onclick="close">&times;</button>
  </div>
  <h3 class="h3">Partidas guardadas</h3>
  <ul id="savedGamesList" class="savedGamesList"></ul>`
  const savedGamesList = saveGameMenu.querySelector('#savedGamesList')

  if (savedGames.length === 0) {
    const emptyMessage = document.createElement('p')
    emptyMessage.innerText = 'No hay partidas guardadas'
    savedGamesList?.appendChild(emptyMessage)
  }

  savedGames.forEach(savedGame => {
    if (savedGame?.status === GameStatus.IN_PROGRESS) {
      const btn = document.createElement('button')
      btn.className = 'btnLoad'
      btn.innerHTML = `<span class="bold">${formatDate(savedGame.date)}</span>
      <span><strong>Tiempo restante: </strong>${Timer.convertTimeToMMSS(savedGame.remainingSeconds)}</span>
      <span>${savedGame.playerName}</span>`
      btn.addEventListener('click', (e) => {
        loadGame(savedGame)
        wordleWrapper?.removeChild(saveGameMenu)
      })
      const li = document.createElement('li')
      li.appendChild(btn)
      savedGamesList?.appendChild(li)
    }
  })

  // boton para cerrar el modal
  saveGameMenu.querySelector('#btnCloseSaveGameMenu')?.addEventListener('click', () => {
    wordleWrapper?.removeChild(saveGameMenu)
    showMainMenu()
  })

  wordleWrapper?.appendChild(saveGameMenu)
}

// mostrar menu "ganadores"
const showWinners = () => {
  while (wordleWrapper?.firstChild) {
    wordleWrapper.removeChild(wordleWrapper.firstChild)
  }
  const saveGameMenu = document.createElement('div')
  saveGameMenu.className = 'info'
  const savedGames = Scoreboard.getSavedGamesList()
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-AR').format(date)
  }

  saveGameMenu.innerHTML = `
  <div class="info__header">
      <button id="btnCloseWinners" type="button" title="Cerrar" onclick="close">volver</button>
  </div>
  <h3 class="h3">Partidas ganadas</h3>
  <ul id="savedGamesList" class="savedGamesList"></ul>`
  const savedGamesList = saveGameMenu.querySelector('#savedGamesList')
  if (savedGames.length === 0 || !savedGames.some(savedGame => savedGame.status === GameStatus.VICTORY)) {
    const emptyMessage = document.createElement('p')
    emptyMessage.innerText = 'No hay partidas ganadas'
    savedGamesList?.appendChild(emptyMessage)
  }

  savedGames.forEach(savedGame => {
    if (savedGame?.status === GameStatus.VICTORY) {
      const btn = document.createElement('button')
      btn.className = 'btnLoad'
      btn.innerHTML = `<span class="bold">${formatDate(savedGame.date)}</span>
    <span><strong>Tiempo restante: </strong>${Timer.convertTimeToMMSS(savedGame.remainingSeconds)}</span>
    <span>${savedGame.playerName}</span>
    <span>Palabra: ${savedGame.wordToGuess}</span>`
      const li = document.createElement('li')
      li.appendChild(btn)
      savedGamesList?.appendChild(li)
    }
  })

  // boton para cerrar el modal
  saveGameMenu.querySelector('#btnCloseWinners')?.addEventListener('click', () => {
    wordleWrapper?.removeChild(saveGameMenu)
    showMainMenu()
  })



  // ordenar por puntaje
  wordleWrapper?.appendChild(saveGameMenu)
}

// mostrar menu "partidas"
const showHistory = () => {
  while (wordleWrapper?.firstChild) {
    wordleWrapper.removeChild(wordleWrapper.firstChild)
  }
  const saveGameMenu = document.createElement('div')
  saveGameMenu.className = 'info'
  const savedGames = Scoreboard.getSavedGamesList()
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('es-AR').format(date)
  }

  saveGameMenu.innerHTML = `
  <div class="info__header">
      <button id="btnCloseHistory" type="button" title="Cerrar" onclick="close">volver</button>
  </div>
  <h3 class="h3">Historico</h3>
  <button id="btnSortByPoints" class="btnSort sortActive"type="button" title="Ordenar por Puntaje (tiempo restante)">Ordenar por Puntaje (tiempo restante)</button>
  <button id="btnSortByDate" class="btnSort" type="button" title="Ordenar Por Fecha">Ordenar por Fecha</button>
  <div id="listContainer"></div>`
  const savedGamesList = saveGameMenu.querySelector('#listContainer')
  if (savedGames.length === 0 || !savedGames.some(savedGame => savedGame.status === GameStatus.VICTORY)) {
    const emptyMessage = document.createElement('p')
    emptyMessage.innerText = 'No hay partidas'
    savedGamesList?.appendChild(emptyMessage)
  }

  //sorted by date by default
  const gamesSortedByDate = [...savedGames];
  // sort by points
  savedGames.sort((a, b) => {
    return b.remainingSeconds - a.remainingSeconds
  }).sort((a, b) => {
    return a.status - b.status
  })

  const loadGames = (gameList) => {
    const listContainer = document.createElement('ul')
    listContainer.className = 'savedGamesList'
    listContainer.id = 'savedGamesList'
    gameList.forEach(savedGame => {
      if (savedGame?.status !== GameStatus.IN_PROGRESS) {
        const btn = document.createElement('button')
        btn.className = `btnLoad ${savedGame.status === GameStatus.VICTORY ? 'victory' : 'defeat'}`
        btn.innerHTML = `<span class="bold">${formatDate(savedGame.date)}</span>
      <span><strong>Tiempo restante: </strong>${Timer.convertTimeToMMSS(savedGame.remainingSeconds)}</span>
      <span>${savedGame.playerName}</span>
      <span>Palabra: ${savedGame.wordToGuess}</span>`
        const li = document.createElement('li')
        li.appendChild(btn)
        listContainer?.appendChild(li)
      }
    })
    saveGameMenu.appendChild(listContainer)
  }
  loadGames(savedGames)

  // boton para cerrar el modal
  saveGameMenu.querySelector('#btnCloseHistory')?.addEventListener('click', () => {
    wordleWrapper?.removeChild(saveGameMenu)
    showMainMenu()
  })

  const btnSortByDate = saveGameMenu.querySelector('#btnSortByDate');
  const btnSortByPoints = saveGameMenu.querySelector('#btnSortByPoints');
  // boton ordenar por fecha
  btnSortByDate?.addEventListener('click', () => {
    btnSortByDate.classList.add('sortActive')
    btnSortByPoints?.classList.remove('sortActive')

    const listContainer = saveGameMenu.querySelector('#savedGamesList')
    if (listContainer) {
      saveGameMenu.removeChild(listContainer)
    }
    loadGames(gamesSortedByDate)
  })

  // boton ordenar por puntos
  btnSortByPoints?.addEventListener('click', () => {
    btnSortByPoints.classList.add('sortActive')
    btnSortByDate?.classList.remove('sortActive')

    const listContainer = saveGameMenu.querySelector('#savedGamesList')
    if (listContainer) {
      saveGameMenu.removeChild(listContainer)
    }
    loadGames(savedGames)
  })

  wordleWrapper?.appendChild(saveGameMenu)
}

// menu principal
const showMainMenu = () => {
  mainMenu.className = 'info mainMenu'
  mainMenu.innerHTML = `
    <h1 class="h1 title">Wordle</h1>
    <button id="btnPlay" type="button" class="btn btnPlay" title="Jugar">Nuevo juego</button>
    <button class="btn btnLoadGame" id="btnLoadGame" type="button" title="Cargar partida">Cargar partida</button>
    <button class="btn btnWinners" id="winners" type="button" title="Ganadores">Ganadores</button>
    <button class="btn btnHistory" id="history" type="button" title="Ganadores">Partidas</button>

    `
  wordleWrapper?.appendChild(mainMenu)
  mainMenu.querySelector('#btnPlay')?.addEventListener('click', startNewGame)
  mainMenu.querySelector('#btnLoadGame')?.addEventListener('click', () => {
    wordleWrapper?.removeChild(mainMenu)
    showLoadGameMenu()
  })
  mainMenu.querySelector('#winners')?.addEventListener('click', () => {
    wordleWrapper?.removeChild(mainMenu)
    showWinners()
  })
  mainMenu.querySelector('#history')?.addEventListener('click', () => {
    wordleWrapper?.removeChild(mainMenu)
    showHistory()
  })
}

wordRepository.loadWords().then(() => {
  showMainMenu()
})
