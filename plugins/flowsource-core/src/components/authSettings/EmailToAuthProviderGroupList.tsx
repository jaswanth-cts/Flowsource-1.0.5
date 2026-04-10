import React, {useState, useEffect} from "react";
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Paper,
    Pagination,
    CircularProgress,
  } from '@mui/material';


import {ThemeProvider  } from '@mui/material/styles';
  
import useStyles, {themeGroupMapping} from '../../styles.js';
import Create_plus_icon from '../../Icons/Create_plus_icon.png';
import Delete_icon from '../../Icons/Delete_icon.png';
import Refresh_icon from '../../Icons/refresh_icon.png';

import { useApi, configApiRef ,fetchApiRef } from '@backstage/core-plugin-api';

import formatDate from "./customDateFormate";
import xss from 'xss';

import log from 'loglevel';

export default function EmailToAuthProviderGroupList({setShowList}:any) {

    const classes = useStyles();
    const config = useApi(configApiRef);
    const { fetch } = useApi(fetchApiRef);
    const emailToAuthProviderUrl = config.getString('backend.baseUrl') + `/api/flowsource-core/emails-to-provider-groups`
    const emailToRoleDeleteUrl = config.getString('backend.baseUrl') + `/api/flowsource-core/emailstogroups-delete-by-id`
    const [emailsGroupsData, setEmailsGroupsData] = useState<any[]>([]);
    const[selected, setSelected] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const rowsPerPage = 10;
    const [pageCount, setPageCount] = useState(1);
    const [refreshPage, setRefreshPage] = useState(false);
    
    const isRowSelected = (id:any) =>selected.includes(id);
    
    const handleRowClick = (id:any) =>{
        setSelected( (prevSelected:any) => 
            prevSelected.includes(id)
            ? prevSelected.filter((item:any)=> item!== id) 
            : [...prevSelected, id]
        );
    };
    const isDeleteDisabled = isRowSelected === null;

// Fetch data from API
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const url = emailToAuthProviderUrl + `?_page=${page + 1}&_pageSize=${rowsPerPage}`;
     
      const response = await fetch(url); // Replace with your API endpoint
      if (!response.ok) 
        throw new Error('Failed to fetch data');
      const result = await response.json();
      const total = result['total-count'];
      setEmailsGroupsData(result.data)
      let totRows = parseInt(total!, 10);
      //setTotalRows(totRows);
      setPageCount(Math.ceil(totRows/rowsPerPage))
    } catch (err) {
      
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, [page, rowsPerPage,refreshPage]);
const handleChangePage = (_:any, newPage:any) => {

  setPage(newPage-1);
};
//const handleChangeRowsPerPage = (event:any) => {
//  setRowsPerPage(parseInt(event.target.value, 10));
//  setPage(0);
//};


    return (
      <>

        <Box sx={{
          display:"flex",
          justifyContent:"flex-end"
        }}>
        <Button onClick={async () =>{
          try{
            var selectedItems =JSON.stringify(selected)
            const sanitizedSelected = xss(selectedItems);
            const response = await fetch(emailToRoleDeleteUrl, {
              method: 'DELETE',
              body: sanitizedSelected,
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (!response.ok){ 
              throw new Error('Failed to delete');
            }
            else if(response.ok) {
              setRefreshPage(!refreshPage);
                alert("Deleted successfully")
            }
          }catch(err){
            log.error(err)
          }
        }}
            sx={{gap:0.4, fontSize:"12px", fontWeight:"bold"}}>
            <img
                    src={Delete_icon}
                    alt="Delete"
                    title='Click to delete'
                    className={`${classes.deleteCreateIcon} ${isDeleteDisabled ? classes.disabledLink : ''}`}
                    style={{ width:"10px", height:"10px" ,cursor: isDeleteDisabled ? 'not-allowed' : 'pointer' }}
            />
            Delete</Button>
            <Button sx={{gap:0.4, fontSize:"12px", fontWeight:"bold"}} onClick={() =>{
                setRefreshPage(!refreshPage)
                setSelected([]);
                }}>
             <img
                      src={Refresh_icon}
                      alt="Refresh"
                      title='Click to Refresh'
                      style={{ width:"10px", height:"10px" }}
              />
            Refresh
          </Button>
          <Button sx={{gap:0.4, fontSize:"12px", fontWeight:"bold"}} onClick={() =>{setShowList(false)}}>
            <img
                      src={Create_plus_icon}
                      alt="Delete"
                      title='Click to delete Framework'
                      className={`${classes.deleteCreateIcon} ${isDeleteDisabled ? classes.disabledLink : ''}`}
                      style={{ width:"10px", height:"10px" ,cursor: isDeleteDisabled ? 'not-allowed' : 'pointer' }}
              />
            Create New
          </Button>
        </Box>
        <ThemeProvider theme={themeGroupMapping}>
        <TableContainer component={Paper}>
        {loading ? (
            <div className={`${classes.pageLoading}`}>
            <CircularProgress />
          </div>
          )
          :(<Table>
            <TableHead >
              <TableRow style={{color:"white"}}>
              <TableCell padding="checkbox">
                <input type="checkbox" className={`${classes.headerCheckBox}`}/>
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Auth Provider Group</TableCell>
                <TableCell>Created Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {emailsGroupsData.map((row)=>(
                <TableRow key={row.ID}>
                      <TableCell padding="checkbox">
                        <Checkbox checked={isRowSelected(row.ID)} 
                            onChange={() => handleRowClick(row.ID)}
                            onClick = {(e)=> e.stopPropagation()}
                        />
                    </TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.auth_provider_role}</TableCell>
                      <TableCell>{formatDate(row.created_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>)}
          <Pagination sx={{display:'flex', justifyContent: 'flex-end'}}
            count={pageCount} 
            variant="outlined"
            onChange={handleChangePage}
          />
         
        </TableContainer>
        </ThemeProvider>
      </>
    );
  }
  