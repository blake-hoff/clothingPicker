import * as React from 'react';

import Button from '@mui/material/Button';
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
    <Grid container spacing={2} mt={4} justifyContent={'center'} sx={{px: 2}}>
            {gridData.map((item) => (
                <Grid item xs={12} sm={12} md={12} key={item.id} sx={{minWidth:0, width:"100%"}}>
                    <Card
                    sx={{backgroundColor: "#3e4132", color: "white", width: "90%", mx: "auto", overflow: "hidden", height: "auto"}}>
                        <CardContent>
                            
                            
                        <Grid container spacing={2} alignItems="center">
                            <Grid item sx={{ width: "20%" }}>
                                <Typography variant="h6">
                                    {formatDate(item.date)}  
                                </Typography>
                            </Grid>
                            
                            <Grid item sx={{ width: "60%" }}>
                                <Typography variant="body1" mt={1} sx={{wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal", display: "block"}}>
                                    {item.description}
                                </Typography>
                            </Grid>
                            
                            <Grid item sx={{ width: "10%", justifyContent: "flex-end"}}>
                                <Box sx={{ display: "flex", gap: 2, mt: 1, justifyContent: "flex-start" }}>
                                    <Button variant="contained" color="info" size="small" onClick={() => handleEditItem(item.date)}>
                                        <EditIcon/>
                                    </Button>

                                    <Button variant="contained" color="error" size="small" onClick={() => handleDeleteItem(item.id)}>
                                        <DeleteIcon />
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>

                            
                        </CardContent>
                    </Card>
                </Grid>
            ))}
            </Grid>
    );
}

export default ItemGrid;