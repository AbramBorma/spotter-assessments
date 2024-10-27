import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button, Grid, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaginationRounded from './Pagination';
import '../static/styles/flight-results.css';
import AirlineSeatReclineExtraIcon from '@mui/icons-material/AirlineSeatReclineExtra';
import UsbIcon from '@mui/icons-material/Usb';
import { filter } from 'lodash';
import NoOppositeContent from './Timeline'

// Helper function to format flight duration
const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const FlightResultsPage = () => {
  const location = useLocation();
  const { flightsData } = location.state || {};
  console.log(flightsData);

  const [currentPage, setCurrentPage] = useState(1);
  const [filteredFlights, setFilteredFlights] = useState(flightsData.data.itineraries);
  const [selectedAirline, setSelectedAirline] = useState('');
  const itemsPerPage = 5;

  const [activeFilter, setActiveFilter] = useState('all');

  // Check if flight data and itineraries exist
  if (!flightsData || !flightsData.data || !flightsData.data.itineraries || flightsData.data.itineraries.length === 0) {
    return <Typography>No flights found. Please search again.</Typography>;
  }

  const totalItems = filteredFlights.length;

  const paginatedFlights = filteredFlights.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  }

  const resetFilters = () => {
    setFilteredFlights(flightsData.data.itineraries);
    setSelectedAirline('');
    setCurrentPage(1);
    handleFilterClick("all")
  };

  const filterByCheapest = () => {
    const sortedFlights = [...flightsData.data.itineraries].sort((a, b) => {
      const priceA = parseFloat(a.price.raw);
      const priceB = parseFloat(b.price.raw);
      return priceA - priceB;
    });
    setFilteredFlights(sortedFlights);
  };

  const filterByDirect = () => {
    const directFlights = flightsData.data.itineraries.filter(itinerary => itinerary.legs[0].stopCount === 0);
    setFilteredFlights(directFlights);
  };

  const filterByOneStop = () => {
    const oneStopFlights = flightsData.data.itineraries.filter(itinerary => itinerary.legs[0].stopCount === 1);
    setFilteredFlights(oneStopFlights);
  };

  const filterByTwoStops = () => {
    const twoStopFlights = flightsData.data.itineraries.filter(itinerary => itinerary.legs[0].stopCount === 2);
    setFilteredFlights(twoStopFlights);
  };

  // Handle airline filtering
  const handleAirlineChange = (event) => {
    setSelectedAirline(event.target.value);
    if (event.target.value) {
      const airlineFilteredFlights = flightsData.data.itineraries.filter(itinerary =>
        itinerary.legs[0].carriers.marketing[0].name === event.target.value
      );
      setFilteredFlights(airlineFilteredFlights);
    } else {
      setFilteredFlights(flightsData.data.itineraries);
    }
  };
  
  // Get the list of unique airlines with logos
  const airlines = Array.from(
    flightsData.data.itineraries.reduce((map, itinerary) => {
      const { name, logoUrl } = itinerary.legs[0].carriers.marketing[0];
      if (!map.has(name)) map.set(name, { name, logoUrl });
      return map;
    }, new Map()).values()
  );
  

  return (
    <div className="flight-results">
      <header className="flight-header">
        <Typography variant="h2">Flight Results</Typography>
        <Typography variant="h4" style={{color: '#0b4bb3'}}>{`Showing results from ${flightsData.data.itineraries[0].legs[0].origin.city},
         ${flightsData.data.itineraries[0].legs[0].origin.country}
          to ${flightsData.data.itineraries[0].legs[0].destination.city},
           ${flightsData.data.itineraries[0].legs[0].destination.country}.`}</Typography>
      </header>

      {/* Filter Buttons */}
      <div className="filter-buttons">
      <Button
          variant="contained"
          onClick={resetFilters}
          style={{ marginRight: '10px' }}
          className={activeFilter === "all" ? "active-filter" : ""}
        >
          All Flights
        </Button>
        <Button
          variant="contained"
          onClick={() => { filterByCheapest(); handleFilterClick("cheapest"); }}
          style={{ marginRight: '10px' }}
          className={activeFilter === "cheapest" ? "active-filter" : ""}
        >
          Cheapest
        </Button>
        <Button
          variant="contained"
          onClick={() => { filterByDirect(); handleFilterClick("direct"); }}
          style={{ marginRight: '10px' }}
          className={activeFilter === "direct" ? "active-filter" : ""}
        >
          Direct
        </Button>
        <Button
          variant="contained"
          onClick={() => { filterByOneStop(); handleFilterClick("oneStop"); }}
          style={{ marginRight: '10px' }}
          className={activeFilter === "oneStop" ? "active-filter" : ""}
        >
          1 Stop
        </Button>
        <Button
          variant="contained"
          onClick={() => { filterByTwoStops(); handleFilterClick("twoStops"); }}
          style={{ marginRight: '10px' }}
          className={activeFilter === "twoStops" ? "active-filter" : ""}
        >
          2 Stops
        </Button>

        {/* Select box for filtering by airline with logos */}
        <FormControl style={{ minWidth: 200 }} className='airline'>
          <InputLabel id="airline-select-label" style={{fontWeight: 'bold' }}> Select Airline</InputLabel>
          <Select
            labelId="airline-select-label"
            value={selectedAirline}
            onChange={handleAirlineChange}
          >
            <MenuItem value="">
              All Airlines
            </MenuItem>
            {airlines.map((airline, index) => (
              <MenuItem key={index} value={airline.name}>
                <Grid container alignItems="center">
                  <Grid item>
                    <img 
                      src={airline.logoUrl} 
                      alt={airline.name} 
                      style={{ width: '20px', marginRight: '8px' }} 
                    />
                  </Grid>
                  <Grid item>
                    {airline.name}
                  </Grid>
                </Grid>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      {/* Display paginated and filtered flights */}
      {paginatedFlights.map((itinerary) => (
  <Accordion key={itinerary.id} className="flight-accordion">
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls={`panel-${itinerary.id}-content`}
      id={`panel-${itinerary.id}-header`}
    >
      <Grid container alignItems="center" spacing={2}>
        {/* Airline Logo */}
        <Grid item xs={1} className='carrier-logo'>
          <img src={itinerary.legs[0].carriers.marketing[0].logoUrl} alt={itinerary.legs[0].carriers.marketing[0].name} style={{ width: '40px' }} />
        </Grid>

        {/* Departure and Arrival Times */}
        <Grid item xs={3} className='flight-travel-time'>
          <Typography variant="h6" style={{ fontWeight: 'bold' }}>
            {new Date(itinerary.legs[0].departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(itinerary.legs[0].arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Grid>

        {/* Flight Duration and Stops */}
        <Grid item xs={2} className='flight-dur-type'>
          <Typography className='flight-dur'>{formatDuration(itinerary.legs[0].durationInMinutes)}</Typography>
          <Typography className='flight-type'>{itinerary.legs[0].stopCount === 0 ? 'Nonstop' : `${itinerary.legs[0].stopCount} stop(s)`}</Typography>
        </Grid>

        {/* Departure and Arrival Airports */}
        <Grid item xs={2} style={{minWidth: '30%'}} className='flight-org-des'>
          <Typography style={{ fontWeight: 'bold'}}>
            {itinerary.legs[0].origin.city} ({itinerary.legs[0].origin.id}) ➔ {itinerary.legs[0].destination.city} ({itinerary.legs[0].destination.id})
          </Typography>
        </Grid>

        {/* Flight Price */}
        <Grid item xs={2} style={{ textAlign: 'right' }} className='flight-price'>
          <Typography variant="h6" style={{ fontWeight: 'bold', color: 'green' }}>
            {itinerary.price.formatted}
          </Typography>
        </Grid>
      </Grid>
    </AccordionSummary>

    <AccordionDetails className="flight-details" style={{ padding: '16px 24px' }}>
      <Grid container spacing={2} alignItems="center">
        {itinerary.legs[0].segments.map((segment, index) => (
          <Grid className='flight-basic-details' item xs={12} container spacing={2} key={index}>
            <h4>Leg {index + 1}</h4>
            <Grid item xs={1} style={{height: '100%'}} className='timeline'>
              <NoOppositeContent />
            </Grid>
            <Grid item xs={4} style={{minHeight: '100%'}} className='flights-time'>
              <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                Departure • {new Date(segment.departure).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
              <Typography>
                <strong>{new Date(segment.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> • {segment.origin.name} ({segment.origin.flightPlaceId})
              </Typography>

              <Typography variant="subtitle1" style={{ fontWeight: 'bold', marginTop: '8px' }}>
                Arrival • {new Date(segment.arrival).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
              <Typography>
                <strong>{new Date(segment.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> • {segment.destination.name} ({segment.destination.flightPlaceId})
              </Typography>
            </Grid>
            <Grid item xs={3} className='flight-duration'>
              <Typography style={{ marginTop: '20px', fontWeight: 'bold'}}>Travel time: {formatDuration(segment.durationInMinutes)}</Typography>
              <Typography style={{ fontStyle: 'italic'}}>
                {segment.marketingCarrier.name} • {itinerary.legs[0].segments[0].flightNumber}
              </Typography>
            </Grid>
            <Grid item xs={3} container spacing={1.5} className='flight-other-info'>
              <Grid item xs={1.5} className='flight-icons'>
                <Typography variant="body2">
                  <AirlineSeatReclineExtraIcon /> Below average legroom (29 in)
                </Typography>
              </Grid>
              <Grid item xs={1.5} className='flight-icons'>
                <Typography variant="body2">
                  <UsbIcon /> In-seat USB outlet
                </Typography>
              </Grid>
            </Grid>

            {/* Layover Information for the next segment */}
            {index < itinerary.legs[0].segments.length - 1 && (
              <Grid item xs={12} style={{ marginTop: '16px', textAlign: 'center' }} className='layover'>
                {(() => {
                  const arrivalTime = new Date(segment.arrival);
                  const nextDepartureTime = new Date(itinerary.legs[0].segments[index + 1].departure);
                  const layoverDuration = Math.abs(nextDepartureTime - arrivalTime);
                  const hours = Math.floor((layoverDuration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const minutes = Math.floor((layoverDuration % (1000 * 60 * 60)) / (1000 * 60));
                  return (
                    <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                      Layover Time: {hours}h {minutes}m
                    </Typography>
                  );
                })()}
              </Grid>
            )}
          </Grid>
        ))}
        
        <Grid item xs={12}>
          <Typography variant="body2" style={{marginBottom: '1rem', textAlign: 'left', fontStyle: 'italic', color: '#a9a9a9'}}>
            ** Checked baggage for a fee • Fare non-refundable, taxes may be refundable • Ticket changes for a fee
          </Typography>
        </Grid>

        <Grid item xs={12} style={{ textAlign: 'center', marginTop: '8px' }}>
          <Button variant="contained" color="success" className="select-flight-btn" size='large'>
            Select Flight
          </Button>
        </Grid>
      </Grid>
    </AccordionDetails>
  </Accordion>
))}


      <PaginationRounded
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default FlightResultsPage;
