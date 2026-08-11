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
	url_list
	}) {
    return (
        <AppBar position="static" sx={{bgcolor: '#00ff66'}}>
			<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
				<Box display="flex" alignItems="center" gap={2} width={'100%'}>
					<img src="https://images.unsplash.com/vector-1775556825284-3b697bc284bf?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0" 
						alt="clotrack"
						style={{ height: 35 }}
					/>
					<Typography variant="h6" fontWeight="bold" sx={{color: '#4f86f8'}}>
						{title}
					</Typography>

					<FormControl 
						sx={{ 
						width: '8vw',
						'& .MuiInputLabel-root': { color: '#e80606' }
						}} 
						variant="outlined"
						size="small"
					> 
						<InputLabel id="select-label">Select URL</InputLabel> 
							<Box
								sx={{
									"& .MuiOutlinedInput-root": 
									{color: "#052668",
										"& fieldset": {borderColor: "#4f86f8",},
										"&:hover fieldset": {
											borderColor: "#afc8fb", 
											borderWidth: "3px",
										},
									},

									"& .MuiInputLabel-root": {
										color: "#afc8fb",
									},
								}}
							>
							
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
					</FormControl>


					{loggedIn === 1 &&
					<Tooltip title="Logout" arrow>
						<IconButton
							sx={{ ml: 'auto' }}
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