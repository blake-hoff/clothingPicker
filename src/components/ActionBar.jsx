import * as React from 'react';

import { useEffect } from 'react';
import {Box, IconButton, TextField, InputLabel, FormControl, Select, MenuItem} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddBoxIcon from '@mui/icons-material/AddBox';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import Tooltip from '@mui/material/Tooltip';

// for the calendar date selection
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function ActionBar({
    handleGetAll,
	gridData,
    selectedDate,
    setSelectedDate,
    createEntry,
	entryValue,
	setEntryValue,
	entryName,
	setEntryName,
	typeData,
	selectedType,
	setSelectedType
	}) {
		useEffect(() => {
			const existingEntry = gridData.find(item => { // looking at all items in the grid, do some tests, 
			// if its true then set existing entry to this item, false (catch) then skip to the next element in the grid.
				try{
					const getServerDate = new Date(item.date).toISOString().split("T")[0]; // the server date has been formatted to a string.
					const getServerType = typeData[item.type_id-1].name; // a particular item in the grids type.
					// console.log('type', getServerType, selectedType, getServerType === selectedType);


					return getServerDate === selectedDate.format("YYYY-MM-DD") && getServerType === selectedType;
					// return getServerDate === selectedDate.format("YYYY-MM-DD") && getServerType === selectedType && !(entryName === item.name);
					
					// selectedDate is in datejs format, needs to be back to a string to compare to the grid (server) date
					// also need to make sure that the clients selected type matches this particular items type.
					// if both (and &&) match (===), it will return true.
				}catch{
					return false;
				}
			});
		
			setEntryValue(existingEntry ? existingEntry.description : '');
			setEntryName(existingEntry ? existingEntry.name : '');
		}, [selectedDate, selectedType, gridData, typeData, setEntryValue, setEntryName]);

    return (

		<Box sx={{position: "static", width: "100%", display: "flex", alignItems: "center", gap: 2, padding: 2, borderBottom: "5px solid rgba(255,255,255,0.2)"}}>
			{/* refresh button */}

			<Tooltip title="Reload" arrow>
				<IconButton onClick={handleGetAll} sx={{backgroundColor: "secondary.main", color: "white", "&:hover": { backgroundColor: "secondary.dark" }}}>
					<RefreshIcon />
				</IconButton>
			</Tooltip>
			
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
				
				<Tooltip title="Jump to Today" arrow>
					<IconButton onClick={() => setSelectedDate(dayjs(new Date()))} variant="contained" color="primary" sx={{ padding: '1px' }}>
						<EventRepeatIcon sx={{ fontSize: 32 }}/>
					</IconButton>
				</Tooltip>

				<Tooltip title="Back One Day" arrow>
					<IconButton onClick={() => setSelectedDate(selectedDate.subtract(1, 'day'))} variant="contained" color="primary" sx={{ padding: '1px' }}>
						<KeyboardArrowLeftIcon sx={{ fontSize: 32 }}/>
					</IconButton>
				</Tooltip>

				<Tooltip title="Forward One Day" arrow>
					<IconButton onClick={() => setSelectedDate(selectedDate.add(1, 'day'))} variant="contained" color="primary" sx={{ padding: '1px' }}>
						<KeyboardArrowRightIcon sx={{ fontSize: 32 }}/>
					</IconButton>
				</Tooltip>

			</LocalizationProvider>

			<Box 
				sx={{ 
					width: '5vw',
					display: 'flex', 
					justifyContent: 'center', 
					"& .MuiOutlinedInput-root": {
					color: "#afc8fb",
					"& fieldset": { borderColor: "#4f86f8" }, 
					"&:hover fieldset": { borderColor: "#afc8fb", borderWidth: "3px" }, 
					"&.Mui-focused fieldset": { borderColor: "#afc8fb" } 
					}, 
					"& .MuiInputLabel-root": { color: "#afc8fb" },
					"& .MuiInputLabel-root.Mui-focused": { color: "#afc8fb" }
				}}
			> 
				<FormControl fullWidth variant="outlined"> 
					<InputLabel id="select-label">Select Type</InputLabel> 
					
					<Select 
						labelId="select-label"
						value={selectedType}
						onChange={(event) => setSelectedType(event.target.value)}
						label="Select Type"
					> 
						{typeData.map((item) => ( 
						<MenuItem key={item.name} value={item.name}> 
							{item.name} 
						</MenuItem> 
						))} 
					</Select> 
				</FormControl> 
			</Box>

	  
			
			{/* user input */}
			<TextField 
				multiline
      			minRows={1}
      			maxRows={6}
				id="outlined-controlled" 
				label={"Enter " + selectedType + " Here"}
				value={entryValue} 
				onChange={(event) => {setEntryValue(event.target.value);}}

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
			/>

			<TextField 
				id="outlined-controlled" 
				label={"Enter Name Here"}
				value={entryName} 
				onChange={(event) => {setEntryName(event.target.value);}}

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
			/>

			{/* enter */}
			<Tooltip title="Enter" arrow>
				<IconButton onClick={() => createEntry(entryValue, selectedDate, selectedType, entryName)} variant="contained" color="primary" sx={{ padding: '16px' }}>
					<AddBoxIcon sx={{ fontSize: 32 }}/>
				</IconButton>
			</Tooltip>

		</Box>
		);
}

export default ActionBar;