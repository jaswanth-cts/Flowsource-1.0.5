import React, { useRef, useState, useEffect } from 'react';
import { Button, Drawer, TextField,Paper, Typography ,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Alert,
  } from '@mui/material';
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from '@material-ui/icons/Close';
import cssClasses from './ChatBotCss';
import { Grid } from '@material-ui/core';
import botimage from './bot.svg';
import { useApi, configApiRef, fetchApiRef } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';

import log from 'loglevel';


const CHATBOT_STATUSES = {
    UPLOADING: 'uploading',
    FAILED: 'failed',
    UPLOADED: 'successfully uploaded',
    SUCCESS: 'success',
    INITIATED: 'initiated',
};

const statusToStatusMessagesMap = {
    [CHATBOT_STATUSES.INITIATED]: 'The chatbot is currently being initiated. Please try again later.',
    [CHATBOT_STATUSES.UPLOADING]: 'Your document is currently being uploaded. Please try again later.',
    [CHATBOT_STATUSES.FAILED]: 'An error occurred while processing the docs. Please try again later.',
    [CHATBOT_STATUSES.UPLOADED]: 'The docs has been uploaded successfully and is currently being processed. Please try again later.',
    [CHATBOT_STATUSES.SUCCESS]: 'The docs has been processed successfully. How may I help you today?',
};

const chatbotStatusCheckRefreshInterval = 1 * 60 * 1000; // 1 minute
const Spacer = () => <div className="mb-4" />; // Spacer component

function ChatBot() {
    const { fetch } = useApi(fetchApiRef);
    const classes = cssClasses();
    const entity = useEntity();
    const appid = entity.entity.metadata.appid;
    const annotations = entity.entity.metadata.annotations;

    const config = useApi(configApiRef);
    const backendUrl = config.getString('backend.baseUrl');

    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const scrollRef = useRef();
    const [messages, setMessages] = useState([
        { text: 'Hello, I am your Virtual Agent.', isUser: false },
    ]);
    let currentQuestion = '';

    
    useEffect(() => {
        scrollRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [messages]);
        
    // Use an effect to fetch the chatbot status and update the messages
    const chatbotStatusRef = useRef(); // A ref is used to store the chatbot status. This allows you to access the latest chatbot status inside the setInterval callback, even though it's defined inside the useEffect hook.
    useEffect(() => {
        // Get the chatbot status and update the messages when the component mounts
        getChatbotStatusAndUpdateIfNecessary();

        let intervalId;
        const timeoutId = setTimeout(() => { // Start the interval after a delay
            // Check if the chatbot status is not "success" before starting the interval
            if (chatbotStatusRef.current !==  CHATBOT_STATUSES.SUCCESS) {
                intervalId = setInterval(() => { // Set an interval to check the chatbot status every 5 minutes
                    if (chatbotStatusRef.current ===  CHATBOT_STATUSES.SUCCESS) {
                        clearInterval(intervalId); // Clear the interval if the status becomes "success" at any point
                        return;
                    }
                    // Get the chatbot status and update the messages
                    getChatbotStatusAndUpdateIfNecessary();
                }, chatbotStatusCheckRefreshInterval);
            }
        }, chatbotStatusCheckRefreshInterval);

        // Return a cleanup function to clear the interval when the component unmounts
        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
    };
    const handleEnterKey = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    }

    const handleSendMessage = () => {
        if (message === '' || message === undefined || message === null) {
            return;
        }

        const newMessages = [...messages, { text: message, isUser: true }];
        setMessages(newMessages);
        // Clear the textarea after sending
        setMessage('');

        currentQuestion = message;
        fetchAndUpdateRequestAnswer();
    };

    const close = () => {
        setIsOpen(false);
    };

    const handleToggleDrawer = () => {
        setIsOpen(!isOpen);
    };

    function getChatBotBackendUrl(backendUrl) {
        let chatBotPluginEndpoint;
        if (!backendUrl.endsWith('/'))
            chatBotPluginEndpoint = '/';
        chatBotPluginEndpoint += 'api/chatbot';
        return backendUrl + chatBotPluginEndpoint;
    }
    
    function getRequestAnswerEndpointUrl(backendUrl) {
        let requestAnswerApi = '/requestAnswer';
        return getChatBotBackendUrl(backendUrl) + requestAnswerApi;
    }
    
    function getCheckStatusAndUpdateEndpointUrl(backendUrl) {
        let checkStatusAndUpdateApi = `/apps/${appid}/docs-status`;
        return getChatBotBackendUrl(backendUrl) + checkStatusAndUpdateApi;
    }

    function getRequestConfigurationForQuestion(bodyData) {
        return {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData)
        };
    }

    const fetchAndUpdateRequestAnswer = async () => {
        try {
            const body = { question: currentQuestion, appid: appid };
            const config = getRequestConfigurationForQuestion(body);
            const response = await fetch(getRequestAnswerEndpointUrl(backendUrl), config);
            if (response.ok) {
                const answer = await response.text();
                log.info('answer - ', answer);
              
                // Update the state with API messages
                setMessages((prevMessages) => [...prevMessages, { text: answer,isUser: false }]);

               log.info('Request Answer -> ', answer);
            } else if (response.status === 503) {
                setChatbotEnabled(true);
                setError(`This plugin has not been configured with the required values. Please ask your administrator to configure it`)
            } else {
                setError(`Error fetching data:', ${response.statusText}`)
                log.error('Error fetching data:', response.statusText);
            }
        } catch (error) {
            log.error('Error:', error);
        }
    };
    const backendBaseApiUrl = config.getString('backend.baseUrl') + '/api/chatbot/';
    const [chatbotEnabled, setChatbotEnabled] = useState(null);

    const fetchChatbotEnabled = async () => {
        try {
            const response = await fetch(backendBaseApiUrl + 'chatbotEnabled');
            if (response.ok) {
                const data = await response.json();
                setChatbotEnabled(data.chatbotEnabled);
            } else if(response.status === 503) {
                    setChatbotEnabled(true);
                    setError(`This plugin has not been configured with the required values. Please ask your administrator to configure it`)
            } else setError('Network response was not ok');          
        } catch (error) {
            log.error('There has been a problem with your fetch operation:', error);
            setChatbotEnabled(false);
        }
    };

    useEffect(() => {
        fetchChatbotEnabled();
    }, []);



    const shouldRenderChatBot = !!annotations && 'flowsource/chatbot-project-id' in annotations;

    const getChatbotStatusAndUpdateIfNecessary = async () => {
        try {
            const response = await fetch(getCheckStatusAndUpdateEndpointUrl(backendUrl), { method: 'GET' });
            if (response.ok) {
                const newStatus = await response.text();
                log.info(`Status for appid ${appid} -> ${newStatus}`);

                // Update the messages only if the status has changed
                if (chatbotStatusRef.current !== newStatus) {
                    chatbotStatusRef.current = newStatus; // Update the ref with the latest status

                    const messageText = statusToStatusMessagesMap[newStatus];
                    if (messageText) { // Update messages if the status from the API has a corresponding message
                        setMessages((prevMessages) => [...prevMessages, { text: messageText, isUser: false }]);
                    }
                }
            } else {
                log.error('Error fetching data:', response.statusText);
            }
        } catch (error) {
            log.error('Error:', error);
        }
    };


    return (

        <div>
             {shouldRenderChatBot && chatbotEnabled && (
              <>
            <Button onClick={handleToggleDrawer} >  <img src={botimage}></img></Button>
            <Drawer
                PaperProps={{ sx: { width: '28rem', height: '35rem', marginTop: '2rem', marginRight: '3rem',position: 'relative', bottom: '20px', left: '55%'
                 } }}
                anchor="bottom"
                open={isOpen}
                onClose={() => setIsOpen(false)}
            >

                <div className={`${classes.chatBox}`}>
                    <div style={{ height: '5rem', backgroundColor: '#000039' }} className={`${classes.messagesArea}`}>
                        <img src={botimage}></img>
                        <span style={{ fontSize: '2rem', color: 'white' }}>Virtual Agent</span>
                        <Button color="info" onClick={close} className={`${classes.closeButton}`}>
                            <CloseIcon />
                        </Button>
                    </div>
                    <div className={`${classes.middlesection}`}>
                        { error && ( // Show error if exists and no workflow data
                        <div>
                        <Card>
                            <CardHeader title={<Typography variant="h6">Error</Typography>} />
                            <Divider />
                            <CardContent>
                            <Paper role="alert" elevation={0}>
                                <Alert severity="error">{error}</Alert>
                            </Paper>
                            </CardContent>
                        </Card>
                        <Spacer />
                        </div>
                        )}
                        { !error && <div className={`${classes.messageContent}`}>
                              {messages.map((msg, index) => (
                                <div
                                    key={msg.id}
                                    className={msg.isUser ? classes.apiMessageContainer :  classes.userMessageContainer }
                                >
                                    
                                    <Paper
                                        elevation={3}
                                        variant="outlined"
                                        className={msg.isUser ? classes.apiMessage : classes.userMessage }
                                    >

                                        <Typography variant="body1" whiteSpace="pre-wrap">{msg.text}</Typography>
                                    </Paper>
                                </div>
                            ))}
                           <div ref={scrollRef}/>
                        </div>}
                    </div>

                    {!error && <Grid item className={`${classes.textareaContainer}`}>
                            <TextField
                                label="Type your message"
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={1}
                                value={message}
                                onChange={handleMessageChange}
                                onKeyDown={handleEnterKey}
                                className={classes.textField}
                            />
                            <Button color="primary" onClick={handleSendMessage}>
                                <SendIcon />
                            </Button>
                        </Grid>
                    }
                    
                </div >

            </Drawer>
            </>
            )}
        </div>
    );
}

export default ChatBot;