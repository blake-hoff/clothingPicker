import * as React from 'react';

import { IconButton } from '@mui/material';
import {Grid, Card, CardContent, Typography, Box} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Tooltip from '@mui/material/Tooltip';

function ItemGrid({
    gridData,
    formatDate,
    handleDeleteItem,
    typeData, // using the id from gridData for a specific item, get the name of the type and the created_at
    selectedID,
    handleSetID,
    handleEditItem
    }) {
    return (
    <Box sx={{ width: '99vw'}}>
    <Grid container spacing={2} mt={4} justifyContent={'center'} 
        className="item-grid"
        sx={{px: 4, pr: 4, maxHeight:'calc(80vh - 80px)', overflowY:'scroll', alignContent:'flex-start'}}
        >
            {gridData.map((item) => (
                <Grid key={item.id} sx={{minWidth:0, width:"100%"}}>
                    <Card
                        sx={{backgroundColor: item.id === selectedID ? "#5f883b": "#3e4132", color: "white", width: "90%", mx: "auto", overflow: "hidden", height: "auto"}}>
        
                        <CardContent>
                        
                            
                        <Grid container spacing={1} alignItems="center">
                            <Grid sx={{ ml:'auto', width: "3%" }}>
                                <IconButton 
                                    onClick={() => handleSetID(item.id, item.date, typeData[item.type_id-1].name, item.name, item.description)}
                                    sx={{bgcolor:"#ffffff"}}
                                    >
                                    {item.id === selectedID ? 
                                    <CheckCircleIcon/> 
                                    : 
                                    <RadioButtonUncheckedIcon/> }
                                </IconButton>
                                
                            </Grid>

                            <Grid sx={{  ml:'auto', width: "20%" }}>
                                <Typography variant="h6">
                                    {formatDate(item.date)}
                                </Typography>
                                
                                <Typography variant="h6">
                                    {/* if the name is the same as the type or the name contains the type, */}
                                    {/* set the text to the format 'name'. */}
                                    {/* otherwise, */}
                                    {/* set the text to the format 'type - name' */}

                                    {typeData && typeData[item.type_id - 1] ? (
                                        ((typeData[item.type_id - 1].name === item.name) || item.name.includes(typeData[item.type_id - 1].name)) 
                                        ? (item.name) 
                                        : (`${typeData[item.type_id - 1].name} - ${item.name}`)
                                    ) : ("Loading...")}
                                </Typography>
                                
                            </Grid>
                            
                            <Grid sx={{ mr:'auto', ml:'auto', width: "60%" }}>
                                <Typography variant="body1" mt={1} sx={{wordBreak: "break-word", overflowWrap: "break-word", whiteSpace: "normal", display: "block"}}>
                                    {item.description}
                                </Typography>
                            </Grid>
                            
                            <Grid sx={{mr:1, ml:'auto', width: "8%", justifyContent: "flex-end"}}>
                                <Box sx={{ display: "flex", gap: 1, mt: 1, justifyContent: "center", backgroundColor:'#000000', borderRadius: '10px'}}>
                                    {item.id === selectedID && <IconButton 
                                        onClick={() => handleEditItem()}
                                        variant="contained" color="info" size="small" 
                                        >
                                        <Tooltip title="Edit Item" arrow>
                                            <EditIcon/>
                                        </Tooltip>
                                    </IconButton>}

                                    {item.id === selectedID && <IconButton variant="contained" color="error" size="small" onClick={() => handleDeleteItem(item.id)}>
                                        <Tooltip title="Delete Item" arrow>
                                            <DeleteIcon />
                                        </Tooltip>
                                    </IconButton>}
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