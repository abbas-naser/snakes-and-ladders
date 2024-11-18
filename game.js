/***************************************
global variables
***************************************/
let numberOfRows = 6;
let numberOfColumns = numberOfRows;
let totalNumberOfBlocks = numberOfRows * numberOfRows;
let maxNumberInEachRow = totalNumberOfBlocks; // initial value then will be decremented
let currentPlayer = null;
const triesToStart = 2;
let numbersArray = [];
let continuingPlaying = false; // control the option to continue playing after a player won, keep track of score but reset the rest
let playingAgainstMachine = false; // control playing against machine
let laddersBlocksArray = [];
let snakesBlocksArray = [];
const computerTimeDelay = 1200;
const switchingPlayersDelay = 400;
const totalNumberOfRounds = 3;
let currentRound = 0; // reset to 0 in the reset function
// score required to end the game and announce a winner
const scroeToWin = Math.floor(totalNumberOfRounds / 2) + 1;

/***************************************
Initialize images and sound effects for better timing and animations 
***************************************/
// initialize ladder and snake images to improve the loading of the images and provide better inimations in the first run of the game
const ladderImgElInit = document.createElement("img");
ladderImgElInit.setAttribute("src", "./images/ladderBlock-min.jpg");
// initialize snake images
const snakeImgElInit = document.createElement("img");
snakeImgElInit.setAttribute("src", "./images/snakeBlock.jpg");

// initialize sound effects to be loaded when the page opens
const diceSound = new Audio("./sounds/dice.mp3");
const passTurnSound = new Audio(
  "./sounds/mixkit-retro-game-notification-212.mp3"
);
const ladderSound = new Audio("./sounds/ladder.mp3");
const snakeSound = new Audio("./sounds/snakeAttack.mp3");
const startSound = new Audio(
  "./sounds/mixkit-arcade-game-complete-or-approved-mission-205.mp3"
);
const finalWinSound = new Audio("./sounds/win.mp3");
const roundWinSound = new Audio("./sounds/mixkit-instant-win-2021.mp3");
const resetSound = new Audio("./sounds/mixkit-small-win-2020.mp3");
const gridSizeChangingSound = new Audio(
  "./sounds/mixkit-correct-answer-tone-2870.mp3"
);
const cantMoveSoun = new Audio(
  "./sounds/mixkit-wrong-electricity-buzz-955.mp3"
);

/***************************************
DOM elements
***************************************/
const blocksContainer = document.querySelector("#blocksContainer");
blocksContainer.style.gridTemplateColumns = `repeat(${numberOfRows}, 1fr)`;
const playAgainstHumanBtnEl = document.querySelector("#playAgainstHumanBtn");
const resetBtnEl = document.querySelector("#resetBtn");
resetBtnEl.disabled = true; // default is disabled
// grid size btns
const gridSizeOptionsEl = document.querySelector("#gridSizeOptions");
const gridSize4BtnEl = document.querySelector("#gridSize4");
const gridSize6BtnEl = document.querySelector("#gridSize6");
const gridSize8BtnEl = document.querySelector("#gridSize8");

const playAgainstMachineBtnEl = document.querySelector(
  "#playAgainstMachineBtn"
);
// continue btn
const continueBtnEl = document.querySelector("#countinueBtn");
continueBtnEl.style.display = "none"; // show it after winning

const outputMessageEl = document.querySelector("#outputMessage");
let allBlocks = null; // hold generated block, will be filled later automatically

// player 1 elements
const playerOneContainer = document.querySelector("#playerOneContainer");
const playerOneRollDiceBtnEl = document.querySelector(
  "#playerOneRollDiceButton"
);
playerOneRollDiceBtnEl.disabled = true; // default is disabled, enabled when game starts
const playerOneMessageEl = document.querySelector("#playerOneMessage");
const playerOneTitleAndScoreEl = document.querySelector(
  "#playerOneTitleAndScore"
);
const playerOneDiceImgEl = document.querySelector("#playerOneDiceImg");
// hidden by css
const playerOneNumberOfTriesEl = document.querySelector(
  "#playerOneNumberOfTries"
);
const playerOnePassBtnEl = document.querySelector("#playerOnePassBtn");
playerOnePassBtnEl.disabled = true; // default is disabled, enabled when game starts
let playerOnePreviousBlock = null; // to edit the previous block
// player 2 elements
const playerTwoContainer = document.querySelector("#playerTwoContainer");
const playerTwoRollDiceBtnEl = document.querySelector(
  "#playerTwoRollDiceButton"
);
playerTwoRollDiceBtnEl.disabled = true; // default is disabled, enabled when game starts
const playerTwoMessageEl = document.querySelector("#playerTwoMessage");
const playerTwoTitleAndScoreEl = document.querySelector(
  "#playerTwoTitleAndScore"
);
const playerTwoPassBtnEl = document.querySelector("#playerTwoPassBtn");
playerTwoPassBtnEl.disabled = true; // default is disabled, enabled when game starts
const playerTwoDiceImgEl = document.querySelector("#playerTwoDiceImg");
let playerTwoPreviousBlock = null;
// hidden by css
const playerTwoNumberOfTriesEl = document.querySelector(
  "#playerTwoNumberOfTries"
);
/***************************************
initialize players
***************************************/
// player 1
let playerOneNexttBlock;
let playerOneScore = 0; // to hold each player score, it is needed in the playAgainHandler function
let playerTwoScore = 0;
let playerOne = {
  id: 1,
  playerName: "player 1",
  position: 0,
  currentDiceNumber: null,
  started: false, // used when the game start, palyer has to get 6 to start moving, if he tries 3 times and did not get 6, then make him start moving in the 4th time
  tries: 0, // controls starting moving
  startingByGettingSix: false, // to start from block 1 if got 6 before the max tries
  score: 0, // hold the score in case of playing again
};
// player 2
let playerTwoNextBlock;
let playerTwo = {
  id: 2,
  playerName: playingAgainstMachine ? "machine" : "player 2",
  position: 0,
  currentDiceNumber: null,
  started: false,
  tries: 0,
  startingByGettingSix: false,
  score: 0,
};

/***************************************
start the game
***************************************/
// the function was made "async" to use "await" on the wait function to allow for waiting for the round number to be shown then executing the rest of the code
async function startPlaying() {
  playSound("mixkit-arcade-game-complete-or-approved-mission-205.mp3");
  // playSound(startSound);
  currentRound++; // increase the current round, the initial value is zero
  // show round number in the output message
  outputMessageEl.innerText =
    currentRound === totalNumberOfRounds
      ? "final round"
      : `round ${currentRound}`;
  animateOutpuMessage();

  /************** confirm before refreshing  or leaving the page **************/
  // window.addEventListener(
  //   "beforeunload",
  //   (event) => {
  //     // this is the massage the user will see, but modern website will not show this message, rather they will show a more generic message
  //     event.returnValue = "Game status will be lost, are you sure?";
  //   },
  //   { once: true }
  // );
  setupBtnsAndTextForStartPlaying();
  await wait(800);
  /************** if playing another ematch, keep track of players scores **************/
  if (continuingPlaying) {
    continuePlayingHandler();
    renderBlocks(); // render the game again after reinitializing data
    await wait(800);
  }
  // get all blocks to use when moving players
  allBlocks = document.querySelectorAll(".block");

  /************** generate ladders and snakes arrays **************/
  // generat the ladders blocks and colors them
  generatLaddersBlocks();
  // generat the snakes blocks and colors them and make sure that one block does not have both a ladder and a snake
  generatSnakesBlocks();

  /************** choose the player to start **************/

  currentPlayer = choosePlayerToStart(); // randomly choose current player // and show player name the output message area
  await wait(700);
  playSound("dice.mp3");
  // playSound(diceSound);
  await wait(1000);
  // enable the current playerBtnEl and passBtn
  if (currentPlayer.id === playerOne.id) {
    outputMessageEl.innerText = `${playerOne.playerName} starts`;
    playerOneRollDiceBtnEl.disabled = false;
    playerOnePassBtnEl.disabled = false;
    // wait for the computer to play
    animatePlayerContainer(playerOneContainer);
  } else {
    outputMessageEl.innerText = `${playerTwo.playerName} starts`;
    playerTwoRollDiceBtnEl.disabled = playingAgainstMachine ? true : false;
    playerTwoPassBtnEl.disabled = playingAgainstMachine ? true : false;
    animatePlayerContainer(playerTwoContainer);
  }

  /************** if playing aginst machine **************/
  // if playing against machine and the first player is the machine
  if (playingAgainstMachine && currentPlayer.id === playerTwo.id) {
    // call playerBtnHandler
    setTimeout(() => {
      rollingDiceHandler(playerTwo);
    }, computerTimeDelay);
  }
}

// handles rolling a dice and all the logic that it involves
async function rollingDiceHandler(player) {
  playSound("dice.mp3");
  // playSound(diceSound);
  // update current player
  currentPlayer = player;
  // increase number of tries
  currentPlayer.tries++;
  // generate a random number
  currentPlayer.currentDiceNumber = generatRandomeNumber(6) + 1;

  // show/update the dice img
  if (currentPlayer.id === playerOne.id) {
    playerOneMessageEl.style.visibility = "visible";
    playerOneNumberOfTriesEl.style.visibility = "visible";
    playerOneDiceImgEl.style.visibility = "visible";
    playerOneDiceImgEl.setAttribute(
      "src",
      `./images/dice${currentPlayer.currentDiceNumber}.png`
    );
    playerOneDiceImgEl.setAttribute(
      "alt",
      `dice ${currentPlayer.currentDiceNumber}`
    );
    animateDice(playerOneDiceImgEl);
  } else {
    playerTwoMessageEl.style.visibility = "visible";
    playerTwoNumberOfTriesEl.style.visibility = "visible";
    playerTwoDiceImgEl.style.visibility = "visible";
    playerTwoDiceImgEl.setAttribute(
      "src",
      `./images/dice${currentPlayer.currentDiceNumber}.png`
    );
    playerTwoDiceImgEl.setAttribute(
      "alt",
      `dice ${currentPlayer.currentDiceNumber}`
    );
    animateDice(playerTwoDiceImgEl);
  }

  // show/update number of tries
  if (currentPlayer.id === playerOne.id) {
    playerOneNumberOfTriesEl.innerText = `Tries: ${playerOne.tries}`;
  } else {
    playerTwoNumberOfTriesEl.innerText = `Tries: ${playerTwo.tries}`;
  }

  // validate starting, did player got 6 or tried more than the "triesToStart
  // if the player get 6 before reaching number of triesToStart, then make him start at 1, but if he got 6 when his tries = triesToStart then he start from 6
  if (currentPlayer.started === false) {
    validateStarting(currentPlayer);
  }

  // get message element for the proper player
  const playerMessageEl =
    currentPlayer.id === 1 ? playerOneMessageEl : playerTwoMessageEl;

  /************** if player can't move after validation dont let him start moving, update player message and move to next player and return **************/
  if (currentPlayer.started === false) {
    playerMessageEl.innerText =
      currentPlayer.id === 1
        ? `get 6 or try more than ${triesToStart} times to start moving`
        : playingAgainstMachine
        ? `i can't start moving yet`
        : `get 6 or try more than ${triesToStart} times to start moving`;
    animatePlayerMessage(playerMessageEl);
    playerSwitchingHandler();
    await wait(500);
    playSound("mixkit-wrong-electricity-buzz-955.mp3");
    // if next player is machine
    if (currentPlayer.id === playerTwo.id && playingAgainstMachine) {
      setTimeout(() => {
        rollingDiceHandler(playerTwo);
      }, computerTimeDelay);
    }
    return;
  }

  /************** if reached here then player started moving => update the player object **************/

  // check if current player reached a block greater that the max totalNumberOfBlocks, then don't let him move, and show message saying "you have to get totalNumberOfBlocks - current postion to win" and move to next player without updating the current player current postion
  if (
    currentPlayer.position + currentPlayer.currentDiceNumber >
    totalNumberOfBlocks
  ) {
    playerMessageEl.innerText =
      currentPlayer.id === 1
        ? `you need ${totalNumberOfBlocks - currentPlayer.position} to win`
        : playingAgainstMachine
        ? `I need ${totalNumberOfBlocks - currentPlayer.position} to win`
        : `you need ${totalNumberOfBlocks - currentPlayer.position} to win`;
    animatePlayerMessage(playerMessageEl);
    playerSwitchingHandler();
    await wait(500);
    playSound("mixkit-wrong-electricity-buzz-955.mp3");
    // if next player is machine
    if (currentPlayer.id === playerTwo.id && playingAgainstMachine) {
      setTimeout(() => {
        rollingDiceHandler(playerTwo);
      }, computerTimeDelay);
    }
    return;
  }

  // if the player get 6 before reaching number of triesToStart, then make him start at 1, but if he got 6 when his tries = triesToStart then he starts from 6
  currentPlayer.position = currentPlayer.startingByGettingSix
    ? 1
    : currentPlayer.position + currentPlayer.currentDiceNumber;

  // make startingByGettingSix false, to allow the current position to be changed properly, since in the above the currentPostion of player will be 1 if startingByGettingSix is true, we need it one time only and now it will always be false.
  if (currentPlayer.started) {
    currentPlayer.startingByGettingSix = false;
  }

  // check if the current player current position is greater than max numberOfBlocks, if so, then make it equal to the max
  currentPlayer.position =
    currentPlayer.position > totalNumberOfBlocks
      ? totalNumberOfBlocks
      : currentPlayer.position;

  /************** move player to his new block **************/
  // update player message
  playerMessageEl.innerText = `moved to block ${currentPlayer.position}`;
  animatePlayerMessage(playerMessageEl);
  movePlayer();

  /************** check win **************/
  if (currentPlayer.position === totalNumberOfBlocks) {
    // currentPlayer
    winHandler(currentPlayer);
  } else {
    // move to next player if no win
    playerSwitchingHandler();
    // if next player is machine
    if (currentPlayer.id === playerTwo.id && playingAgainstMachine) {
      setTimeout(() => {
        rollingDiceHandler(playerTwo);
      }, computerTimeDelay);
    }
  }
}

// move player to his new block
async function movePlayer() {
  // playerNextBlock will hold the block that the player will move to
  let playerNextBlockEl = null;
  // find the block that has the same innerText as the player current postion
  for (let i = 0; i < allBlocks.length; i++) {
    // since current position is a number we have to change it to a string, or we can use loose equality"=="
    if (allBlocks[i].innerText === currentPlayer.position.toString()) {
      playerNextBlockEl = allBlocks[i];
      break;
    }
  }
  /************** if player currentPosition/next is on ladder block, this must be before calling the function that will move the player to his position after taking a ladder **************/
  if (laddersBlocksArray.includes(currentPlayer.position)) {
    playSound("ladder.mp3");
    // playSound(ladderSound);
    for (let i = 1; i > 0; i--) {
      // generat a random number between the current postion and the last block - 2
      let playerNewPosition = generatRandomNumberFromMinToMax(
        currentPlayer.position,
        totalNumberOfBlocks - 1
      );
      // and make sure the generated number is not on a block that has another ladder or another snake
      if (
        !laddersBlocksArray.includes(playerNewPosition) &&
        !snakesBlocksArray.includes(playerNewPosition)
      ) {
        // show message to player you have been on a ladder block
        if (currentPlayer.id === playerOne.id) {
          playerOneMessageEl.innerText = `you have been on a ladder block ${currentPlayer.position}`;
        } else {
          playerTwoMessageEl.innerText =
            playingAgainstMachine === true
              ? `i have been on a ladder block ${currentPlayer.position}`
              : `you have been on a ladder block ${currentPlayer.position}`;
        }
        // update current player position
        currentPlayer.position = playerNewPosition;
      } else {
        // increase i to keep the loop going until it find a proper number
        i++;
      }
    }
    // create a new div element to indicate previous block
    const playerPreviousBlockIndicator = document.createElement("div");
    // give it a class of the current player
    playerPreviousBlockIndicator.classList.add(
      currentPlayer.id === 1
        ? "playerOnePreviousBlockIndicator"
        : "playerTwoPreviousBlockIndicator"
    );
    // add the new indicatro element to ladder block
    playerNextBlockEl.appendChild(playerPreviousBlockIndicator);
    animateLaddersBlock(playerNextBlockEl);
    // update the old playerNextBlockEl to be on the new player position
    for (let i = 0; i < allBlocks.length; i++) {
      // get the block of the new current position
      if (allBlocks[i].innerText === currentPlayer.position.toString()) {
        playerNextBlockEl = allBlocks[i];
        break;
      }
    }
  } else if (snakesBlocksArray.includes(currentPlayer.position)) {
    /************** if player currentPosition/next is on a snake block, then add an indicator on the snake block and then move the player to his position after taking a snake block **************/
    // before adding a previous block indicator, check if there is one already because the player might return back as a result of gitting a snake block

    playSound("snakeAttack.mp3");
    // playSound(snakeSound);
    for (let i = 1; i > 0; i--) {
      // generat a random number between the first block and the one before the player current position
      let playerNewPosition = generatRandomNumberFromMinToMax(
        1,
        currentPlayer.position - 1
      );
      // and make sure the generated number is not on a block that has another ladder or another snake
      if (
        !laddersBlocksArray.includes(playerNewPosition) &&
        !snakesBlocksArray.includes(playerNewPosition)
      ) {
        // show message to player that they have been on a snake block
        if (currentPlayer.id === playerOne.id) {
          playerOneMessageEl.innerText = `you have been on a snake block ${currentPlayer.position}`;
        } else {
          playerTwoMessageEl.innerText =
            playingAgainstMachine === true
              ? `i have been on a snake block ${currentPlayer.position}`
              : `you have been on a snake block ${currentPlayer.position}`;
        }
        // update current player position
        currentPlayer.position = playerNewPosition;
      } else {
        // increase i to keep the loop going until it find a proper number
        i++;
      }
    }
    // add a previous indicator to the snake block
    // if there is already an indicator for that player then then...
    // create a new div element to indicate previous block
    const playerPreviousBlockIndicator = document.createElement("div");
    // give it a class of the current player
    playerPreviousBlockIndicator.classList.add(
      currentPlayer.id === 1
        ? "playerOnePreviousBlockIndicator"
        : "playerTwoPreviousBlockIndicator"
    );

    // add the new indicatro element to the sanke block
    playerNextBlockEl.appendChild(playerPreviousBlockIndicator);
    animateSnakesBlocks(playerNextBlockEl);
    // move the player to his new block
    // update the old playerNextBlockEl to be on the new player position
    for (let i = 0; i < allBlocks.length; i++) {
      // get the block of the new current position
      if (allBlocks[i].innerText === currentPlayer.position.toString()) {
        playerNextBlockEl = allBlocks[i];
        break;
      }
    }
  }
  // update players positions on the grid
  updatePlayersBlocks(playerNextBlockEl);
  animateBlock(playerNextBlockEl);
}

// update the blocks of player, colors, indicators..
function updatePlayersBlocks(playerNextBlockEl) {
  // update player 1
  if (currentPlayer.id === playerOne.id) {
    playerOneNexttBlock = playerNextBlockEl;
    // if both players on the same block, add a class "blockBothPlayersOn" to give that block a different lock
    if (playerOneNexttBlock.classList.contains("playerTwoCurrentBlock")) {
      playerOneNexttBlock.classList.add(
        "playerOneCurrentBlock",
        "blockBothPlayerCurrentlyOn"
      );
      // check if there is a previous block then change it
      if (playerOnePreviousBlock !== null) {
        // remove colors from previous block
        // remove playerOneBlock class
        playerOnePreviousBlock.classList.remove(
          "playerOneCurrentBlock",
          "blockBothPlayerCurrentlyOn"
        );
        // create a new div element to indicate previous block
        const playerOnePreviousBlockIndicator = document.createElement("div");
        // give it a class
        playerOnePreviousBlockIndicator.classList.add(
          "playerOnePreviousBlockIndicator"
        );
        // add the new indicatro element to block
        playerOnePreviousBlock.appendChild(playerOnePreviousBlockIndicator);
      }
    } else {
      // if only one player on the block
      // check if there is a previous block then change it
      if (playerOnePreviousBlock !== null) {
        // remove the color from the previous block even if both players were on
        playerOnePreviousBlock.classList.remove(
          "playerOneCurrentBlock",
          "blockBothPlayerCurrentlyOn"
        );
        // create a new div element to indicate previous block
        const playerOnePreviousBlockIndicator = document.createElement("div");
        // give it a class
        playerOnePreviousBlockIndicator.classList.add(
          "playerOnePreviousBlockIndicator"
        );
        // add the new indicatro element to block
        playerOnePreviousBlock.appendChild(playerOnePreviousBlockIndicator);
      }
      // add color to the new block
      playerOneNexttBlock.classList.add("playerOneCurrentBlock");
    }
    // save the current block as the player previous block, such that in the next call of the function the previous block could be edited
    // block to add small circle to after the player is moved to anothe block
    playerOnePreviousBlock = playerOneNexttBlock;
  } else {
    // update player 2
    playerTwoNextBlock = playerNextBlockEl; // the one it will be moved to
    // if both players on the same block,
    if (playerTwoNextBlock.classList.contains("playerOneCurrentBlock")) {
      playerTwoNextBlock.classList.add(
        "playerTwoCurrentBlock",
        "blockBothPlayerCurrentlyOn"
      );
      // check if there is a previous block then change it
      if (playerTwoPreviousBlock !== null) {
        // remove the color from the previous block
        // remove playerTwoBlock class
        playerTwoPreviousBlock.classList.remove("playerTwoCurrentBlock");
        // remove blockBothPlayerCurrentlyOn
        playerTwoPreviousBlock.classList.remove("blockBothPlayerCurrentlyOn");
        // create a new div element to indicate previous block
        const playerTwoPreviousBlockIndicator = document.createElement("div");
        // give it a class
        playerTwoPreviousBlockIndicator.classList.add(
          "playerTwoPreviousBlockIndicator"
        );
        // add/append the new indicatro element to block
        playerTwoPreviousBlock.appendChild(playerTwoPreviousBlockIndicator);
      }
    } else {
      // if only one player on the block
      // check if there is a previous block then change it
      if (playerTwoPreviousBlock !== null) {
        // remove the color from the previous block even if both players were on
        playerTwoPreviousBlock.classList.remove(
          "playerTwoCurrentBlock",
          "blockBothPlayerCurrentlyOn"
        );
        // create a new div element to indicate previous block
        const playerTwoPreviousBlockIndicator = document.createElement("div");
        // give it a class
        playerTwoPreviousBlockIndicator.classList.add(
          "playerTwoPreviousBlockIndicator"
        );
        // add/append the new indicatro element to block
        playerTwoPreviousBlock.appendChild(playerTwoPreviousBlockIndicator);
      }
      // add color to the new block
      playerTwoNextBlock.classList.add("playerTwoCurrentBlock");
    }
    playerTwoPreviousBlock = playerTwoNextBlock;
  }
}

// handles wining and show play again option
function winHandler(winner) {
  // disable player buttons and reset button and enable start btn
  disablePlayerOneBtns();
  disablePlayerTwoBtns();

  // update players score
  winner.score++;
  playerOneScore = playerOne.score; // used in the playAgainHandler to keep the players score status
  playerTwoScore = playerTwo.score;
  playerOneTitleAndScoreEl.innerText = `${playerOne.playerName} score: ${playerOne.score}`;
  playerTwoTitleAndScoreEl.innerText = `${playerTwo.playerName} score: ${playerTwo.score}`;
  if (winner.id === playerOne.id) {
    playerOneMessageEl.innerText = "Winner";
  } else {
    playerTwoMessageEl.innerText = "Winner";
  }
  

  // give the blocks container opacity to make the user focun on the winner
  blocksContainer.style.opacity = "0.5";

  // check if a plyer win whole game by winning more than half the total number of rounds which is set to 3
  if (winner.score === scroeToWin) {
    resetBtnEl.innerText = "Play Again";
    playSound("win.mp3");
    // playSound(finalWinSound);
    // // remove the continue playing button and the grid size options, and show only the reset button
    // announce the winner using the output message
    outputMessageEl.innerText = `${winner.playerName} wins the game, try your luck again!`;

    // give the looser container opacity to emphasise the winner
    if (winner.id === playerOne.id) {
      playerTwoContainer.style.opacity = "0.5";
      animatePlayerContainer(playerOneContainer);
    } else {
      playerOneContainer.style.opacity = "0.5";
      animatePlayerContainer(playerTwoContainer);
    }
  } else {
    // if the game is not finished yet
    playSound("mixkit-instant-win-2021.mp3");
    // playSound(roundWinSound);
    // give the looser container opacity to emphasise the winner
    if (winner.id === playerOne.id) {
      animatePlayerContainer(playerOneContainer);
      playerTwoContainer.style.opacity = "0.5";
    } else {
      animatePlayerContainer(playerTwoContainer);
      playerOneContainer.style.opacity = "0.5";
    }
    // show the winner text
    // if player win from the first try then remove the ploral "tries" and add "try"
    outputMessageEl.innerText =
      winner.tries === 1
        ? `${winner.playerName} is the winner of round "${currentRound}" after "${winner.tries}" try, you can change the grid size - if you think it might help - and continue`
        : `${winner.playerName} is the winner of round "${currentRound}" after "${winner.tries}" tries. you can change the grid size - if you think it might help - and continue`;
    // show play again option, to keep scores of winning
    // enable start/playagain btn
    continueBtnEl.style.display = "inline-block";
    // show grid size options to let user change the size if he wants to play again
    gridSizeOptionsEl.style.display = "flex";
    gridSize4BtnEl.disabled = false;
    gridSize6BtnEl.disabled = false;
    gridSize8BtnEl.disabled = false;
  }
  // animate the output message
  animateOutpuMessage();
}

// reset the game to initial state
function resetGame() {
  playSound("mixkit-small-win-2020.mp3");
  resetBtnEl.innerText = "Run Away!";
  // playSound(resetSound);
  currentRound = 0;
  laddersBlocksArray = [];
  snakesBlocksArray = [];
  changeGridSize(6);
  blocksContainer.style.opacity = "1";
  playerTwoContainer.style.opacity = "1";
  playerOneContainer.style.opacity = "1";
  // show grid sizes options
  gridSizeOptionsEl.style.display = "flex";
  gridSize4BtnEl.disabled = false;
  gridSize6BtnEl.disabled = false;
  gridSize8BtnEl.disabled = false;
  gridSize6BtnEl.classList.add("defaultGridSizeBtn");
  playerOneDiceImgEl.style.visibility = "hidden";
  playerTwoDiceImgEl.style.visibility = "hidden";
  playerOneMessageEl.style.visibility = "hidden";
  playerTwoMessageEl.style.visibility = "hidden";
  playerOneMessageEl.innerText = "";
  playerTwoMessageEl.innerText = "";
  playerOneNumberOfTriesEl.style.visibility = "hidden";
  playerTwoNumberOfTriesEl.style.visibility = "hidden";
  playerOneNumberOfTriesEl.innerText = "Tries";
  playerTwoNumberOfTriesEl.innerText = "Tries";
  continueBtnEl.style.display = "none";
  playingAgainstMachine = false;
  playAgainstHumanBtnEl.style.display = "inline-block";
  playAgainstHumanBtnEl.disabled = false;
  playAgainstHumanBtnEl.innerText = "play aginst a human";
  resetBtnEl.style.display = "none";
  resetBtnEl.disabled = true;
  playAgainstMachineBtnEl.style.display = "inline-block";
  playAgainstMachineBtnEl.disabled = false;
  playerOnePassBtnEl.disabled = true;
  playerTwoPassBtnEl.disabled = true;
  continuingPlaying = false;
  playerOneRollDiceBtnEl.disabled = true;
  playerTwoRollDiceBtnEl.style.visibility = "visible";
  playerTwoPassBtnEl.style.visibility = "visible";
  playerTwoRollDiceBtnEl.disabled = true;
  playerOneScore = 0;
  playerTwoScore = 0;
  numbersArray = [];
  allBlocks = null;
  currentPlayer = null;
  maxNumberInEachRow = totalNumberOfBlocks;
  playerOneTitleAndScoreEl.innerText = "player 1";
  playerTwoTitleAndScoreEl.innerText = "player 2";

  playerOnePreviousBlock = null;
  playerTwoPreviousBlock = null;
  playerOne = {
    id: 1,
    playerName: "player 1",
    position: 0,
    currentDiceNumber: null,
    started: false,
    tries: 0,
    startingByGettingSix: false,
    score: 0,
  };
  playerTwo = {
    id: 2,
    playerName: "player 2",
    position: 0,
    currentDiceNumber: null,
    started: false,
    tries: 0,
    startingByGettingSix: false,
    score: 0,
  };
  blocksElementsString = "";
  outputMessageEl.innerText =
    "Choose a grid size and your opponent, player to start will be chosen randomly";
  renderBlocks(); // render the game again after reinitializing data
}

/***************************************
Helper functions
***************************************/
// renders new blocks without players data on them
function renderBlocks() {
  /************** create the numbers array, by looping through each row **************/
  // for even rows, add descending order e.g. 100-91
  for (let row = numberOfRows; row > 0; row--) {
    // even rows, counting (descending)from bigger to smaller e.g. 100-91
    if (row % 2 === 0) {
      // in even rows, use maxNumberInEachRow to count down to fill the each column in the row
      for (let column = 0; column < numberOfColumns; column++) {
        numbersArray.push(maxNumberInEachRow);
        maxNumberInEachRow--;
      }
    } else {
      // odd rows, counting up (Ascending) from smaller to bigger e.g 81-90
      //   + 1, was added to smallerNumberInRow because "maxNumberInEachRow" was decremented by 1 in the last element in the loop after pushing it to the array
      let smallerNumberInRow = maxNumberInEachRow - numberOfColumns + 1;

      // in odd rows, use smallerNumberInRow to count up to fill the each column in the row
      for (let column = 0; column < numberOfColumns; column++) {
        numbersArray.push(smallerNumberInRow);
        smallerNumberInRow++;
      }
      // update the maxNumberInEachRow for the next even row
      // -1, because smallerNumberInRow was incremented by 1 after the last element in the loop after pushing it to the array
      maxNumberInEachRow = smallerNumberInRow - numberOfColumns - 1;
    }
  }
  /************** adding blocks to the board **************/
  let blockWidth = 45;
  let blockHeight = 45;
  switch (numberOfRows) {
    case 4:
      blockWidth = 90;
      blockHeight = 90;
      break;
    case 6:
      blockWidth = 60;
      blockHeight = 60;
      break;
    case 8:
      blockWidth = 45;
      blockHeight = 45;
      break;
    default:
      break;
  }
  let blocksElementsString = "";
  for (let numb of numbersArray) {
    blocksElementsString += `<div class="block" style="width:${blockWidth}px; height:${blockHeight}px">${numb}</div>`;
  }
  blocksContainer.innerHTML = blocksElementsString;
}
function changeGridSize(rows) {
  playSound("mixkit-correct-answer-tone-2870.mp3");
  // playSound(gridSizeChangingSound);
  numbersArray = [];
  blocksElementsString = "";
  blocksContainer.innerHTML = "";
  numberOfRows = rows;
  numberOfColumns = rows;
  totalNumberOfBlocks = rows * rows;
  maxNumberInEachRow = totalNumberOfBlocks;
  blocksContainer.style.gridTemplateColumns = `repeat(${rows}, 1fr)`;
}
// to wait for timeout before executing next code
// the function this "wait" function is called in, must be made "async" and "await" must be added before "wait" ===> await wait(2000);
// this function just wait for number of seconds and does nothing else
function wait(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
function setupBtnsAndTextForStartPlaying() {
  // disable grid size options and enable them after reset and after winning
  gridSize4BtnEl.disabled = true;
  gridSize6BtnEl.disabled = true;
  gridSize8BtnEl.disabled = true;
  // hide and disable startBtn
  playAgainstHumanBtnEl.style.display = "none";
  playAgainstHumanBtnEl.disabled = true;
  // show resetBtn and enable it
  resetBtnEl.style.display = "inline-block";
  resetBtnEl.disabled = false;
  // hide and disable playagainstMachineBtn
  playAgainstMachineBtnEl.style.display = "none";
  playAgainstMachineBtnEl.disabled = true;
  // hide grid sizes options and show it after winning and after reset
  gridSizeOptionsEl.style.display = "none";
  // show tries element
  // playerOneNumberOfTriesEl.style.visibility = "visible";
  // playerTwoNumberOfTriesEl.style.visibility = "visible";
  playerOneNumberOfTriesEl.innerText = "Tries: ";
  playerTwoNumberOfTriesEl.innerText = "Tries: ";
}
// generat the ladders blocks and colors them
function generatLaddersBlocks() {
  // the number of ladder and snakes blocks will  rows number / 2
  // make sure there are no dublicates in snaks and ladder
  // ladders: randomly chosen between block 2 and before the last block by numberOfRows, they will be chnaged every time a new game is started so make sure to reset them
  // the points the player will be send to will be decided after the array is ready and it will be between the ladder block and upto and including the last block

  // make sure the block the player will ladder to is not a snake and not another lader block
  let numberOfLadderBlocks;
  switch (numberOfRows) {
    case 4:
      numberOfLadderBlocks = 2;
      break;
    case 6:
      numberOfLadderBlocks = 4;
      break;
    case 8:
      numberOfLadderBlocks = 5;
      break;
    default:
      break;
  }
  for (let i = numberOfLadderBlocks; i > 0; i--) {
    // generat a random number between 1 inclusive to totalNumberOfBlocks - numberOfRows inculsive
    const ledderNumb = generatRandomNumberFromMinToMax(
      1,
      totalNumberOfBlocks - numberOfRows
    );
    // check if the generated number is not in the array then add it if so
    if (!laddersBlocksArray.includes(ledderNumb)) {
      laddersBlocksArray.push(ledderNumb);
    } else {
      // if there is a dublicate icrease i to try again to find another number
      // increase i to keep the loop going until it find a proper number
      i++;
    }
  }
  // add ladder img to ladder blocks
  for (let i = 0; i < allBlocks.length; i++) {
    // create a new img element
    const ladderImgEl = document.createElement("img");
    // give it a class
    ladderImgEl.setAttribute("src", "./images/ladderBlock-min.jpg");
    ladderImgEl.setAttribute("alt", "ladder");
    ladderImgEl.classList.add("ladderBlock");
    // if the block has a ladder point
    if (laddersBlocksArray.includes(parseInt(allBlocks[i].innerText))) {
      allBlocks[i].appendChild(ladderImgEl);
      animateSnakeAndLadderImages(ladderImgEl);
    }
  }
}
// generat the snakes blocks and colors them
function generatSnakesBlocks() {
  let numberOfSnakesBlocks;
  switch (numberOfRows) {
    case 4:
      numberOfSnakesBlocks = 3;
      break;
    case 6:
      numberOfSnakesBlocks = 5;
      break;
    case 8:
      numberOfSnakesBlocks = 8;
      break;
    default:
      numberOfSnakesBlocks = 3;
      break;
  }
  for (let i = numberOfSnakesBlocks; i > 0; i--) {
    // generat a random number between numberOfRows + 1 inclusive to totalNumberOfBlocks - numberOfRows inculsive
    const snakeNumb = generatRandomNumberFromMinToMax(
      numberOfRows + 1,
      totalNumberOfBlocks - 1
    );
    // check if the generated number is not in the array already and it is not in the snake array
    if (
     ( !snakesBlocksArray.includes(snakeNumb) && !snakesBlocksArray.includes(snakeNumb + 1) && !snakesBlocksArray.includes(snakeNumb - 1) ) &&
      !laddersBlocksArray.includes(snakeNumb)
    ) {
      snakesBlocksArray.push(snakeNumb);
    } else {
      // if there is a dublicate or it is in snakes array icrease i to try again to find another number
      // increase i to keep the loop going until it find a proper number
      i++;
    }
  }

  // add img to snake blocks
  for (let i = 0; i < allBlocks.length; i++) {
    // add snake image to the blocks
    // create a new div element to indicate previous block
    const snakeImgEl = document.createElement("img");
    // give it a class
    snakeImgEl.setAttribute("src", "./images/snakeBlock.jpg");
    snakeImgEl.setAttribute("alt", "snake");
    snakeImgEl.classList.add("snakeBlock");
    // if the block has a snake point
    if (snakesBlocksArray.includes(parseInt(allBlocks[i].innerText))) {
      allBlocks[i].appendChild(snakeImgEl);
      animateSnakeAndLadderImages(snakeImgEl);
    }
  }
}
// play against machine handler, change player 2 name and hide and disable btns then calls startPlaying
function playAgainstMachineHanler() {
  // change player 2 name to be "machine"
  playerTwo.playerName = "machine";
  playerTwoTitleAndScoreEl.innerText = "machine";
  // hide the machine playerTwoRollDiceBtnEl and passBtn using visibility "hidden" to make it take space for semmetry with the other container
  playerTwoRollDiceBtnEl.style.visibility = "hidden";
  playerTwoPassBtnEl.style.visibility = "hidden";
  // disable the machine buttons
  playerTwoRollDiceBtnEl.disabled = true;
  playerTwoPassBtnEl.disabled = true;

  // start the game
  startPlaying();
}
// handles playing again // reset game status but keep track of players scores
function continuePlayingHandler() {
  laddersBlocksArray = [];
  snakesBlocksArray = [];
  numbersArray = [];
  currentPlayer = null;
  maxNumberInEachRow = totalNumberOfBlocks;
  blocksContainer.style.opacity = "1";
  playerTwoContainer.style.opacity = "1";
  playerOneContainer.style.opacity = "1";
  playerOneMessageEl.innerText = "";
  playerTwoMessageEl.innerText = "";
  playerOnePreviousBlock = null;
  playerTwoPreviousBlock = null;
  disablePlayerOneBtns();
  disablePlayerTwoBtns();
  playerOneDiceImgEl.style.visibility = "hidden";
  playerTwoDiceImgEl.style.visibility = "hidden";
  playerOneMessageEl.style.visibility = "hidden";
  playerTwoMessageEl.style.visibility = "hidden";
  playerOneMessageEl.innerText = "message";
  playerTwoMessageEl.innerText = "message";
  playerOneNumberOfTriesEl.style.visibility = "hidden";
  playerTwoNumberOfTriesEl.style.visibility = "hidden";
  playerOneNumberOfTriesEl.innerText = "Tries: ";
  playerTwoNumberOfTriesEl.innerText = "Tries: ";
  playerOne = {
    id: 1,
    playerName: "player 1",
    position: 0,
    currentDiceNumber: null,
    started: false,
    tries: 0,
    startingByGettingSix: false,
    score: playerOneScore,
  };
  playerTwo = {
    id: 2,
    playerName: playingAgainstMachine ? "machine" : "player 2",
    position: 0,
    currentDiceNumber: null,
    started: false,
    tries: 0,
    startingByGettingSix: false,
    score: playerTwoScore,
  };
  blocksElementsString = "";
}
// generat a random number between 0 inclusive to max exclusive
function generatRandomeNumber(max) {
  return Math.floor(Math.random() * max);
}
// generate a random number between two numbers // min and max included
function generatRandomNumberFromMinToMax(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
// if the player get 6 before reaching number of triesToStart, then make him start at 1, but if he got 6 when his tries = triesToStart then he start from 6
function validateStarting(player) {
  if (player.currentDiceNumber === 6 && player.tries <= triesToStart) {
    player.startingByGettingSix = true;
    player.started = true;
  } else if (player.tries > triesToStart) {
    player.started = true;
  }
}
// choose who is the player to start
function choosePlayerToStart() {
  const random = generatRandomeNumber(2);
  return random === 0 ? playerOne : playerTwo;
}
// handles switching to next player
async function playerSwitchingHandler() {
  // if player got 6, don't switch player
  if (currentPlayer.currentDiceNumber === 6) {
    // show output message to show who player turn is
    outputMessageEl.innerText = `${currentPlayer.playerName} turn`;
    return;
  }
  if (currentPlayer.id === playerOne.id) {
    currentPlayer = playerTwo;
    // disable player 1
    disablePlayerOneBtns();
    // update output message
    outputMessageEl.innerText = `${playerTwo.playerName} turn`;
    // enable player 2
    enablePlayerTwoBtns();
    // animatePlayerContainer(playerTwoContainer);
  } else {
    currentPlayer = playerOne;
    // disable player 2
    disablePlayerTwoBtns();
    if (playingAgainstMachine) {
      await wait(300);
    }
    // update output message
    outputMessageEl.innerText = `${playerOne.playerName} turn`;
    // enable player 1
    enablePlayerOneBtns();
    // animatePlayerContainer(playerOneContainer);
  }
}
// animate the dice img
function animateDice(playerDicImgEl) {
  playerDicImgEl.classList.add("animateDice");
  setTimeout(() => {
    playerDicImgEl.classList.remove("animateDice");
  }, 300);
}
// animate output message
function animateOutpuMessage() {
  outputMessageEl.classList.add("animateOutputMessage");
  setTimeout(() => {
    outputMessageEl.classList.remove("animateOutputMessage");
  }, 520);
}
// animate player container animatePlayerContainer
function animatePlayerContainer(playerContainer) {
  playerContainer.classList.add("animatePlayerContainer");
  setTimeout(() => {
    playerContainer.classList.remove("animatePlayerContainer");
  }, 330);
}
// animate blocks
function animateBlock(playerNextBlockEl) {
  playerNextBlockEl.classList.add("animateBlock");
  setTimeout(() => {
    playerNextBlockEl.classList.remove("animateBlock");
  }, 500);
}
// animate snakes and ladders blocks
function animateLaddersBlock(playerNextBlockEl) {
  playerNextBlockEl.classList.add("animateLaddersBlock");
  setTimeout(() => {
    playerNextBlockEl.classList.remove("animateLaddersBlock");
  }, 600);
}
function animateSnakesBlocks(playerNextBlockEl) {
  playerNextBlockEl.classList.add("animateSnakesBlocks");
  setTimeout(() => {
    playerNextBlockEl.classList.remove("animateSnakesBlocks");
  }, 600);
}
// animate snakes and ladders blocks
function animateLaddersBlock(playerNextBlockEl) {
  playerNextBlockEl.classList.add("animateLaddersBlock");
  setTimeout(() => {
    playerNextBlockEl.classList.remove("animateLaddersBlock");
  }, 600);
}
// animate snakes and ladders images
function animateSnakeAndLadderImages(imgEl) {
  imgEl.classList.add("animateSnakeAndLadderImages");
  setTimeout(() => {
    imgEl.classList.remove("animateSnakeAndLadderImages");
  }, 330);
}
// animate player messages
function animatePlayerMessage(playerMessageEl) {
  playerMessageEl.classList.add("animatePlayerMessage");
  setTimeout(() => {
    playerMessageEl.classList.remove("animatePlayerMessage");
  }, 220);
}
// handles passing turn to the next player functionality
function passTurn(playerId) {
  playSound("mixkit-retro-game-notification-212.mp3");
  // playSound(passTurnSound);
  // player is the one who clicked pass, so give the other player the turn
  if (playerId === playerOne.id) {
    // pass to player two
    currentPlayer = playerTwo;
    // disable player 1
    disablePlayerOneBtns();
    // enable player 2
    enablePlayerTwoBtns();
    if (playingAgainstMachine) {
      // call playerBtnHandler
      setTimeout(() => {
        rollingDiceHandler(playerTwo);
      }, computerTimeDelay);
      disablePlayerTwoBtns();
    }
  } else {
    // pass to player 1
    currentPlayer = playerOne;
    // disable player 2
    disablePlayerTwoBtns();
    // enable player 1
    enablePlayerOneBtns();
  }
  outputMessageEl.innerText = `${currentPlayer.playerName} turn`;
}
function disablePlayerOneBtns() {
  playerOneRollDiceBtnEl.disabled = true;
  playerOnePassBtnEl.disabled = true;
}
function enablePlayerOneBtns() {
  playerOneRollDiceBtnEl.disabled = false;
  playerOnePassBtnEl.disabled = false;
}
function disablePlayerTwoBtns() {
  playerTwoRollDiceBtnEl.disabled = true;
  playerTwoPassBtnEl.disabled = true;
}
function enablePlayerTwoBtns() {
  playerTwoRollDiceBtnEl.disabled = false;
  playerTwoPassBtnEl.disabled = false;
}
function playSound(name) {
  const audio = new Audio(`./sounds/${name}`);
  audio.play();
}
/***************************************
Code start running
***************************************/
renderBlocks(); // to render elements when the pages first loaded
document.addEventListener("DOMContentLoaded", () => {
  // animate the output message
  animateOutpuMessage();
  /************** grid size btns **************/
  gridSize4BtnEl.addEventListener("click", () => {
    // remove the default color from the default grid size which is set to 6
    gridSize6BtnEl.classList.remove("defaultGridSizeBtn");
    changeGridSize(4);
    renderBlocks();
  });
  gridSize6BtnEl.addEventListener("click", () => {
    // remove the default color from the default grid size which is set to 6
    gridSize6BtnEl.classList.remove("defaultGridSizeBtn");
    changeGridSize(6);
    renderBlocks();
  });
  gridSize8BtnEl.addEventListener("click", () => {
    // remove the default color from the default grid size which is set to 6
    gridSize6BtnEl.classList.remove("defaultGridSizeBtn");
    changeGridSize(8);
    renderBlocks();
  });
  playAgainstMachineBtnEl.addEventListener("click", () => {
    playingAgainstMachine = true;
    playAgainstMachineHanler();
  });
  playAgainstHumanBtnEl.addEventListener("click", startPlaying);
  resetBtnEl.addEventListener("click", function () {
    // check if a player won a final round, then reset without the need for confirmation
    if (playerOne.score === scroeToWin || playerTwo.score === scroeToWin) {
      // the time out is in case of another timeout, escpesialy in case of play aginst machine and reset click when it was the machine turn
      setTimeout(() => {
        resetGame();
      }, 400);
    }
    // if there is no final round win, then require confrimation before resetting
    // confirm returns true if user clicks on "ok" and false if "cancel" is clicked
    else if (
      confirm("Game status will be reset, are you sure you want to reset?") ===
      true
    ) {
      // the time out is in case of another timeout, escpesialy in case of play aginst machine and reset click when it was the machine turn
      setTimeout(() => {
        resetGame();
      }, 600);
    }
  });
  continueBtnEl.addEventListener("click", () => {
    continuingPlaying = true;
    // hide the button playAgainBtnEl
    continueBtnEl.style.display = "none";
    startPlaying();
  });
  /************** add event listeners to player btns **************/
  playerOneRollDiceBtnEl.addEventListener("click", () => {
    rollingDiceHandler(playerOne);
  });
  playerTwoRollDiceBtnEl.addEventListener("click", () => {
    rollingDiceHandler(playerTwo);
  });
  playerOnePassBtnEl.addEventListener("click", () => {
    passTurn(playerOne.id);
  });
  playerTwoPassBtnEl.addEventListener("click", () => {
    passTurn(playerTwo.id);
  });
});
