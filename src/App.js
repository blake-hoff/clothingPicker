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
	// selected date (default = today)
	const [selectedDate, setSelectedDate] = useState(dayjs());
	const [loggedIn, setLoggedIn] = useState(0);
	
	// site title passed into various components.
	const siteTitle = "CloTrack"
	let link = 'http://localhost:5000/api'

	useEffect(() => {
    	const existingEntry = gridData.find(item => {
			try{
				const getServerDate = new Date(item.date).toISOString().split("T")[0]; // the server date has been formatted to a string.
				return getServerDate === selectedDate.format("YYYY-MM-DD"); // selectedDate is in datejs format, needs to be back to a string.
			}catch{
				return false;
			}
		});
    
    	setEntryValue(existingEntry ? existingEntry.description : '');
	}, [selectedDate, gridData]);


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
			getAll();
			console.log("Logged in");
		}
		else{
			setLoggedIn(0);
			console.log("Not logged in");
		}
	}, [link]);

	// populating the grid
	const getAll = React.useCallback(async () => {
		let path = '/view/';
		let url = link + path;

		try {
			const response = await fetch(url, {credentials: 'include'});
			const text = await response.text();
			const cleanText = text.replace(/:NaN/g, ':null');
			const newData = JSON.parse(cleanText);
			// console.log(newData.items);
			console.log('get all items')

			setGridData(newData.items);
		} 
		catch (err) {
			console.log("Something went wrong!", err);
		}
	}, [link]);


	const handleDeleteItem = async (id) => {
		try {
			const outputDelete = await deleteItem(id);
			console.log(outputDelete)
			getAll(); // retrieve the updated grid after deletion.
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
			const response = await fetch(url, {method: "DELETE", credentials: 'include'});
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

	const handleEditItem = async (item_date) => {
		try {

			// update the selectedDate, which will automatically notice that the description is different.

			// console.log(item_date);
			const stringDate = new Date(item_date).toISOString().split("T")[0];
			setSelectedDate(dayjs(stringDate)); // the calendar component needs the date to be in datejs format

			// getAll();
		}
		catch (err) {
			console.error(err);
		}
	};

	const createEntry = async () => {
		let path = '/create/';
		let url = link + path;

		const payload = {
			// username: 'johndoe',
			description: entryValue,
			date: selectedDate.format('YYYY-MM-DD') // format the date in a simple string for the server.
		};
		try {
			// send the value in the text field (entryValue) to the server
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

			getAll();
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
	// useEffect(() => {getAll();}, [getAll]); // populate the list/grid
	useEffect(() => {checkLogin();},[checkLogin, loggedIn]); // check if user has login credentials already
  return (
    <div className="App">
		
		<div>
			<NavigationBar title={siteTitle} loggedIn={loggedIn} handleLogout={handleLogout} />

		</div>

		{loggedIn === 0 && <div>
			<LoginPage title={siteTitle} handleSignUp={handleSignUp} handleLogin={handleLogin}/>
			</div>}

		{loggedIn === 1 && <div>
			<ActionBar 
			getAll={getAll}
			selectedDate={selectedDate}
			setSelectedDate={setSelectedDate}
			entryValue={entryValue}
			setEntryValue={setEntryValue}
			createEntry={createEntry}
			/>




			<ItemGrid
			gridData={gridData}
			formatDate={formatDate}
			handleEditItem={handleEditItem}
			handleDeleteItem={handleDeleteItem}
			/>
		</div>}
		
    </div>
  );
}

export default App;
