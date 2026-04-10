import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import morpheusLogo from './icons/morpheus-logo.png';
const ServerLink = ({onClick}) => {
    return (
        <>
            <a href="#" onClick={onClick} style={{paddingLeft: "0.9rem"} }>
                <IconButton style={{borderRadius: 0,height: "34px",width: "138px"}  }>
                    <img src={morpheusLogo} alt="Goto Morpheus Server" />
                </IconButton>
            </a>
        </>);
}

export default ServerLink;
