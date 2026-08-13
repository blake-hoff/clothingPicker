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
import { MessageProvider, useMessage } from './components/MessageContext';
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

const AppContent = () => {
	// site title passed into various components.
	const siteTitle = "Daily Journal App"

	// urls passed into various states and functions.
	let local_url = 'http://localhost:5000/api';
	let python_anywhere_url = 'https://blakehoff.pythonanywhere.com/api';
	let url_list = [
		{"local5000": local_url},
		{"pyAnywhere": python_anywhere_url}
	];

	const [server_url, set_server_url] = useState(python_anywhere_url);
	const [userID, setUserID] = useState(null);
	const [usersName, setUsersName] = useState(null);
    const [gridData, setGridData] = useState([]); // array of {id, type_id, name, icon, date, created_at, description}
	const [filteredData, setFilteredData] = useState([]);
	
	const [filteredTypes, setFilteredTypes] = useState(["Outfit", "Meal", "Event"]); // array of [typeName ...]
	const [typeData, setTypeData] = useState([]); // array of {name, created_at} (use [id-1] to access a particular id; ids start at 1)
	
	// ----- ActionBar Fields -----
	const [selectedType, setSelectedType] = useState('Outfit');
	const [selectedID, setSelectedID] = useState(-1); // stores the ID that will be used for editing
	const [entryValue, setEntryValue] = useState('');
	const [entryName, setEntryName] = useState('');
	
	// selected date (default = today)
	const [selectedDate, setSelectedDate] = useState(dayjs());
	const [loggedIn, setLoggedIn] = useState(-1); // set to -1 so neither loginpage or the user page is displayed until the server responds
	
	const { showMessage } = useMessage();

	// filtering the grid
	useEffect(() => {
		const filteredResults = gridData.filter(item => { // looking at all items in the grid, do some tests, 
			try{
				const getGridItemType = typeData[item.type_id-1].name; 

				return filteredTypes.includes(getGridItemType);
			}catch{
				return false;
			}
		});

		setFilteredData(filteredResults);
		
	}, [gridData, filteredTypes, typeData]);

	// populating the grid
	const getGridData = React.useCallback(async () => {
		let path = '/view/';
		let url = server_url + path;
		const token = localStorage.getItem("authToken");

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${token}`
				}
			}
			);

			const data = await response.json();
			console.log(data.items);
			console.log('get all items')

			setGridData(data.items);
		} 
		catch (err) {
			console.log("Something went wrong!", err);
		}
	}, [server_url]);

	// populating the type data dropdown/filter
	const getTypeData = React.useCallback(async () => {
		let path = '/types/';
		let url = server_url + path;
		const token = localStorage.getItem("authToken");

		try {
			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${token}`
				}}
			);

			const data = await response.json();
			console.log(data.items);
			console.log('get all types')

			setTypeData(data.items);
		} 
		catch (err) {
			console.log("Something went wrong!", err);
		}
	}, [server_url]);

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
		let path = '/auth/user/';
		let url = server_url + path;
		const token = localStorage.getItem("authToken");

		const response = await fetch(url, {
			method: "GET",
			headers: {
				"Authorization": `Bearer ${token}`
			}}
		);

		const data = await response.json();

		if(data.logged_in){
			setLoggedIn(1);
			handleGetAll();
			setUserID(data.id);
			setUsersName(data.username)
			console.log("Logged in");
		}
		else{
			setLoggedIn(0);
			localStorage.removeItem("authToken");
			setUserID(null);
			console.log("Not logged in");
		}
	}, [handleGetAll, server_url]);

	const handleSetID = React.useCallback(async (item_id, item_date, item_type, item_name, item_desc) => {
		try {
			const stringDate = new Date(item_date).toISOString().split("T")[0];
			setSelectedDate(dayjs(stringDate)); // the calendar component needs the date to be in datejs format
			setSelectedType(item_type);
			setEntryName(item_name); // can use the grid data since i have the id already.
			setEntryValue(item_desc);
			console.log(selectedID, item_id);
			if(selectedID === item_id){
				setSelectedID(-1);
				setSelectedDate(dayjs());
				// resetting the date auto resets the other fields in action bar.
			}
			else{
				setSelectedID(item_id);
			}
		}
		catch (err) {
			console.error(err);
		}
	}, [selectedID]);

	const handleEditItem = React.useCallback(async () => {
		let path = '/update/' + selectedID;
		let url = server_url + path;
		const token = localStorage.getItem("authToken");

		const payload = {
			description: entryValue,
			date: selectedDate.format('YYYY-MM-DD'),
			type_name: selectedType,
			entry_name: entryName
			};
			try {
				// send the value in the text field to the server
				const response = await fetch(url, {
					method: 'POST',
					headers: {
						"Authorization": `Bearer ${token}`,
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
			}
			catch (err) {
				console.error("Something went wrong!", err);
				alert(err);
				return null;
			}
			handleGetAll(); // retrieve the updated grid after deletion.
	}, [handleGetAll, server_url, entryName, selectedID, entryValue, selectedDate, selectedType]);

	const handleDeleteItem = React.useCallback(async (id) => {
			let path = '/item/' + id
			let url = server_url + path
			console.log(url)
			const token = localStorage.getItem("authToken");

			try{
				const response = await fetch(url, {
					method: "DELETE", 
					headers: {
						"Authorization": `Bearer ${token}`
					}}
				);
				const data = await response.json();

				console.log(data)
			}
			catch (err) {
				console.error("Something went wrong!", err);
				alert(err);
				return null;
			}
			// clearActionBar();
			handleGetAll(); // retrieve the updated grid after deletion.
	}, [handleGetAll, server_url]);

	const createEntry = async (entryValue, selectedDate, selectedType, selectedName) => {
		let path = '/create/';
		let url = server_url + path;
		const token = localStorage.getItem("authToken");

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
				headers: {
					"Authorization": `Bearer ${token}`,
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
		let url = server_url + path;

		console.log(username, email, password)

		const payload = {
			username: username,
			email: email,
			password: password,
		};
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json', // Tells server to expect JSON
					'Accept': 'application/json'        // Tells server client expects JSON back
				},
				body: JSON.stringify(payload)          // Converts object into a valid JSON string
			});

			if (!response.ok) {
				const responseData = await response.json();
				
				showMessage(
					`Invalid (${response.status})`,
					responseData.message,
					'error'
				);

				throw new Error(`HTTP error! Status: ${response.status} Message: ${responseData.message}`);
			}

			const responseData = await response.json(); // Parses returning JSON string to object
			console.log('Success:', responseData);
			if(response.status === 200){
				showMessage(
					`Successfully created account "${username}"! (${response.status})`,
					responseData.message,
					'success'
				);
			}
			else{
				showMessage(
					`Could not create account. (${response.status})`,
					responseData.message,
					'error'
				);
			}
		} 
		catch (err) {
			console.error(err);
		}
	};

	const handleLogin = async (username, password) => {
		let path = '/auth/login/';
		let url = server_url + path;

		console.log(username, password)

		const payload = {
			username: username,
			password: password
		};
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json', // Tells server to expect JSON
					'Accept': 'application/json'        // Tells server client expects JSON back
				},
				body: JSON.stringify(payload)          // Converts object into a valid JSON string
			});

			if (!response.ok) {
				const responseData = await response.json();
				
				showMessage(
					`Invalid (${response.status})`,
					responseData.message,
					'error'
				);

				throw new Error(`HTTP error! Status: ${response.status} Message: ${responseData.message}`);
			}

			const responseData = await response.json();
			console.log('Success:', responseData);
			localStorage.setItem("authToken", responseData.token);
			checkLogin();
			showMessage(
					`Logged in successfully! (${response.status})`,
					responseData.message,
					'success'
				);
		} 
		catch (err) {
			console.error(err);
		}
	};

	const handleLogout = React.useCallback(async () => {
		let path = '/auth/logout/';
		let url = server_url + path;
		console.log(url);
		const token = localStorage.getItem("authToken");

		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					"Authorization": `Bearer ${token}`,
					'Content-Type': 'application/json', // Tells server to expect JSON
					'Accept': 'application/json'        // Tells server client expects JSON back
				}}
			);

			if (!response.ok) {
				const responseData = await response.json();
				throw new Error(`HTTP error! Status: ${response.status} Message: ${responseData.message}`);

			}

			const responseData = await response.json(); // Parses returning JSON string to object
			console.log('Success:', responseData);
			setLoggedIn(0);
			localStorage.removeItem("authToken");
			setUserID(null);
			setUsersName(null);
		}
		catch (err) {
			console.error(err);
		}
	}, [server_url]);

	// check if user has login credentials already
	useEffect(() => {checkLogin();},[checkLogin, server_url]); 
  return (
		<div className="App">
			<MessageScreen />
			
			<NavigationBar 
				title={siteTitle}
				loggedIn={loggedIn}
				handleLogout={handleLogout}
				server_url={server_url}
				set_server_url={set_server_url}
				url_list={url_list}
				usersName={usersName}
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
					selectedID={selectedID}
					setSelectedID={setSelectedID}
					filteredTypes={filteredTypes}
					setFilteredTypes={setFilteredTypes}
					/>

				<ItemGrid
					filteredData={filteredData}
					formatDate={formatDate}
					handleDeleteItem={handleDeleteItem}
					typeData={typeData}
					selectedID={selectedID}
					handleSetID={handleSetID}
					handleEditItem={handleEditItem}
					/>
			</div>
			}
			
		</div>
  );
};

const App = () => {
	return (
		<MessageProvider>
			<AppContent/>
		</MessageProvider>
	);
}

export default App;
