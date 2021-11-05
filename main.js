const GAME_STATE = {
  firstCard: 'firstCard',
  secondCard: 'secondCard',
  cardsMatchFailed: 'cardsMatchFailed',
  cardsMatch: 'cardsMatch',
  gameFinished: 'gameFinished',
}

const Symbols = [
  'https://cdn-icons-png.flaticon.com/512/44/44672.png', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://cdn-icons-png.flaticon.com/512/1392/1392994.png' // 梅花
]

const view = {

  getCardContain(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `<p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>
    `
  },

  getCardElements(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  transformNumber(number) {
    switch (number) {  // (number)是一個表達式其結果用來跟每個 case 條件比對。
      case 1:
        return 'A' // 因為這邊使用return，所以不需要break
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },

  displayCards(indexes) {  // 當物件的屬性與函式/變數名稱相同時，可以省略不寫 : displayCards: function displayCards() { ...  }
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElements(index)).join('')
  },

  // flipCard(...card) 可以接受傳入多個參數 (1, 2, 3, 4, 5)
  // 此時...會將參數轉為 [1, 2, 3, 4, 5]
  flipCards(...cards) {
    //若是正面，回傳背面
    // console.log(card)
    cards.map(card => {
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContain(Number(card.dataset.index))
        return
      }

      //若是背面，回傳正面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').textContent = `Score: ${score}`
  },

  renderTriedTimes(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animationend', e => {
        e.target.classList.remove('wrong')
      },
        {
          once: true
        }
      )
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score: ${model.score}</p>
    <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = {
  getRandomNumberArray(count) {
    // count = 5 => [3,0,1,2,4]

    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const model = { // 做資料的管理
  revealedCards: [], // 代表被翻開的卡片

  revealedCardsMatch() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13  // 取除以13後的餘數是否相同來判斷
  },

  score: 0,

  triedTimes: 0
}

const controller = {  // 狀態定義在 controller 裡面
  currentState: GAME_STATE.firstCard,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  // 依照不同的遊戲狀態，做不同的行為
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) { // 這裡做檢查，若是已經翻開的牌，就不做任何的動作
      return;
    }

    switch (this.currentState) {
      case GAME_STATE.firstCard:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.secondCard
        break


      case GAME_STATE.secondCard:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)

        if (model.revealedCardsMatch()) {
          //配對正確
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.cardsMatch
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.gameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.firstCard
        } else {
          //配對失敗
          this.currentState = GAME_STATE.cardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)  // setTimeout 第一個傳入的參數要是 function本身， 1000毫秒為1秒
        }
        break
    }

    console.log('current:', this.currentState)
    console.log('reveal', model.revealedCards)
  },

  resetCards() {

    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    // console.log(this)
    controller.currentState = GAME_STATE.firstCard
  }

}


controller.generateCards()

// querySelectorAll回傳的是 Node list (array-like)
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', (event) => {
    // console.log(card)

    controller.dispatchCardAction(card)
  })
})
