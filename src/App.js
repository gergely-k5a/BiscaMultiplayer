
import './assests/App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CreateGameForm from './components/CreateGameForm';
import WaitingPage from './components/WaitingPage';
import CardGameBoard from './components/CardGameBoard'
// import React, { useState, useEffect } from 'react';
// import socket from 'socket.js';
// import { Layout } from './components/Layout';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<CreateGameForm />} />
          <Route path="/waiting/:roomId" element={< WaitingPage />} />
          <Route path="/game/:roomId" element={< CardGameBoard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

/*
App.Test.js

import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
*/
