// import React, {useState, useEffect} from 'react'

import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';

import Home from './pages/Home';
import Host from './pages/Host';
import Room from './pages/Room';

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
            <Route path='/host/:roomId' element={<Host />} />
          <Route path='/:roomId' element={<Room />}/>
        </Routes>
      </Router>
  );
};

export default App;
