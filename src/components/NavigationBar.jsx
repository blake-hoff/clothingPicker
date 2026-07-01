import * as React from 'react';

import {Typography, Box, AppBar, Toolbar} from '@mui/material';


function NavigationBar({title}) {
    return (
        <AppBar position="static" sx={{bgcolor: '#00ff66'}}>
			<Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
				<Box display="flex" alignItems="center" gap={2}>
					<img src="https://images.unsplash.com/vector-1775556825284-3b697bc284bf?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0" 
						alt="clotrack" 
						style={{ height: 35 }}
					/>
					<Typography variant="h6" fontWeight="bold" sx={{color: '#4f86f8'}}>
						{title}
					</Typography>

				</Box>
			</Toolbar>
		</AppBar>
    );
}

export default NavigationBar;