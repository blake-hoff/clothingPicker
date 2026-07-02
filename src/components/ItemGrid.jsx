import * as React from 'react';

import Button from '@mui/material/Button';
import {Grid, Card, CardMedia, CardContent, Typography, Box} from '@mui/material';


function ItemGrid({
    gridData,
    formatDate,
    handleEditItem,
    handleDeleteItem
    }) {
    return (
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

                                <Box sx={{ display: "flex", gap: 2, mt: 2, justifyContent: "center" }}>
                                    <Button variant="outlined" color="info" size="small" onClick={() => handleEditItem(item.date)}>
                                        Edit Item
                                    </Button>

                                    <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteItem(item.id)}>
                                        Delete Item
                                    </Button>
                                </Box>

                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
            </Grid>
    );
}

export default ItemGrid;