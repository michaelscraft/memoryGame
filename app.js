/*eslint-disable*/

const starWarsAnimation = document.querySelector('.starwars');
const header = document.querySelector('header');
const container = document.querySelector('#container');
let cardCount = 0;
let cardQueue = [];
let flipCounter = 0;
let scoreCounter = 0;

// Intro Animation
starWarsAnimation.addEventListener('animationend', () => {
  starWarsAnimation.style.display = 'none';
  header.style.opacity = '1';
  container.style.opacity = '1';
}, false);

// -----------UTIL-----------

/**
 * @param {string} type - node type
 * @param {Array} classname - Array of class names
 *
 * @param {Object[]} attr
 * @param {string} key - Attribute name.
 * @param {string} value - Attribute value.
 */

const node = (type, classnames, attrs) => {
  const newNode = document.createElement(type);
  if (classnames) {
    classnames.forEach((classname) => {
      newNode.classList.add(classname);
    });
  }
  if (attrs) {
    Object.entries(attrs).forEach((attr) => {
      newNode.setAttribute(attr[0], attr[1]);
    });
  }
  return newNode;
};

// creating card pair

const makePair = (arr) => [...arr, ...arr];

// shuffle array
const shuffle = (arr) => {
  const shuffledArr = [...arr];

  // eslint-disable-next-line no-plusplus
  for (let i = shuffledArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffledArr[i];
    shuffledArr[i] = shuffledArr[j];
    shuffledArr[j] = temp;
  }

  return shuffledArr;
};
// -----------END UTIL-----------
// check for pairs
const checkForPair = (prev, curr) => {
  if (prev.src === curr.src && prev.id !== curr.id) {
    const selectCurrImg = document.querySelector(`img[id="${curr.id}"]`);
    const selectPrevImg = document.querySelector(`img[id="${prev.id}"]`);
    selectCurrImg.setAttribute('data-match', 'true');
    selectPrevImg.setAttribute('data-match', 'true');
    return true;
  }

  return false;
};
// Flip back to skirt
const backToSkirts = (prev, curr) => setTimeout(() => {
  prev.classList.toggle('flipped');
  curr.classList.toggle('flipped');
}, 1000);

const incrementFlipCounter = () => {
  const flipCountDisplay = document.querySelector('#flip-count');
  flipCounter += 1;
  flipCountDisplay.innerText = flipCounter;
};

const resetFlipCounter = () => {
  const flipCountDisplay = document.querySelector('#flip-count');
  flipCounter = 0;
  flipCountDisplay.innerText = '0';
};

const incrementScoreCounter = () => {
  const scoreCountDisplay = document.querySelector('#score-count');
  scoreCounter += 20;
  scoreCountDisplay.innerText = scoreCounter;
};

const decrementScoreCounter = () => {
  const scoreCountDisplay = document.querySelector('#score-count');
  scoreCounter -= 5;
  scoreCountDisplay.innerText = scoreCounter;
};

const resetScoreCounter = () => {
  const scoreCountDisplay = document.querySelector('#score-count');
  scoreCounter = 0;
  scoreCountDisplay.innerText = '0';
};

const setFocus = (selector) => document.querySelector(selector).focus();

const updateStorage = (name) => {
  const oldData = JSON.parse(localStorage.getItem('itemsArray')) || [];
  const newData = [
    {
      [name]: {
        scoreCounter,
        flipCounter,
      },
    },
  ];
  const newLocalStorage = localStorage.setItem('itemsArray', JSON.stringify([...oldData, ...newData]));

  return newLocalStorage;
};

const makeLeaderboard = () => {
  const users = JSON.parse(localStorage.getItem('itemsArray')) || [];
  const leaderboard = document.querySelector('#leaderboard');
  const lHeader = node('div');
  leaderboard.innerText = '';
  lHeader.innerText = 'Name - S -- F ';

  users.map((user) => {
    const name = Object.keys(user);
    const values = Object.values(user);
    const newDiv = node('div');

    newDiv.innerText = `${[name]} - ${values[0].scoreCounter} -- ${values[0].flipCounter}`;

    return leaderboard.prepend(newDiv);
  });
  leaderboard.prepend(lHeader);
};

const checkGameOver = () => {
  const cardsMatched = document.querySelectorAll('img[data-match="true"]').length;
  if (cardCount === cardsMatched) {
    const modal = document.querySelector('#modal');
    modal.style.display = 'flex';
    setFocus('.name-input');
    makeLeaderboard();
  }
};



// creating card with image inside
const createCard = (img, id) => {
  const newCard = node('div', ['card']);
  const cardFront = node('div', ['front']);
  const cardBack = node('div', ['back']);
  const cardFrontImg = node('img', null, {
    src: img.src,
    id,
    draggable: false,
  });
  const cardBackImg = node('img', null, {
    src: './assets/skirt.png',
    draggable: false,
  });

  cardFront.append(cardFrontImg);
  cardBack.append(cardBackImg);
  newCard.append(cardFront, cardBack);

  return newCard;
};

// onClick Flip
const flip = (e) => {
    const currCard = e.target.closest('.card');
    const selectCurrImg = currCard.querySelector('.front img');
    const src = selectCurrImg.getAttribute('src');
    const id = selectCurrImg.getAttribute('id');

    cardQueue.push({ src, id });
    currCard.classList.toggle('flipped');

    incrementFlipCounter();

    if (cardQueue.length === 2) {

      const currData = cardQueue.pop();
      const prevData = cardQueue.pop();
      const selectPrevImg = document.querySelector(`img[id="${prevData.id}"]`);
      const prevCard = selectPrevImg.closest('.card');

      if (checkForPair(prevData, currData)) {
        currCard.removeEventListener('click', flip);
        prevCard.removeEventListener('click', flip);
        incrementScoreCounter();
      } else {
        decrementScoreCounter();
        backToSkirts(prevCard, currCard);
      }
    }
    checkGameOver(cardCount);

  // e.preventDefault();
};

// creating gameboard
const createGameBoard = () => {
  const gameBoard = document.querySelector('#container');
  const modal = document.querySelector('#modal');
  const imgs = makePair(data);


  // reseting values
  modal.style.display = 'none';
  cardQueue = [];
  resetFlipCounter();
  resetScoreCounter();

  gameBoard.innerHTML = '';
  shuffle(imgs).forEach((img, i) => {
    container.append(createCard(img, i));
  });

  const cards = [...container.children];
  cardCount = cards.length;

  cards.forEach((card) => {
    card.addEventListener('click', flip);
  });
};

// onclick start new game
createGameBoard(data);

// Event Listners

const handleSubmit = (e) => {
  e.preventDefault();
  const winnerName = e.target.name.value;
  updateStorage(winnerName);
  createGameBoard(data);
};

// EVENT LISTNERS
const startOverBtn = document.querySelector('#startOver');
const formButton = document.querySelector('#winnerForm');

startOverBtn.addEventListener('click', createGameBoard);
formButton.addEventListener('submit', handleSubmit);
