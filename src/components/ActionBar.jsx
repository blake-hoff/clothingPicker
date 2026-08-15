import * as React from 'react';

import {Box, IconButton, TextField, InputLabel, FormControl, Select, MenuItem} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddBoxIcon from '@mui/icons-material/AddBox';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import Tooltip from '@mui/material/Tooltip';
import OutlinedInput from '@mui/material/OutlinedInput';
import ListItemText from '@mui/material/ListItemText';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

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
	setSelectedType,
	filteredTypes,
	setFilteredTypes
	}) {
		const ITEM_HEIGHT = 48;
		const ITEM_PADDING_TOP = 8;
		const MenuProps = {
			slotProps: {
				paper: {
				style: {
					maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
					width: 250,
				},
				},
			},
		};

		const handleChange = (event) => {
    		const {
      			target: { value },
    			} = event;
			setFilteredTypes(typeof value === 'string' ? value.split(',') : value,);
  		};

    return (

		<Box sx={{position: "static", width: "100%", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, padding: 2, borderBottom: "5px solid rgba(255,255,255,0.2)"}}>
			{/* refresh button */}
			<Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
				<Tooltip title="Reload" arrow>
					<IconButton onClick={handleGetAll} sx={{backgroundColor: "secondary.main", color: "white", "&:hover": { backgroundColor: "secondary.dark" }}}>
						<RefreshIcon />
					</IconButton>
				</Tooltip>
			</Box>
			
			{/* calendar date selection */}
			<Box sx={{ display: 'flex', justifyContent: 'center', 
				gap: 2,
				flexGrow: 0,
				"& .MuiOutlinedInput-root": 
				{color: "#afc8fb",
					"& fieldset": {borderColor: "#4f86f8",},
					"&:hover fieldset": {borderColor: "#afc8fb", borderWidth: "3px",},
				},
				"& .MuiInputLabel-root": {color: "#afc8fb",},
			}}>
					<LocalizationProvider dateAdapter={AdapterDayjs}>
					<DatePicker
						label="Outfit Date*"
						value={selectedDate}
						onChange={(newDate) => setSelectedDate(dayjs(newDate))}
						slotProps={{ 
							textField: { 
							size: 'small',
							fullWidth: true // match input width to container
							} 
						}} 
					/>

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
			</Box>

			<Box 
				sx={{ 
					minWidth: "100px",
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
					<InputLabel id="select-label">Type*</InputLabel> 
					
					<Select 
						labelId="select-label"
						value={selectedType}
						onChange={(event) => setSelectedType(event.target.value)}
						label="Type*"
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
      			maxRows={3}
				id="outlined-controlled" 
				label={`${selectedType} Description*`}
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
				label={`${selectedType} Name`}
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

			<FormControl sx={{ ml: 'auto', mr:'auto', width: 200, "& .MuiOutlinedInput-root": 
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
					}, }}>
				<InputLabel id="demo-multiple-checkbox-label">Filter Types</InputLabel>
				<Select
					labelId="demo-multiple-checkbox-label"
					id="demo-multiple-checkbox"
					multiple
					value={filteredTypes}
					onChange={handleChange}
					input={<OutlinedInput label="Filter Types" />}
					renderValue={(selected) => selected.join(', ')}
					MenuProps={MenuProps}
				>
				{typeData.map((type) => {
					const selected = filteredTypes.includes(type.name);
					const SelectionIcon = selected ? CheckBoxIcon : CheckBoxOutlineBlankIcon;

					return(
					<MenuItem key={type.name} value={type.name}>
						<SelectionIcon
							fontSize="small"
							style={{ marginRight: 8, padding: 9, boxSizing: 'content-box'}}
						/>
						<ListItemText primary={type.name}/>
					</MenuItem>
					);
				})}
				</Select>
			</FormControl>

		</Box>
		
		);
}

export default React.memo(ActionBar);