import * as React from 'react';

import {Typography, Box, AppBar, Toolbar, IconButton, InputLabel, FormControl, Select, MenuItem} from '@mui/material';
// misc buttons
import LogoutIcon from '@mui/icons-material/Logout';
import Tooltip from '@mui/material/Tooltip';

function NavigationBar({
	title, 
	loggedIn, 
	handleLogout,
	server_url,
	set_server_url,
	url_list,
	usersName
	}) {
    return (
        <AppBar position="static" sx={{bgcolor: '#00ff66'}}>
			<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
				<Box flexWrap="wrap" display="flex" alignItems="center" gap={2} width={'100%'}>
					<img src="https://images.unsplash.com/vector-1775556825284-3b697bc284bf?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0" 
						alt="clotrack"
						style={{ height: 35 }}
					/>

					<Typography variant="h6" fontWeight="bold" sx={{color: '#4f86f8'}}>
						{ usersName ? `${title} - ${usersName}` : title}
					</Typography>

					{0 === 1 && <FormControl 
						sx={{
							"& .MuiOutlinedInput-root": {
								color: "#052668",
								"& fieldset": { borderColor: "#4f86f8" },
								"&:hover fieldset": { borderColor: "#052668", borderWidth: "3px" },
								"&.Mui-focused fieldset": { borderColor: "#4f86f8", borderWidth: "2px" },
							},
								"& .MuiInputLabel-root": { color: "#052668" },
								"& .MuiInputLabel-root.Mui-focused": { color: "#4f86f8" },
						}}
						variant="outlined"
						size="small"
					> 
						<InputLabel id="select-label">Select URL</InputLabel> 
							<Box>
								<Select
									labelId="select-label"
									value={server_url}
									onChange={(event) => set_server_url(event.target.value)}
									label="Select URL"
									size="small"
									
								> 
								{url_list.map((item, index) => {
									const [[name, url]] = Object.entries(item);
									
									return(
										<MenuItem key={index} value={url}>
											{name}
										</MenuItem>
									);
								})}
								</Select> 
							</Box>
					</FormControl>}


					{loggedIn === 1 &&
					<Tooltip title="Logout" arrow>
						<IconButton
							sx={{ ml: 'auto', transition: "all 0.3s ease",
								"&:hover": {
									backgroundColor: "#4f86f8",
									color: "#00ff66",
									boxShadow: "0px 0px 5px 5px #4f86f8",
								}
							}}
							onClick={() => handleLogout()}
							variant="contained"
							color="primary"
						>
							<LogoutIcon/>
						</IconButton>
					</Tooltip>}

				</Box>
			</Toolbar>
		</AppBar>
    );
}

export default NavigationBar;