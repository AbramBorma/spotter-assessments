import React, { useState, useCallback } from 'react';
import { Autocomplete, TextField, Select, MenuItem, Button, IconButton, InputAdornment } from '@mui/material';
import { SwapHoriz, Search, LocationOn, FlightTakeoff, Person } from '@mui/icons-material';
import DateRangeCalendar from './calendar';
import '../static/styles/flight-search.css';
import dayjs from 'dayjs';
import { searchAirports, fetchFlights } from '../services/APIs';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

// Cache object to store search results with timestamps
const flightCache = {};

const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

const FlightSearchBar = () => {
  const [tripType, setTripType] = useState('roundtrip');
  const [passengers, setPassengers] = useState(1);
  const [classType, setClassType] = useState('economy');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(1, 'week')]);
  const [fromOptions, setFromOptions] = useState([]);
  const [toOptions, setToOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFromInputChange = useCallback(debounce(async (inputValue) => {
    if (!inputValue) return;
    try {
      const response = await searchAirports(inputValue);
      if (response && Array.isArray(response.data.data)) {
        const airports = response.data.data.map(item => ({
          name: item.presentation.suggestionTitle || '',
          subtitle: item.presentation.subtitle || '',
          entityType: item.navigation.entityType || '',
          skyId: item.skyId,
          entityId: item.entityId
        }));
        setFromOptions(airports);
      } else {
        setFromOptions([]);
      }
    } catch (error) {
      console.error("Error fetching 'From' airports:", error);
      setFromOptions([]);
    }
  }, 500), []);

  const handleToInputChange = useCallback(debounce(async (inputValue) => {
    if (!inputValue) return;
    try {
      const response = await searchAirports(inputValue);
      if (response && Array.isArray(response.data.data)) {
        const airports = response.data.data.map(item => ({
          name: item.presentation.suggestionTitle || '',
          subtitle: item.presentation.subtitle || '',
          entityType: item.navigation.entityType || '',
          skyId: item.skyId,
          entityId: item.entityId
        }));
        setToOptions(airports);
      } else {
        setToOptions([]);
      }
    } catch (error) {
      console.error("Error fetching 'To' airports:", error);
      setToOptions([]);
    }
  }, 500), []);

  const createCacheKey = (from, to, tripType, startDate, endDate) => {
    return `${from.skyId}_${to.skyId}_${tripType}_${startDate}_${endDate}`;
  };

  const handleSearch = async () => {
    if (!from || !to || !from.skyId || !to.skyId || !from.entityId || !to.entityId) {
      alert('Please select both the origin and destination airports.');
      return;
    }

    const startDate = dateRange[0] ? dateRange[0].format('YYYY-MM-DD') : '';
    const endDate = tripType === 'roundtrip' ? (dateRange[1] ? dateRange[1].format('YYYY-MM-DD') : '') : '';

    const cacheKey = createCacheKey(from, to, tripType, startDate, endDate);

    // Check if the result is in the cache and still valid
    const cachedData = flightCache[cacheKey];
    if (cachedData && (Date.now() - cachedData.timestamp < CACHE_EXPIRATION_TIME)) {
      navigate('/flight-results', { state: { flightsData: cachedData.data } });
      return;
    }

    setLoading(true);

    try {
      const flightData = await fetchFlights({
        originSkyId: from.skyId,
        destinationSkyId: to.skyId,
        originEntityId: from.entityId,
        destinationEntityId: to.entityId,
        cabinClass: classType,
        adults: passengers,
        startDate,
        endDate: tripType === 'roundtrip' ? endDate : undefined
      });

      // Cache the result with timestamp
      flightCache[cacheKey] = {
        data: flightData,
        timestamp: Date.now()
      };

      navigate('/flight-results', { state: { flightsData: flightData } });
    } catch (error) {
      console.error('Error searching for flights:', error);
      alert('Error searching for flights, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flight-search-bar" style={{ position: 'relative' }}>
      {/* Show spinner when loading */}
      {loading && (
        <div className="spinner-container">
          <div className="spinner"></div>
        </div>
      )}

      {/* Keep the search form visible */}
      <div className="first-row">
        <Select
          value={tripType}
          onChange={(e) => {
            setTripType(e.target.value);
            if (e.target.value === 'oneway') {
              setDateRange([dateRange[0], null]);
            }
          }}
          displayEmpty
          variant="outlined"
        >
          <MenuItem value="roundtrip">Round trip</MenuItem>
          <MenuItem value="oneway">One way</MenuItem>
        </Select>

        <Select
          value={passengers}
          onChange={(e) => setPassengers(e.target.value)}
          displayEmpty
          variant="outlined"
          startAdornment={<Person />}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <MenuItem key={num} value={num}>{num}</MenuItem>
          ))}
        </Select>

        <Select
          value={classType}
          onChange={(e) => setClassType(e.target.value)}
          displayEmpty
          variant="outlined"
        >
          <MenuItem value="economy">Economy</MenuItem>
          <MenuItem value="business">Business</MenuItem>
        </Select>
      </div>

      <div className="second-row">
        <Autocomplete
          className="autocomplete-field"
          freeSolo
          disableClearable
          options={fromOptions}
          getOptionLabel={(option) => option.name || ''}
          renderOption={(props, option) => (
            <li {...props}>
              <FlightTakeoff style={{ marginRight: 10 }} />
              <div>
                <strong>{option.name}</strong>
                <div style={{ fontSize: 'small', color: '#6c757d' }}>{option.subtitle}</div>
              </div>
            </li>
          )}
          onInputChange={(event, newInputValue) => handleFromInputChange(newInputValue)}
          value={from || ''}
          onChange={(event, newValue) => setFrom(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="From"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <FlightTakeoff />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <IconButton className="swap-button">
          <SwapHoriz />
        </IconButton>

        <Autocomplete
          className="autocomplete-field"
          freeSolo
          disableClearable
          options={toOptions}
          getOptionLabel={(option) => option.name || ''}
          renderOption={(props, option) => (
            <li {...props}>
              <LocationOn style={{ marginRight: 10 }} />
              <div>
                <strong>{option.name}</strong>
                <div style={{ fontSize: 'small', color: '#6c757d' }}>{option.subtitle}</div>
              </div>
            </li>
          )}
          onInputChange={(event, newInputValue) => handleToInputChange(newInputValue)}
          value={to || ''}
          onChange={(event, newValue) => setTo(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="To"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOn />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        {tripType === 'roundtrip' ? (
          <DateRangeCalendar
            className="calendar-field"
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        ) : (
          <DateRangeCalendar
            className="calendar-field"
            dateRange={[dateRange[0]]}
            setDateRange={(newRange) => setDateRange([newRange[0], null])}
          />
        )}
      </div>

      <Button
        variant="contained"
        className="search-button"
        startIcon={<Search />}
        onClick={handleSearch}
      >
        Search
      </Button>
    </div>
  );
};

export default FlightSearchBar;