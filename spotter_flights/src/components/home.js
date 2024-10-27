import '../static/styles/home.css'
import FlightSearchBar from './flightSearch';

const Home = () => {
    return (
        <div className="home">
            <h1>Welcome to Spotter Flights!</h1>
            <div className="image"></div>
            <div className="flight-form">
                <h2>Search Flights</h2>
                <FlightSearchBar />
            </div>
        </div>
    );
}
 
export default Home;