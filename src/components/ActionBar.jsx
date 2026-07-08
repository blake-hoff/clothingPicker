import * as React from 'react';

import Button from '@mui/material/Button';
import {Box, IconButton, TextField} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddBoxIcon from '@mui/icons-material/AddBox';

// for the calendar date selection
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function ActionBar({
    getAll,
    selectedDate,
    setSelectedDate,
    entryValue,
    setEntryValue,
    createEntry}) {
    return (
		<Box sx={{position: "static", width: "100%", display: "flex", alignItems: "center", gap: 2, padding: 2, borderBottom: "5px solid rgba(255,255,255,0.2)"}}>
			{/* refresh button */}
			<IconButton onClick={getAll} sx={{backgroundColor: "secondary.main", color: "white", "&:hover": { backgroundColor: "secondary.dark" }}}>
				<RefreshIcon />
			</IconButton>
			
			{/* calendar date selection */}
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<Box sx={{ display: 'flex', justifyContent: 'center', 
					"& .MuiOutlinedInput-root": 
					{color: "#afc8fb","& fieldset": {borderColor: "#4f86f8",},

					"&:hover fieldset": {
					borderColor: "#afc8fb", 
					borderWidth: "3px",
					},
					},

				"& .MuiInputLabel-root": {
					color: "#afc8fb",
				},
				}}>
			
				<DatePicker
					label="Select Outfit Date"
					value={selectedDate}
					onChange={(newDate) => setSelectedDate(dayjs(newDate))}
					slotProps={{ 
						textField: { 
						size: 'small',
						fullWidth: true // match input width to container
						} 
					}} 
				/>

				</Box>
			</LocalizationProvider>
			
			{/* user input */}
			<TextField 
				id="outlined-controlled" 
				
				
			sx={{"& .MuiOutlinedInput-root": 
					{color: "#afc8fb","& fieldset": {borderColor: "#4f86f8",},

					"&:hover fieldset": {
					borderColor: "#afc8fb", 
					borderWidth: "3px",
					},

					"&.Mui-focused fieldset": {
					borderColor: "#4f86f8",
					borderWidth: "4px",
					},
				},

				"& .MuiInputLabel-root": {
					color: "#afc8fb",
				},
			}}

				label="Enter outfit here" 
				value={entryValue} 
				onChange={(event) => {setEntryValue(event.target.value);}}
			/>

			{/* search catalog*/}
			<IconButton onClick={() => createEntry()} variant="contained" color="primary" sx={{ padding: '16px' }}>
				<AddBoxIcon sx={{ fontSize: 32 }}/>
			</IconButton>


		</Box>
    );
}

export default ActionBar;