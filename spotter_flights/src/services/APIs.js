import axios from 'axios';

// Search Airports API

export const searchAirports = async (query) => {
    const options = {
      method: 'GET',
      url: 'https://sky-scrapper.p.rapidapi.com/api/v1/flights/searchAirport',
      params: { query, locale: 'en-US' },
      headers: {
        'x-rapidapi-key': '46087f101amsh6fc76e503e50159p17be12jsnbb84e23377cb',
        'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com'
      }
    };
  
    try {
      const response = await axios.request(options);
      return response;
    } catch (error) {
      console.error('Error making API request:', error);
      return undefined;
    }
  };
  
// GET Flight Results

export const fetchFlights = async({
    originSkyId,
    destinationSkyId,
    originEntityId,
    destinationEntityId,
    cabinClass,
    adults,
    startDate,
    endDate,
    currency = 'USD',
    market = 'en-US',
    countryCode = 'US'
}) => {
    if (!originSkyId || !destinationSkyId || !originEntityId || !destinationEntityId || !startDate) {
        throw new Error('Missing required fields for flight search.');
    }

    const options = {
        method: 'GET',
        url: 'https://sky-scrapper.p.rapidapi.com/api/v2/flights/searchFlightsWebComplete',
        params: {
          originSkyId,
          destinationSkyId,
          originEntityId,
          destinationEntityId,
          date: startDate,
          returnDate: endDate,
          cabinClass,
          adults,
          sortBy: 'best',
          currency,
          market,
          countryCode
        },
        headers: {
          'x-rapidapi-key': '46087f101amsh6fc76e503e50159p17be12jsnbb84e23377cb',
          'x-rapidapi-host': 'sky-scrapper.p.rapidapi.com'
        }
      };
      
      try {
          const response = await axios.request(options);
          return response.data;
      } catch (error) {
          console.error('Error fetching flight data:', error);
          throw error;
      }
};
