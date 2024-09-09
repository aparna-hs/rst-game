import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/card';

const socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:3001');

const RST_Game = () => {
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [timer, setTimer] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [loser, setLoser] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [word, setWord] = useState('');
  const [invalidWord, setInvalidWord] = useState(false);

  useEffect(() => {
    socket.on('updateGame', (gameState) => {
      console.log('Received game state:', gameState);
      setPlayers(gameState.players);
      setCurrentPlayer(gameState.currentPlayer);
      setGameStarted(gameState.gameStarted);
      setCurrentWord(gameState.currentWord);
      setTimer(gameState.timer);
      setGameOver(gameState.gameOver);
      setWinner(gameState.winner);
      setLoser(gameState.loser);
      if (!gameState.gameStarted) {
        setWord('');
        setInvalidWord(false);
      }
    });

    socket.on('timerUpdate', (time) => {
      setTimer(time);
    });

    return () => {
      socket.off('updateGame');
      socket.off('timerUpdate');
    };
  }, []);

  const joinGame = () => {
    if (playerName.trim() !== '') {
      console.log('Joining game as:', playerName.trim());
      socket.emit('joinGame', playerName.trim());
    }
  };

  const submitWord = () => {
    if (word.trim() !== '') {
      console.log('Submitting word:', word.trim());
      socket.emit('submitWord', word.trim());
      setWord('');
      setInvalidWord(false);
    }
  };

  const handleWordChange = (e) => {
    const newWord = e.target.value;
    setWord(newWord);
    if (newWord.trim().toLowerCase().startsWith('r') || 
        newWord.trim().toLowerCase().startsWith('s') || 
        newWord.trim().toLowerCase().startsWith('t')) {
      setInvalidWord(true);
      socket.emit('submitWord', newWord.trim());
    } else {
      setInvalidWord(false);
    }
  };

  const isCurrentPlayerTurn = gameStarted && currentPlayer === playerName;

  console.log('Current state:', { playerName, currentPlayer, isCurrentPlayerTurn, gameStarted });

  return (
    <Card className="w-96 mx-auto">
      <CardHeader className="text-2xl font-bold text-center">R,S,T Word Game</CardHeader>
      <CardContent>
        {!gameStarted ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
              />
              <Button onClick={joinGame}>Join Game</Button>
            </div>
            <div>
              <p>Players joined: {players.join(', ')}</p>
              <p>{players.length < 2 ? 'Waiting for another player...' : 'Game will start soon!'}</p>
            </div>
          </div>
        ) : gameOver ? (
          <div className="text-center space-y-4">
            <p className="text-xl font-semibold">Game Over!</p>
            <p>Winner: {winner}</p>
            <p>Loser: {loser}</p>
            <p>The game will reset in a few seconds...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Players: {players.join(' vs ')}</p>
            <p>Current Player: {currentPlayer}</p>
            <p>Your Name: {playerName}</p>
            {isCurrentPlayerTurn ? (
              <p className="text-green-500 font-bold">It's your turn!</p>
            ) : (
              <p className="text-red-500">Waiting for opponent's move...</p>
            )}
            <p>Previous Word: {currentWord || 'None'}</p>
            <p>Time Left: {timer}s</p>
            <div className="flex space-x-2">
              <Input
                type="text"
                value={word}
                onChange={handleWordChange}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !invalidWord && isCurrentPlayerTurn) {
                    submitWord();
                  }
                }}
                placeholder="Enter a word"
                disabled={!isCurrentPlayerTurn || invalidWord}
                className={invalidWord ? 'border-red-500' : ''}
              />
              <Button 
                onClick={submitWord} 
                disabled={!isCurrentPlayerTurn || invalidWord || word.trim() === ''}
              >
                Submit
              </Button>
            </div>
            {invalidWord && <p className="text-red-500">Invalid word! Words starting with R, S, or T are not allowed.</p>}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        <div className="flex items-center space-x-2 text-yellow-600">
          <span>⚠️</span>
          <p className="text-sm">Don't start with R, S, or T!</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RST_Game;