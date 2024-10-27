import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TextField from '@mui/material/TextField';

const DateRangeCalendar = ({ dateRange, setDateRange }) => {
  const [startDate, endDate] = dateRange;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Departure Date */}
      <DatePicker
        label="Departure"
        value={startDate}
        onChange={(newValue) => setDateRange([newValue, endDate])}
        renderInput={(params) => <TextField {...params} variant="outlined" />}
      />
      {/* Return Date */}
      <DatePicker
        label="Return"
        value={endDate}
        onChange={(newValue) => setDateRange([startDate, newValue])}
        renderInput={(params) => <TextField {...params} variant="outlined" />}
      />
    </LocalizationProvider>
  );
};

export default DateRangeCalendar;
