import './App.css';
import * as React from 'react';

import { useState, useEffect } from 'react';

// for the calendar date selection
import dayjs from 'dayjs';

// components
import NavigationBar from './components/NavigationBar';
import ActionBar from './components/ActionBar';
import ItemGrid from './components/ItemGrid';
import LoginPage from './components/LoginPage';
import MessageScreen from './components/MessageScreen';


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
    const [gridData, setGridData] = useState([]); // array of {id, type_id, name, icon, date, created_at, description}
	
	const [typeData, setTypeData] = useState([]); // array of {name, created_at} (use [id-1] to access a particular id; ids start at 1)
	const [selectedType, setSelectedType] = useState('Outfit');

	const [selectedID, setSelectedID] = useState(-1); // stores the ID that will be used for editing

	const [entryValue, setEntryValue] = useState('');
	const [entryName, setEntryName] = useState('');
	
	// selected date (default = today)
	const [selectedDate, setSelectedDate] = useState(dayjs());
	const [loggedIn, setLoggedIn] = useState(-1); // set to -1 so neither loginpage or the user page is displayed until the server responds
	
	// site title passed into various components.
	const siteTitle = "CloTrack"
	// let link = 'http://localhost:5000/api'
	let link = 'https://blakehoff.pythonanywhere.com/api'


	// populating the grid
	const getGridData = React.useCallback(async () => {
		let path = '/view/';
		let url = link + path;

		try {
			const response = await fetch(url, {credentials: 'include'}); // must be authorized user
			const data = await response.json();
			console.log(data.items);
			console.log('get all items')

			setGridData(data.items);
		} 
		catch (err) {
			console.log("Something went wrong!", err);
		}
	}, [link]);

	// populating the type data dropdown/filter
	const getTypeData = React.useCallback(async () => {
		let path = '/types/';
		let url = link + path;

		try {
			const response = await fetch(url, {credentials: 'include'}); // must be authorized user
			const data = await response.json();
			console.log(data.items);
			console.log('get all types')

			setTypeData(data.items);
		} 
		catch (err) {
			console.log("Something went wrong!", err);
		}
	}, [link]);

	const handleGetAll = React.useCallback(async () => {
		try {
			getGridData();
			getTypeData();
		}
		catch (err) {
			console.error(err);
		}
	}, [getGridData, getTypeData]);

	// determine if the user has a session
	const checkLogin = React.useCallback(async () => {
	// async function checkLogin() {
		let path = '/auth/user/';
		let url = link + path;
		
		const response = await fetch(url, {credentials: "include"});

		const data = await response.json();

		console.log(data);

		if(data.logged_in){
			setLoggedIn(1);
			handleGetAll();
			console.log("Logged in");
		}
		else{
			setLoggedIn(0);
			console.log("Not logged in");
		}
	}, [handleGetAll, link]);

	const loadActionFields = React.useCallback(async (item_date, item_type, item_name, item_desc) => {
		try {
			const stringDate = new Date(item_date).toISOString().split("T")[0];
			setSelectedDate(dayjs(stringDate)); // the calendar component needs the date to be in datejs format
			setSelectedType(item_type);
			setEntryName(item_name);
			setEntryValue(item_desc);
		}
		catch (err) {
			console.error(err);
		}
	}, []);

	const handleDeleteItem = React.useCallback(async (id) => {
			let path = '/item/' + id
			let url = link + path
			console.log(url)

			try{
				const response = await fetch(url, {method: "DELETE", credentials: 'include'});
				const text = await response.text();
				const cleanText = text.replace(/:NaN/g, ':null');
				const newData = JSON.parse(cleanText);

				console.log(newData)
			}
			catch (err) {
				console.error("Something went wrong!", err);
				alert(err);
				return null;
			}
			handleGetAll(); // retrieve the updated grid after deletion.
	}, [handleGetAll, link]);

	const createEntry = async (entryValue, selectedDate, selectedType, selectedName) => {
		let path = '/create/';
		let url = link + path;

		const payload = {
			description: entryValue,
			date: selectedDate.format('YYYY-MM-DD'), // format the date in a simple string for the server.
			type_name: selectedType,
			entry_name: selectedName
		};
		try {
			// send the value in the text field to the server
			const response = await fetch(url, {
				method: 'POST',
				credentials: "include",
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

			handleGetAll();
		} 
		catch (err) {
			console.error(err);
		}
	};

	const handleSignUp = async (username, email, password) => {
		let path = '/auth/signup/';
		let url = link + path;

		console.log(username, email, password)

		const payload = {
			username: username,
			email: email,
			password: password,
		};
		try {
			const response = await fetch(url, {
				method: 'POST',
				credentials: 'include',
				headers: {
					'Content-Type': 'application/json', // Tells server to expect JSON
					'Accept': 'application/json'        // Tells server client expects JSON back
				},
				body: JSON.stringify(payload)          // Converts object into a valid JSON string
			});

			if (!response.ok) {
				const responseData = await response.json();
				
				MessageScreen({
					title: response.status,
					message: responseData.message,
					type: 'error'
				});

				throw new Error(`HTTP error! Status: ${response.status} Message: ${responseData.message}`);
			}

			const responseData = await response.json(); // Parses returning JSON string to object
			console.log('Success:', responseData);
		} 
		catch (err) {
			console.error(err);
		}
	};

	const handleLogin = async (username, password) => {
		let path = '/auth/login/';
		let url = link + path;

		console.log(username, password)

		const payload = {
			username: username,
			password: password
		};
		try {
			const response = await fetch(url, {
				method: 'POST',
				credentials: "include",
				headers: {
					'Content-Type': 'application/json', // Tells server to expect JSON
					'Accept': 'application/json'        // Tells server client expects JSON back
				},
				body: JSON.stringify(payload)          // Converts object into a valid JSON string
			});

			if (!response.ok) {
				const responseData = await response.json();
				
				MessageScreen({
					title: response.status,
					message: responseData.message,
					type: 'error'
				});

				throw new Error(`HTTP error! Status: ${response.status} Message: ${responseData.message}`);
			}

			const responseData = await response.json(); // Parses returning JSON string to object
			console.log('Success:', responseData);
			setLoggedIn(1);
		} 
		catch (err) {
			console.error(err);
		}
	};

	const handleLogout = async () => {
		let path = '/auth/logout/';
		let url = link + path;
		console.log(url);

		try {
			const response = await fetch(url, {
				method: 'POST',
				credentials: "include",
				headers: {
					'Content-Type': 'application/json', // Tells server to expect JSON
					'Accept': 'application/json'        // Tells server client expects JSON back
				},
			});

			if (!response.ok) {
				const responseData = await response.json();
				throw new Error(`HTTP error! Status: ${response.status} Message: ${responseData.message}`);

			}

			const responseData = await response.json(); // Parses returning JSON string to object
			console.log('Success:', responseData);
			setLoggedIn(0);
		} 
		catch (err) {
			console.error(err);
		}
	};

	// functions called right when the app starts.
	useEffect(() => {checkLogin();},[checkLogin, loggedIn]); // check if user has login credentials already
  return (
    <div className="App">
		
		<NavigationBar 
			title={siteTitle}
			loggedIn={loggedIn}
			handleLogout={handleLogout} 
		/>

		{loggedIn === 0 &&
			<LoginPage 
				title={siteTitle} 
				handleSignUp={handleSignUp} 
				handleLogin={handleLogin}
			/>
		}

		{loggedIn === 1 && <div>
			<ActionBar 
				handleGetAll={handleGetAll}
				selectedDate={selectedDate}
				setSelectedDate={setSelectedDate}
				createEntry={createEntry}
				gridData={gridData}
				entryValue={entryValue}
				setEntryValue={setEntryValue}
				entryName={entryName}
				setEntryName={setEntryName}
				typeData={typeData}
				selectedType={selectedType}
				setSelectedType={setSelectedType}
			/>

			<ItemGrid
				gridData={gridData}
				formatDate={formatDate}
				handleDeleteItem={handleDeleteItem}
				typeData={typeData}
				loadActionFields={loadActionFields}
			/>
		</div>
		}
		
    </div>
  );
}

export default App;
