import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Score, CardGroup } from '../Layout.jsx';

import Card from './Card.jsx';
import socket from '../../socket.js';

const PlayerComponent = ({
  playerName,
  playerPoints,
  playerCards,
  isPlayer,
  isTurn = false,
}) => {
  const { roomID } = useParams();

  const handleCardSelection = (card, index) => {
    const data = { card: card, index: index, gameID: roomID };
    socket.emit('onCardSelected', data);
  };

  return (
    <Row className="align-items-center p-4 mt-4">
      <Col>
        <Score>
          <div>{playerName}</div>
          <div>Points: {playerPoints}</div>
        </Score>
      </Col>
      <Col xs={12} sm={9}>
        <CardGroup className="p-4">
          <Row>
            {playerCards.map((data, index) => (
              <Col key={`card-column-${index}`}>
                <Card
                  cardID={
                    isPlayer
                      ? `player-card-${index + 1}`
                      : `opponent-card-${index + 1}`
                  }
                  cardData={
                    isPlayer
                      ? data
                      : data && {
                          image:
                            'https://deckofcardsapi.com/static/img/back.png',
                          isVisible: true,
                        }
                  }
                  onClick={
                    isPlayer ? () => handleCardSelection(data, index) : () => {}
                  }
                  enableHover={isPlayer && isTurn ? true : false}
                ></Card>
              </Col>
            ))}
          </Row>
        </CardGroup>
      </Col>
    </Row>
  );
};

export default PlayerComponent;
