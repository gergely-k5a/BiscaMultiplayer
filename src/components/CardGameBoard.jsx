import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';

import { Layout, CardGroup } from './Layout.jsx';
import { Container, Row, Col } from 'react-bootstrap';
import '../assets/CardGameBoard.css';

import Card from './subcomponent/Card.jsx';
import Deck from './subcomponent/Deck.jsx';
import PlayerComponent from './subcomponent/PlayerComponent.jsx';
import TurnStatus from './subcomponent/TurnStatus.jsx';
import GameOver from './subcomponent/GameOver.jsx';
import NoCardsRemainingMessage from './subcomponent/NoCardsRemaining.jsx';
import socket from '../socket.js';

const CardGameBoard = () => {
  const { roomID } = useParams();

  const componentRef = useRef(null);

  const [playerState, setPlayerState] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [playerPoints, setPlayerPoints] = useState(0);
  const [playerCards, setPlayerCards] = useState([]);

  const [opponentState, setOpponentState] = useState(null);
  const [opponentName, setOpponentName] = useState('');
  const [opponentPoints, setOpponentPoints] = useState(0);
  const [opponentCards, setOpponentCards] = useState([]);

  const [trumpCard, setTrumpCard] = useState(null);
  const [remainingCards, setRemainingCards] = useState(null);
  const [currentTrick, setCurrentTrick] = useState([null, null]);
  const [turnStatus, setTurnStatus] = useState(false);
  const [isGameEnd, setIsGameEnd] = useState(false);

  useEffect(() => {
    socket.emit('getGameState', { gameID: roomID });

    socket.on('getGameStateResponse', (response) => {
      if (response.success) {
        const { gameState } = response;
        const playerState = gameState.players[socket.id];
        const playerName = playerState.name;
        const playerCards = playerState.hand;
        const playerScore = playerState.score;
        setPlayerName(playerName);
        setPlayerCards(playerCards);
        setPlayerPoints(playerScore);

        const opponentID = Object.keys(gameState.players).find(
          (id) => id !== socket.id
        );
        const opponentState = gameState.players[opponentID];
        const opponentName = opponentState.name;
        const opponentCards = opponentState.hand;
        const opponentScore = gameState.players[opponentID].score;
        setOpponentName(opponentName);
        setOpponentCards(opponentCards);
        setOpponentPoints(opponentScore);

        const remainingCards = gameState.board.remainingCards;
        const trumpCard = gameState.board.trumpCard;
        const currentTrick = gameState.board.currentTrick;
        const turnStatus =
          gameState?.turnOrder[gameState?.currentTurnIndex] === socket.id;
        setTrumpCard(trumpCard);
        setRemainingCards(remainingCards);
        setCurrentTrick(currentTrick);
        setTurnStatus(turnStatus);
      }
    });

    socket.on('getWinningStateResponse', (response) => {
      if (response.success) {
        const { gameState } = response;
        const playerState = gameState.players[socket.id];
        setPlayerState(playerState);

        const opponentID = Object.keys(gameState.players).find(
          (id) => id !== socket.id
        );
        const opponentState = gameState.players[opponentID];
        setOpponentState(opponentState);
        setIsGameEnd(true);

        socket.emit('gameEnd', {});
      }
    });

    return () => {
      socket.off('getGameStateResponse');
      socket.off('getWinningStateResponse');
    };
  }, [roomID]);

  const renderGameEndScreen = () => {
    return (
      <GameOver
        playerState={playerState}
        opponentState={opponentState}
        winnerName={
          playerState.score > opponentState.score
            ? playerState.name
            : opponentState.name
        }
      ></GameOver>
    );
  };

  return (
    <Container fluid className="game-container">
      {isGameEnd ? renderGameEndScreen() : null}
      {remainingCards === 0 && <NoCardsRemainingMessage duration={1500} />}
      <Layout className="game-content">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PlayerComponent
            playerName={opponentName}
            playerPoints={opponentPoints}
            playerCards={opponentCards}
            isPlayer={false}
          ></PlayerComponent>
          <Row>
            <Col xs={12} sm={12}>
              <Row className="g-3 h-100">
                <Col className="h-100" id={`deck-column`} xs={6} sm={6}>
                  <Deck
                    remainingCards={remainingCards}
                    trumpCard={trumpCard}
                  ></Deck>
                </Col>
                <Col className="h-100" id={`trick-column`} xs={6} sm={6}>
                  <CardGroup
                    className="px-3 p-md-4 h-100"
                    ref={componentRef}
                    style={{ display: 'flex' }}
                  >
                    <Row className="g-2 g-md-3">
                      {currentTrick.map((data, index) => (
                        <Col key={`card-column-${index}`}>
                          <Card
                            cardID={`current-trick-card-${index + 1}`}
                            cardData={data}
                            exitAnimation={{
                              scale: 1,
                              opacity: 1,
                              y: turnStatus ? '150vh' : '-150vh',
                            }}
                            animateFrom={
                              data?.cardOwnership === socket?.id
                                ? `player-card-${data?.index + 1}`
                                : `opponent-card-${data?.index + 1}`
                            }
                          ></Card>
                        </Col>
                      ))}
                    </Row>
                  </CardGroup>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="align-items-center pt-4 mt-4">
            <Col>
              <TurnStatus turnStatus={turnStatus}></TurnStatus>
            </Col>
          </Row>
          <PlayerComponent
            playerName={playerName}
            playerPoints={playerPoints}
            playerCards={playerCards}
            isPlayer={true}
            isTurn={turnStatus}
          ></PlayerComponent>
        </motion.div>
      </Layout>
    </Container>
  );
};

export default CardGameBoard;
