import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    Typography,
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useApi, configApiRef, fetchApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import xss from 'xss';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const BookingRequests = (props) => {
    const { fetch } = useApi(fetchApiRef);
    const entity = useEntity();
    const appid = entity.entity.metadata.appid;
    const config = useApi(configApiRef);
    
    const backendBaseApiUrl =
        config.getString('backend.baseUrl') + '/api/flowsource-environment-reservation/';
    const [openDialog, setOpenDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [canEditFields, setCanEditFields] = useState(false);
    const [bookingData, setBookingData] = useState([]);
    const [maintenanceRequests, setMaintenanceRequests] = useState([]);

    const statusOptions = ['Yet to Start', 'In Progress', 'Completed'];
    const identity = useApi(identityApiRef);
        const profile = identity.getProfile(); // { displayName?, email?, picture? }
        const loggedInEmail = profile?.email || '';
        const loggedInUserId = identity.getUserId(); // fallback if no email
        const defaultRequestor = loggedInEmail || loggedInUserId || 'unknown';
    const initialStartDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
    const initialEndDate = new Date(initialStartDate.getTime() + 60 * 60 * 1000); // 1 hour after initialStartDate

    const initialFormValues = {
        name: '',
        description: '',
        startDate: initialStartDate.toISOString(),
        endDate: initialEndDate.toISOString(),
        status: statusOptions[0],
        requestedBy: defaultRequestor,
    };

    const [formValues, setFormValues] = useState(initialFormValues);


    const columns = {
        name: 'Booking Name',
        description: 'Description',
        startDate: 'Start Date',
        endDate: 'End Date',
        requestedBy: 'Requested By',
        status: 'Status',
    };

    // Function to format date in IST timezone
    const formatDateToIST = (dateString) => {
        if (!dateString) return '';
        return dayjs(dateString).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm');
    };

   
    useEffect(() => {
        const fetchBookingRequests = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${backendBaseApiUrl}booking-requests?appid=${appid}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch booking requests');
                }
                const data = await response.json();
                setBookingData(data);
                props.setBookingData(data);
            } catch (error) {
                console.error('Error fetching booking requests:', error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchBookingRequests();
    }, [appid]); // Add appid to dependencies if it's available in scope

    const handleOpenDialog = () => {
        setIsEditMode(false);
        setFormValues(initialFormValues);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormValues(initialFormValues);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditClick = (row) => {
        setIsEditMode(true);
        setCanEditFields(false);
        setEditRow(row);
        
        setFormValues({
            name: row.name,
            description: row.description,
            startDate: row.startDate, // Use original format
            endDate: row.endDate, // Use original format
            status: row.status,
            requestedBy: row.requestedBy,
        });
        
        setOpenDialog(true);
    };
    const handleEnableEditFields = () => {
        setCanEditFields(true);
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try{
            if (isEditMode && editRow) {
                // PUT request for edit
                const response = await fetch(
                    `${backendBaseApiUrl}booking-request?appid=${appid}&name=${editRow.name}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            endDate: xss(formValues.endDate),
                            status: xss(formValues.status),
                            requestedBy: xss(formValues.requestedBy),
                        }),
                    }
                );
                
                if (!response.ok) {
                    throw new Error(`Failed to update booking request: ${response.status}`);
                }
                // Update in-place
                setBookingData(prev =>
                    prev.map(req =>
                        req.name === editRow.name
                            ? { ...req, ...formValues }
                            : req
                    )
                );
            } else {
                // POST request for create
                const response = await fetch(
                    `${backendBaseApiUrl}booking-request?appid=${appid}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: xss(formValues.name),
                            description: xss(formValues.description),
                            startDate: xss(formValues.startDate),
                            endDate: xss(formValues.endDate),
                            status: xss(formValues.status),
                            requestedBy: xss(formValues.requestedBy),
                        }),
                    }
                );
                if (!response.ok) {
                    throw new Error(`Failed to create booking request: ${response.status}`);
                }
                // Immediately add new item to the top of the list
                setBookingData(prev => [
                    { ...formValues },
                    ...prev,
                ]);
            }
        }
        catch (error) {
            console.error('Submission error:', error);
        }finally {
            handleCloseDialog();
            setIsLoading(false);
            setIsEditMode(false);
            setEditRow(null);
        }
    };


    const isFormValid = () => {
        return (
            formValues.name &&
            formValues.description &&
            formValues.startDate &&
            formValues.endDate &&
            formValues.status &&
            formValues.requestedBy &&
            new Date(formValues.endDate) > new Date(formValues.startDate)
        );
    };
    


    const getFormErrorMessage = () => {
        if (
            !formValues.name ||
            !formValues.description ||
            !formValues.startDate ||
            !formValues.endDate ||
            !formValues.status ||
            !formValues.requestedBy
        ) {
            return 'All fields must be filled.';
        }
        if (
            formValues.startDate &&
            formValues.endDate &&
            new Date(formValues.endDate) <= new Date(formValues.startDate)
        ) {
            return 'End date must be greater than start date.';
        }
        return '';
    };

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <Button
                    onClick={handleOpenDialog}
                    variant="contained"
                    color="primary"
                    style={{
                        backgroundColor: 'rgb(46, 48, 142)',
                        borderRadius: '50%', // Makes the button round
                        width: '34px', // Adjust width for round shape
                        height: '34px', // Adjust height for round shape
                        minWidth: 'unset', // Prevent default Material-UI button width
                    }}
                    startIcon={<AddIcon style={{ marginRight: '-12px' }} />}
                >
                </Button>
            </div>
            <Card>
                <CardContent style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: 'rgb(46, 48, 142)', color: 'white' }}>
                            <tr>
                                {Object.values(columns).map((col) => (
                                    <th
                                        key={col}
                                        style={{
                                            borderBottom: '1px solid #ccc',
                                            padding: '8px',
                                            textAlign: 'left',
                                        }}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={Object.keys(columns).length} style={{ padding: '8px', textAlign: 'center' }}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : bookingData.length === 0 ? (
                                <tr>
                                    <td colSpan={Object.keys(columns).length} style={{ padding: '8px', textAlign: 'center' }}>
                                        No booking requests found.
                                    </td>
                                </tr>
                            ) : (
                                bookingData.map((row, idx) => (
                                    <tr key={idx}>
                                        {Object.keys(columns).map(key => (
                                            key === 'name' ? (
                                                <td key={key} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                                    <a href="#" 
                                                       style={{ color: '#3373b2', textDecoration: 'underline' }} 
                                                       onClick={() => handleEditClick(row)}>
                                                        {row[key]}
                                                    </a>
                                                </td>
                                            ) : key === 'startDate' || key === 'endDate' ? (
                                                <td key={key} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                                    {formatDateToIST(row[key])}
                                                </td>
                                            ) : (
                                                <td key={key} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                                    {row[key]}
                                                </td>
                                            )
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {isEditMode && canEditFields ? 'Edit Booking Request' : 'Booking Request'}
                    {isEditMode && !canEditFields && (
                        <IconButton
                            onClick={handleEnableEditFields}
                            size="small"
                            style={{ marginLeft: 'auto' }}
                        >
                            <EditIcon />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label={columns.name}
                        name="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        fullWidth
                        disabled={isEditMode} 
                    />
                    <TextField
                        margin="dense"
                        label={columns.description}
                        name="description"
                        value={formValues.description}
                        onChange={handleInputChange}
                        fullWidth
                        disabled={isEditMode}
                    />
                  
                    <LocalizationProvider dateAdapter={AdapterDayjs}>

                        <DateTimePicker
                            label={columns.startDate}
                            value={formValues.startDate ? dayjs(formValues.startDate) : null}
                            onChange={(newValue) => {
                                const dateValue = newValue ? newValue.toISOString() : '';
                                setFormValues(prev => ({ ...prev, startDate: dateValue }));
                            }}
                            disabled={isEditMode}
                            renderInput={(params) => (
                                <TextField
                                  {...params}
                                  margin="dense"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                />
                              )}
                        />

                        <DateTimePicker
                            label={columns.endDate}
                            value={formValues.endDate ? dayjs(formValues.endDate) : null}
                            onChange={(newValue) => {
                                const dateValue = newValue ? newValue.toISOString() : '';
                                setFormValues(prev => ({ ...prev, endDate: dateValue }));
                            }}
                            disabled={isEditMode && !canEditFields}
                            renderInput={(params) => (
                                <TextField
                                  {...params}
                                  margin="dense"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                />
                              )}
                        />

                    </LocalizationProvider>

                    <TextField
                        margin="dense"
                        label={columns.requestedBy}
                        name="requestedBy"
                        value={formValues.requestedBy}
                        onChange={handleInputChange}
                        fullWidth
                        disabled={isEditMode}
                    />
                    <Select
                        label={columns.status}
                        name="status"
                        value={formValues.status}
                        onChange={handleInputChange}
                        fullWidth
                        style={{ marginTop: 16, marginBottom: 8 }}
                        disabled={isEditMode && !canEditFields}
                    >
                        {statusOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center', display: 'flex' }}>
                    <Tooltip
                        title={!isFormValid() ? getFormErrorMessage() : ''}
                        placement="top"
                        arrow
                    >
                        <span>
                            <Button
                            onClick={handleSubmit}
                                color="primary"
                                variant="contained"
                                disabled={!isFormValid()}
                            >
               
                                Submit
                            </Button>
                        </span>
                    </Tooltip>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default BookingRequests;