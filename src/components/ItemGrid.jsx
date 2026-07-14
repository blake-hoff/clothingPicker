import * as React from 'react';

import { Button, IconButton } from '@mui/material';
import {Grid, Card, CardContent, Typography, Box} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function ItemGrid({
    gridData,
    formatDate,
    handleEditItem,
    handleDeleteItem
    }) {
    return (
    <Box sx={{ width: '99vw'}}>
    <Grid container spacing={2} mt={4} justifyContent={'center'} 
        className="item-grid"
        sx={{px: 4, pr: 4, maxHeight:'calc(80vh - 64px)', overflowY:'auto', alignContent:'flex-start'}}
        >
            {gridData.map((item) => (
                <Grid key={item.id} sx={{minWidth:0, width:"100%"}}>
                    <Card
                    sx={{backgroundColor: "#3e4132", color: "white", width: "90%", mx: "auto", overflow: "hidden", height: "auto"}}>
                        <CardContent>
                            
                            
                        <Grid container spacing={2} alignItems="center">
                            <Grid sx={{ width: "20%" }}>
                                <Typography variant="h6">
                                    {formatDate(item.date)}  
                                </Typography>
                            </Grid>
                            
                            <Grid sx={{ width: "60%" }}>
                                <Typography variant="body1" mt={1} sx={{wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal", display: "block"}}>
                                    {item.description}
                                </Typography>
                            </Grid>
                            
                            <Grid sx={{ width: "8%", justifyContent: "flex-end"}}>
                                <Box sx={{ display: "flex", gap: 0, mt: 1, justifyContent: "flex-start", backgroundColor: '#3e4132',   borderRadius: '10px'}}>
                                    <IconButton variant="contained" color="info" size="small" onClick={() => handleEditItem(item.date)}>
                                        <EditIcon/>
                                    </IconButton>

                                    <IconButton variant="contained" color="error" size="small" onClick={() => handleDeleteItem(item.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>

                            
                        </CardContent>
                    </Card>
                </Grid>
            ))}
            </Grid>
        </Box>
    );
}

export default ItemGrid;