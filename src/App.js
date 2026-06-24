import './App.css';
import * as React from 'react';

import Button from '@mui/material/Button';
import { useState, useEffect, useMemo} from 'react';
import {Grid, Card, CardMedia, CardContent, Typography, Box, IconButton, AppBar, Toolbar, TextField} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

// generate dates based on todays date and a user defined range.
const generateDateRange = (range) => {
	const dates = [];
	const today = new Date();

	for (let i = -range; i <= range; i++) {
		const d = new Date();
		d.setDate(today.getDate() + i);

		const formatted = d.toISOString().split("T")[0]; // YYYY-MM-DD
		dates.push(formatted);
	}

	return dates;
};

// convert a datetime object from the server to a more readable format for the frontend.
const formatDate = (dateStr) => {
  const d = new Date(dateStr);

  return d.toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};


const App = () => {
    const [gridData, setGridData] = useState([]);
	const [entryValue, setEntryValue] = useState('');
	const [range, setRange] = useState(7); // how many days before and after todays date should be selectable? default to 7
	// selected date (default = today)
	const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

	useEffect(() => {
    	const existingEntry = gridData.find(item => {
			try{
				const getServerDate = new Date(item.date).toISOString().split("T")[0];
				return getServerDate === selectedDate;
			}catch{
				return false;
			}
		});
    
    	setEntryValue(existingEntry ? existingEntry.description : '');
	}, [selectedDate, gridData]);

	let link = 'http://127.0.0.1:5000/api'


	// populating the grid
	const getAll = React.useCallback(async () => {
		let path = '/view/';
		let url = link + path;

		try {
			const response = await fetch(url);
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);
			console.log(newData.items);

			setGridData(newData.items);
		} 
		catch (err) {
			console.log("Something went wrong!", err);
		}
	}, [link]);


	const handleDeleteItem = async (id) => {
		// also get the price history
		try {
			const outputDelete = await deleteItem(id);
			console.log(outputDelete)
			getAll(); // update grid after deletion.
		}
		catch (err) {
			console.error(err);
		}
	};

	// delete one item of id
	async function deleteItem(id) {
		// console.log(id);
		let path = '/item/' + id
		let url = link + path
		console.log(url)

		try{
			const response = await fetch(url, {method: "DELETE"});
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);

			console.log(newData)
			// return newData.item
        }
		catch (err) {
			console.log("Something went wrong!", err);
			alert(err);
			return null;
		}
	}

	const createEntry = async () => {
		let path = '/create/';
		let url = link + path;

		const payload = {
			// username: 'johndoe',
			description: entryValue,
			date: selectedDate
		};
		try {
			// send the value in the text field (entryValue) to the server
			const response = await fetch(url, {
				// method: 'POST',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json', // Tells server to expect JSON
					'Accept': 'application/json'        // Tells server client expects JSON back
				},
				body: JSON.stringify(payload)          // Converts object into a valid JSON string
			});

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const responseData = await response.json(); // Parses returning JSON string to object
			console.log('Success:', responseData);

			// setEntryValue(''); // clear the text field

			// setShowCatalog(true);
			getAll();
		} 
		catch (err) {
			console.error(err);
		}
	};

	// functions called right when the app starts.
	useEffect(() => {getAll();}, [getAll]); // populate the list/grid
	// recompute dates when the dropdown range value changes
	const dates = useMemo(() => generateDateRange(range), [range]);
	
  return (
    <div className="App">

		<AppBar position="static" sx={{bgcolor: '#00ff66'}}>
		<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
			<Box display="flex" alignItems="center" gap={2}>
				<img src="https://images.unsplash.com/vector-1775556825284-3b697bc284bf?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0" 
					alt="clotrack" 
					style={{ height: 35 }}
				/>
				<Typography variant="h6" fontWeight="bold" sx={{color: '#4f86f8'}}>
					CloTrack
				</Typography>

			</Box>
		</Toolbar>
		</AppBar>

		<Box sx={{display: "flex", alignItems: "center", gap: 2, padding: 2, borderBottom: "1px solid rgba(255,255,255,0.2)"}}>
			{/* refresh button */}
			<IconButton onClick={getAll} sx={{backgroundColor: "secondary.main", color: "white", "&:hover": { backgroundColor: "secondary.dark" }}}>
				<RefreshIcon />
			</IconButton>

			{/* recent date range selector */}
			<select value={range} onChange={(e) => setRange(Number(e.target.value))}>
				{[3, 7, 14].map((r) => (
				<option key={r} value={r}>
					±{r} days
				</option>
				))}
			</select>

			{/* date selection dropdown */}
			<select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
				{dates.map((date) => (
				<option key={date} value={date}>
					{date}
				</option>
				))}
			</select>
			
			{/* user input */}
			<TextField 
				id="outlined-controlled" 
				
				
			sx={{"& .MuiOutlinedInput-root": 
					{color: "#afc8fb","& fieldset": {borderColor: "#4f86f8",},

					"&:hover fieldset": {
					borderColor: "#afc8fb", 
					},

					"&.Mui-focused fieldset": {
					borderColor: "#4f86f8",
					borderWidth: "2px",
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
			<Button onClick={() => createEntry()} variant="outlined">Create</Button>


		</Box>


		<Grid container spacing={2} mt={4} justifyContent={'center'}>
		{gridData.map((item) => (
			<Grid item xs={12} sm={6} md={4} key={item.id}>
				<Card
				sx={{backgroundColor: "#222", color: "white", width: "100%", maxWidth: 400, overflow: "hidden"}}>
					<CardMedia component="img" height="400" image={item.icon} alt={item.name}/>
					
					<CardContent>
						<Box display="flex" justifyContent="space-between" alignItems="center">
							<Typography variant="h6">
								{formatDate(item.date)}  
							</Typography>
						</Box>

						<Box mt={2}>
							<Typography variant="body1" mt={1} sx={{wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "normal"}}>
								Outfit Description: {item.description}
							</Typography>

							<Button variant="outlined" color="error" size="small" onClick={() => handleDeleteItem(item.id)}>
								Delete Item
							</Button>
						</Box>
					</CardContent>
				</Card>
			</Grid>
		))}
		</Grid>
      

    </div>
  );
}

export default App;
