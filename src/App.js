import './App.css';
import * as React from 'react';

import Button from '@mui/material/Button';
import { useState, useEffect } from 'react';
import {Grid, Card, CardMedia, CardContent, Typography, Box, IconButton, AppBar, Toolbar, TextField} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import Collapse from "@mui/material/Collapse";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";


const App = () => {
    const [gridData, setGridData] = useState([]);
	const [prices, setPrices] = useState({});
  	// const [itemID, setItemID] = React.useState('');
	const [expanded, setExpanded] = useState({});

	const [entryValue, setEntryValue] = useState('');
	const [catalogData, setCatalogData] = useState([]); // for the catalog scrollable window
	const [showCatalog, setShowCatalog] = useState(false);

	let link = 'http://127.0.0.1:5000/api'

	const getAll = React.useCallback(async () => {
		let path = '/item/';
		let url = link + path;

		try {
			const response = await fetch(url);
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);

			setGridData(newData.items);
		} 
		catch (err) {
			console.log("Something went wrong!", err);
		}
	}, [link]);

	const createEntry = async () => {
		let path = '/create/';
		let url = link + path;

		const payload = {
			// username: 'johndoe',
			description: entryValue
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
			// getAll();
		} 
		catch (err) {
			console.error(err);
		}
	};

	const handleItemClick = async (id) => {
		try {
			// console.log(response);

			// setItemID('');
			// getAll();
		} 
		catch (err) {
			console.error(err);
		}
	};



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
			{/* <IconButton onClick={getAll} sx={{backgroundColor: "secondary.main", color: "white", "&:hover": { backgroundColor: "secondary.dark" }}}>
				<RefreshIcon />
			</IconButton> */}
			
			<TextField 
				id="outlined-controlled" 
				
				sx={{input: { color: "black" }, label: {color: "secondary.dark"}, border: "1px solid rgba(0,0,255,0)", "&:hover": { backgroundColor: "white" }}}
				label="Enter outfit here" 
				value={entryValue} 
				onChange={(event) => {setEntryValue(event.target.value);}}
			/>

			{/* search catalog*/}
			<Button onClick={() => createEntry()} variant="outlined">Create</Button>

			{/* catalog search results */}
			{showCatalog && (catalogData.length > 0) && (
				<Box
					sx={{
						width: "30%", maxHeight: 100, // allows to see at least 3 items
						overflowY: "auto",
						// mt: 3, // top space above
						border: "3px solid #ffffff",
						borderRadius: 12,
						backgroundColor: "#006CC5",
						color: "#000000",
						
						// hidiing the scroll bar
						"&::-webkit-scrollbar": {display: "none",}, scrollbarWidth: "none", msOverflowStyle: "none",
					}}
				>
					{catalogData.map((item) => (
					<Box
						key={item.id} 
						onClick={() => handleItemClick(item.id)}
						sx={{padding: 2, cursor: "pointer", borderBottom: "1px solid #333", "&:hover": {backgroundColor: "secondary.dark", color: "#ffffff"},}}
					>
						{item.name}
					</Box>
					))}
				</Box>
			)}
		</Box>

    </div>
  );
}

export default App;
