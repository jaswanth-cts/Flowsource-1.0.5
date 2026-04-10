import React, { useRef, useState, useEffect } from 'react';
import {
    Button,
    Drawer,
    TextField,
    Paper,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Alert,
} from '@mui/material';
import { useApi, configApiRef, fetchApiRef, identityApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Tooltip from '@mui/material/Tooltip';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider/index.js';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs/index.js';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker/index.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import cssClasses from './EnvironmentReservationCss.js';
import startIcon from '../../assets/start.png';
import completeIcon from '../../assets/complete.png';
import startDisabledIcon from '../../assets/start_disabled.png';
import completeDisabledIcon from '../../assets/complete_disabled.png';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

function EnvironmentReservation() {
//console.log("STARTING-------------bookingData", bookingData);
    const { fetch } = useApi(fetchApiRef);
    const entity = useEntity();
    const appid = entity.entity.metadata.appid;
    const config = useApi(configApiRef);
    const classes = cssClasses();
    const backendBaseApiUrl =
        config.getString('backend.baseUrl') + '/api/flowsource-environment-reservation/';

    const [maintenanceRequests, setMaintenanceRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [canEditFields, setCanEditFields] = useState(false);
    const [popupMessage, setPopupMessage] = useState('');
    const [showPopup, setShowPopup] = useState(false);
    const [bookingData, setBookingData] = useState(null);
    const environmentOptions = ['Dev', 'QA', 'Prod'];
    const statusOptions = ['Yet to Start', 'In Progress', 'Completed'];
    const identity = useApi(identityApiRef);
    const profile = identity.getProfile(); // { displayName?, email?, picture? }
    const loggedInEmail = profile?.email || '';
    const loggedInUserId = identity.getUserId(); // fallback if no email
    const defaultRequestor = loggedInEmail || loggedInUserId || 'unknown';
    const initialStartDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
    const initialEndDate = new Date(initialStartDate.getTime() + 60 * 60 * 1000); // 1 hour after initialStartDate
    const initialFormValues = {
        appid: appid || '',
        name: '',
        description: '',
        startDate: initialStartDate.toISOString(),
        endDate: initialEndDate.toISOString(),
        status: statusOptions[0],
        environment: environmentOptions[0],
        requestor: defaultRequestor,
    };
    const [formValues, setFormValues] = useState(initialFormValues);

    const columns = {
        name: 'Maintenance Name',
        description: 'Description',
        startDate: 'Start Date',
        endDate: 'End Date',
        status: 'Status',
        environment: 'Environment',
        /*teamDL: 'TeamDL',*/
        requestor: 'Requestor',
    };

    // Function to format date in IST timezone
    const formatDateToIST = (dateString) => {
        if (!dateString) return '';
        return dayjs(dateString).tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm');
    };

    const checkBookingConflicts = (startDate, endDate, requestor, bookingData, currentBookingName = null) => {
        if (!startDate || !endDate || !requestor || !bookingData) {
            return false;
        }

        const newStart = dayjs(startDate);
        const newEnd = dayjs(endDate);
        const currentRequestor = requestor?.toLowerCase()?.trim();

        return bookingData?.some(booking => {
            // if (currentBookingName && booking.name === currentBookingName) {
            //     console.log('currentBookingName matches one', currentBookingName);
            //     return false;
            // }

            const bookingStart = dayjs(booking.startDate);
            const bookingEnd = dayjs(booking.endDate);
            const bookingRequestor = (booking.requestor || booking.requestedBy)?.toLowerCase()?.trim();

            // Check for overlap using proper datetime comparison
            const overlap = newStart.isBefore(bookingEnd) && newEnd.isAfter(bookingStart);
            const isDifferentRequestor = currentRequestor !== bookingRequestor;
console.log("bookingStart", bookingStart, "bookingEnd", bookingEnd,
    "newStart", newStart, "newEnd", newEnd,
    "currentRequestor", currentRequestor, "bookingRequestor", bookingRequestor,
    "overlap", overlap, "isDifferentRequestor", isDifferentRequestor);
            return overlap && isDifferentRequestor;
        });
    };

    const fetchMaintenanceRequests = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${backendBaseApiUrl}maintenance-requests?appid=${appid}`,
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Ensure data is always an array
            const requestsArray = Array.isArray(data) ? data : data ? [data] : [];
            setMaintenanceRequests(requestsArray);
        } catch (error) {
            console.error('Error fetching maintenance requests:', error);
            setMaintenanceRequests([]);
        } finally {
            setIsLoading(false);
        }
    };
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

    
    useEffect(() => {
        fetchBookingRequests();
        fetchMaintenanceRequests();
    }, [appid]);

    const handleOpenDialog = () => {
        setIsEditMode(false);
        setFormValues(initialFormValues);
        setOpenDialog(true);
    };
    const handleCloseDialog = () => {
        setOpenDialog(false);
        setFormValues(initialFormValues);
    };
    const handleInputChange = e => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };
    const handleEditClick = (row) => {
        setIsEditMode(true);
        setCanEditFields(false);
        setEditRow(row);
        setFormValues({
            name: row.name,
            description: row.description,
            startDate: row.startDate,
            endDate: row.endDate,
            status: row.status,
            environment: row.environment,
            /*teamDL: row.teamDL,*/
            requestor: row.requestor,
        });
        setOpenDialog(true);
    };
    const handleEnableEditFields = () => {
        setCanEditFields(true);
    };
    const handleSubmit = async () => {
        // First check for booking conflicts
        const hasConflict = checkBookingConflicts(
            formValues.startDate,
            formValues.endDate,
            formValues.requestor,
            bookingData,
            maintenanceRequests,
            // isEditMode ? formValues.name : null
        );

        if (hasConflict) {
            setPopupMessage('This time slot is already booked by another requestor. Please choose a different time.');
            setShowPopup(true);
            return;
        }

        if (new Date(formValues.endDate) <= new Date(formValues.startDate)) {
            setPopupMessage('End date must be greater than start date.');
            setShowPopup(true);
            return;
        }


        setIsLoading(true);

        try {
            if (isEditMode && editRow) {
                // PUT request for edit
                const response = await fetch(
                    `${backendBaseApiUrl}maintenance-request?appid=${appid}&name=${editRow.name}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            endDate: formValues.endDate,
                            status: formValues.status,
                            environment: formValues.environment,
                            /*teamDL: formValues.teamDL,*/
                            requestor: formValues.requestor,
                        }),
                    }
                );
                if (!response.ok) {
                    throw new Error(`Failed to update maintenance request: ${response.status}`);
                }
                // Update in-place
                setMaintenanceRequests(prev =>
                    prev.map(req =>
                        req.name === editRow.name
                            ? { ...req, ...formValues }
                            : req
                    )
                );
            } else {
                // POST request for create
                const response = await fetch(
                    `${backendBaseApiUrl}maintenance-request?appid=${formValues.appid}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: formValues.name,
                            description: formValues.description,
                            startDate: formValues.startDate,
                            endDate: formValues.endDate,
                            status: formValues.status,
                            environment: formValues.environment,
                           /* teamDL: formValues.teamDL,*/
                            requestor: formValues.requestor,
                        }),
                    }
                );
                if (!response.ok) {
                    throw new Error(`Failed to create maintenance request: ${response.status}`);
                }
                // Immediately add new item to the top of the list
                setMaintenanceRequests(prev => [
                    { ...formValues },
                    ...prev,
                ]);
            }
        } catch (error) {
            console.error('Error submitting maintenance request:', error);
        } finally {
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
            formValues.environment &&
            /*formValues.teamDL &&*/
            formValues.requestor &&
            new Date(formValues.endDate) >= new Date(formValues.startDate)
        );
    };

    const getFormErrorMessage = () => {
        if (!formValues.name || !formValues.description || !formValues.startDate || !formValues.endDate || !formValues.status || !formValues.environment /*!formValues.teamDL*/ || !formValues.requestor) {
            return 'All fields must be filled.';
        }
        if (formValues.startDate && formValues.endDate && new Date(formValues.endDate) <= new Date(formValues.startDate)) {
            return 'End date must be greater than start date.';
        }
        return '';
    };

    const handleStatusChange = async (rowIdx, newStatus) => {
        const row = maintenanceRequests[rowIdx];
        setIsLoading(true);
        try {
            const response = await fetch(
                `${backendBaseApiUrl}maintenance-request?appid=${row.appid}&name=${row.name}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...row,
                        status: newStatus,
                    }),
                }
            );
            if (!response.ok) {
                throw new Error(`Failed to update maintenance request: ${response.status}`);
            }
            setMaintenanceRequests(prev =>
                prev.map((req, idx) =>
                    idx === rowIdx ? { ...req, status: newStatus } : req
                )
            );
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsLoading(false);
        }
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
                    {isLoading ? (
                        <Typography variant="body1">Loading...</Typography>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: 'rgb(46, 48, 142)', color: 'white' }}>
                                <tr>
                                    {Object.entries(columns)
                                        .filter(([key]) => key !== 'environment')
                                        .map(([key, label]) => (
                                        <th
                                            key={label}
                                            style={{
                                                borderBottom: '1px solid #ccc',
                                                padding: '8px',
                                                textAlign: 'left',
                                            }}
                                        >
                                            {label}
                                        </th>
                                    ))}
                                    <th
                                        key='status'
                                        style={{
                                            borderBottom: '1px solid #ccc',
                                            padding: '8px',
                                            textAlign: 'left',
                                        }}
                                    >
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {maintenanceRequests.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={Object.keys(columns).length + 1}
                                            style={{ padding: '8px', textAlign: 'center' }}
                                        >
                                            No maintenance requests found.
                                        </td>
                                    </tr>
                                ) : (
                                    maintenanceRequests.map((row, idx) => (
                                        <tr key={idx}>
                                            {Object.keys(columns)
                                                .filter((key) => key !== 'environment' )
                                                .map(key => (
                                                key === 'name' ? (
                                                    <td key={key} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                                        <a href="#" style={{ color: '#3373b2', textDecoration: 'underline' }} onClick={() => handleEditClick(row)}>
                                                            {row[key]}
                                                        </a>
                                                    </td>
                                                ) : key === 'startDate' || key === 'endDate' ? (
                                                    <td key={key} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                                        {formatDateToIST(row[key])}
                                                    </td>
                                                ) : (
                                                    <td key={key} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{row[key]}</td>
                                                )
                                            ))}
                                            <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                                    <Button 
                                                        size="small" 
                                                        variant="outlined" 
                                                        onClick={() => handleStatusChange(idx, 'In Progress')}
                                                        disabled={row.status === 'In Progress' || row.status === 'Completed'}
                                                        sx={{
                                                            minWidth: 'auto',
                                                            padding: '6px',
                                                            backgroundColor: '#499c3e',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            border: '2px solid #8fcb70',
                                                            // 3D effect using box-shadow
                                                            boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                                                            borderRadius: '8px',
                                                            transform: 'translateY(0px)',
                                                            transition: 'all 0.2s ease-in-out',
                                                            // Hover effects
                                                            '&:hover': {
                                                                border: '1px solid #5bb34c',
                                                                backgroundColor: '#5bb34c', // Lighter green on hover
                                                                boxShadow: '0 5px 9px rgba(0,0,0,0.4), 0 3px 5px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                                                                transform: 'translateY(-0.5px)',
                                                            },
                                                            // Active/pressed effect
                                                            '&:active': {
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)',
                                                                transform: 'translateY(0.5px)',
                                                            },
                                                            '&.Mui-disabled': {
                                                                cursor: 'not-allowed',
                                                                pointerEvents: 'auto',
                                                                backgroundColor: '#888',
                                                                color: '#ccc',
                                                                fontWeight: 600,
                                                                border: '3px solid #aaa',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                                transform: 'translateY(0px)',
                                                            },
                                                            // Prevent hover effects on disabled buttons
                                                            '&.Mui-disabled:hover': {
                                                                backgroundColor: '#888',
                                                                color: '#ccc',
                                                                border: '3px solid #aaa',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                                transform: 'translateY(0px)',
                                                            },
                                                        }}
                                                    >
                                                        Start
                                                    </Button>
                                                    <Button 
                                                        size="small" 
                                                        variant="outlined" 
                                                        onClick={() => handleStatusChange(idx, 'Completed')} 
                                                        disabled={row.status === 'Yet to Start' || row.status === 'Completed'}
                                                        sx={{
                                                            marginLeft: 0.5,
                                                            minWidth: 'auto',
                                                            padding: '6px',
                                                            backgroundColor: '#499c3e',
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            border: '2px solid #8fcb70',
                                                            // 3D effect using box-shadow
                                                            boxShadow: '0 4px 8px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                                                            borderRadius: '8px',
                                                            transform: 'translateY(0px)',
                                                            transition: 'all 0.2s ease-in-out',
                                                            // Hover effects
                                                            '&:hover': {
                                                                border: '1px solid #5bb34c',
                                                                backgroundColor: '#5bb34c', // Lighter green on hover
                                                                boxShadow: '0 5px 9px rgba(0,0,0,0.4), 0 3px 5px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.4)',
                                                                transform: 'translateY(-0.5px)',
                                                            },
                                                            // Active/pressed effect
                                                            '&:active': {
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 2px 4px rgba(0,0,0,0.2)',
                                                                transform: 'translateY(0.5px)',
                                                            },
                                                            '&.Mui-disabled': {
                                                                cursor: 'not-allowed',
                                                                pointerEvents: 'auto',
                                                                backgroundColor: '#888',
                                                                color: '#ccc',
                                                                fontWeight: 600,
                                                                border: '3px solid #aaa',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                                transform: 'translateY(0px)',
                                                            },
                                                            // Prevent hover effects on disabled buttons
                                                            '&.Mui-disabled:hover': {
                                                                backgroundColor: '#888',
                                                                color: '#ccc',
                                                                border: '3px solid #aaa',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                                                transform: 'translateY(0px)',
                                                            },
                                                        }}
                                                    >
                                                        Complete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isEditMode && canEditFields ? 'Edit Maintenance Request' : 'Maintenance Request'}
                    {isEditMode && !canEditFields && (
                        <IconButton onClick={handleEnableEditFields} size="small" style={{ marginLeft: 'auto' }}>
                            <EditIcon />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent>
                    {/* Name */}
                    <TextField
                        margin="dense"
                        label={columns.name}
                        name="name"
                        value={formValues.name}
                        onChange={handleInputChange}
                        fullWidth
                        disabled={isEditMode}
                    />
                    {/* Description */}
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

                        {/* Start Date */}
                        <DateTimePicker
                            label={columns.startDate}
                            value={formValues.startDate ? dayjs(formValues.startDate) : null}
                            onChange={(newValue) =>
                                handleInputChange({
                                    target: {
                                        name: 'startDate',
                                        value: newValue ? newValue.toISOString() : '',
                                    },
                                })
                            }

                            disabled={isEditMode}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin="dense"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    name="startDate"
                                />
                            )}
                        />

                        {/* End Date */}
                        <DateTimePicker
                            label={columns.endDate}
                            value={formValues.endDate ? dayjs(formValues.endDate) : null}
                            onChange={(newValue) =>
                                handleInputChange({
                                    target: {
                                        name: 'endDate',
                                        value: newValue ? newValue.toISOString() : '',
                                    },
                                })
                            }

                            disabled={isEditMode && !canEditFields}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    margin="dense"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    name="endDate"
                                />
                            )}
                        />

                    </LocalizationProvider>

                    {/* Environment */}
                    <Select
                        label={columns.environment}
                        name="environment"
                        value={formValues.environment}
                        onChange={handleInputChange}
                        fullWidth
                        style={{ marginTop: 16, marginBottom: 8 }}
                        disabled={isEditMode}
                    >
                        {environmentOptions.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                    {/* TeamDL 
                    <TextField
                        margin="dense"
                        label={columns.teamDL}
                        name="teamDL"
                        value={formValues.teamDL}
                        fullWidth
                        disabled
                    /> */}
                    {/* Requestor */}
                    <TextField
                        margin="dense"
                        label={columns.requestor}
                        name="requestor"
                        value={formValues.requestor}
                        onChange={handleInputChange}
                        fullWidth
                        disabled={isEditMode}
                    />
                    {/* Status */}
                    <Select
                        label={columns.status}
                        name="status"
                        value={formValues.status}
                        onChange={handleInputChange}
                        fullWidth
                        style={{ marginTop: 16, marginBottom: 8 }}
                        disabled={isEditMode && !canEditFields}
                    >
                        {statusOptions.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center', display: 'flex' }}>
                    <Tooltip title={!isFormValid() ? getFormErrorMessage() : ''} placement="top" arrow>
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

            {/* Popup Dialog for Validation Errors */}
            <Dialog
                open={showPopup}
                onClose={() => setShowPopup(false)}
                PaperProps={{ className: classes.popUpErrorBox }} 
           >
                <DialogTitle className={classes.popUpErrorBoxCard}>
                    Failed!
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>{popupMessage}</DialogContentText>
                </DialogContent>
                <DialogActions className={classes.popUpErrorBoxButton}>
                    <Button onClick={() => setShowPopup(false)} color="primary">
                        OK
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default EnvironmentReservation;
