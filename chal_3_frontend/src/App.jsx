// App.jsx
import React from 'react';
import MyNavbar from './components/Navbar';
import AddActivities from './components/AddActivities';
import ListActivities from './components/ListActivities';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

function App() {
  return (
    <div>
      <MyNavbar />
      <Router>
        <Routes>
          <Route path = "/addactivities" element = {<AddActivities/>}/>
          <Route path = "/listactivities" element = {<ListActivities/>}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
