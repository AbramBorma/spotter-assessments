import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import Home from './components/home'
import FlightResultsPage from './components/flightResultPage';

function App() {
  return (
    <>
      <div className="App">
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={ <Home /> }></Route>
            <Route path="/flight-results" element={ <FlightResultsPage />}></Route>
          </Routes>
        </Router>

      </div>
    </>

  );
}

export default App;
