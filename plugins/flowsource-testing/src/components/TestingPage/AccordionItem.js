import React, { useState } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Typography from '@mui/material/Typography';
import cssClasses from './TestingPageCss';

const AccordionItem = ({ title, ComponentToRender, isAccordionInitiallyExpanded }) => {

    const classes = cssClasses();
    const [isAccordionExpanded, setIsAccordionExpanded] = useState(isAccordionInitiallyExpanded);

    const handleAccordionChange = (event, isExpanded) => {
        setIsAccordionExpanded(isExpanded);
    };

    return (
        <Accordion expanded={isAccordionExpanded} onChange={handleAccordionChange}>
            <AccordionSummary className="bg-info"
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel-content" id="panel-header"
            >
                <Typography>
                    <b>{title}</b>
                </Typography>
            </AccordionSummary>
            <AccordionDetails className={`${classes.accordianDisplay}`}>
                {isAccordionExpanded && <ComponentToRender />}
            </AccordionDetails>
        </Accordion>
    );
};

export default AccordionItem;