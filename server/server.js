const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let gameState = {
  players: [],
  currentPlayer: '',
  gameStarted: false,
  currentWord: '',
  timer: 5,
  gameOver: false,
  winner: null,
  loser: null
};

let timerInterval;

function resetGameState() {
  gameState = {
    players: [],
    currentPlayer: '',
    gameStarted: false,
    currentWord: '',
    timer: 5,
    gameOver: false,
    winner: null,
    loser: null
  };
  clearInterval(timerInterval);
}

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinGame', (playerName) => {
    if (gameState.players.length < 2 && !gameState.players.includes(playerName)) {
      gameState.players.push(playerName);
      socket.playerName = playerName;
      if (gameState.players.length === 2) {
        gameState.gameStarted = true;
        gameState.currentPlayer = gameState.players[0];
        startTimer();
      }
      io.emit('updateGame', gameState);
    }
  });

  socket.on('submitWord', (word) => {
    if (gameState.gameStarted && !gameState.gameOver && socket.playerName === gameState.currentPlayer) {
      if (word.toLowerCase().startsWith('r') || 
          word.toLowerCase().startsWith('s') || 
          word.toLowerCase().startsWith('t')) {
        endGame(socket.playerName);
      } else {
        gameState.currentWord = word;
        gameState.currentPlayer = gameState.players.find(player => player !== gameState.currentPlayer);
        resetTimer();
        io.emit('updateGame', gameState);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    if (socket.playerName && gameState.players.includes(socket.playerName)) {
      if (gameState.gameStarted && !gameState.gameOver) {
        const winner = gameState.players.find(player => player !== socket.playerName);
        endGame(socket.playerName, winner);
      } else {
        gameState.players = gameState.players.filter(player => player !== socket.playerName);
        if (gameState.players.length === 0) {
          resetGameState();
        }
        io.emit('updateGame', gameState);
      }
    }
  });
});

function startTimer() {
  clearInterval(timerInterval);
  gameState.timer = 5;
  timerInterval = setInterval(() => {
    gameState.timer--;
    io.emit('timerUpdate', gameState.timer);
    if (gameState.timer === 0) {
      endGame(gameState.currentPlayer);
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  startTimer();
}

function endGame(loser, winner = null) {
  clearInterval(timerInterval);
  gameState.gameOver = true;
  gameState.loser = loser;
  gameState.winner = winner || gameState.players.find(player => player !== loser);
  io.emit('updateGame', gameState);
  setTimeout(() => {
    resetGameState();
    io.emit('updateGame', gameState);
  }, 5000); // Reset game after 5 seconds
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));