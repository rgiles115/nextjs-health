import React, { useState } from 'react';
import './SideMenu.css'; // Import the CSS for styling the side menu

// Function to construct the Strava authentication URL
const getStravaAuthURL = (): string => {
    const root = 'http://www.strava.com/oauth/authorize';
    const clientId = process.env.STRAVA_CLIENT_ID as string; // Get client ID from environment variables
    const redirectUri = process.env.STRAVA_REDIRECT_URI ? encodeURIComponent(process.env.STRAVA_REDIRECT_URI) : '';
    const responseType = 'code';
    const approvalPrompt = 'auto';
    const scope = 'read,activity:read';
    // Construct and return the full URL
    return `${root}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&approval_prompt=${approvalPrompt}&scope=${scope}`;
};

// Function to construct the Oura authentication URL
const getOuraAuthURL = (): string => {
    const root = 'https://cloud.ouraring.com/oauth/authorize';
    const clientId = process.env.OURA_CLIENT_ID as string; // Get client ID from environment variables
    const redirectUri = process.env.OURA_REDIRECT_URI ? encodeURIComponent(process.env.OURA_REDIRECT_URI) : '';
    const responseType = 'code';
    const approvalPrompt = 'auto';
    const scope = 'read,activity:read';
    // Construct and return the full URL
    return `${root}?client_id=${clientId}&response_type=${responseType}&redirect_uri=${redirectUri}`;
};

// SideMenu component
const SideMenu: React.FC = () => {
    // State to manage if the menu is open or closed
    const [isOpen, setIsOpen] = useState(false);

    // Function to toggle the menu's open/closed state
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    // Construct the authentication URLs
    const stravaAuthURL = getStravaAuthURL();
    const ouraAuthURL = getOuraAuthURL();

    return (
        <>
            {/* Button to toggle the menu */}
            <button onClick={toggleMenu} className="menu-toggle-button">
                ☰
            </button>
            {/* Side menu container */}
            <div className={`side-menu ${isOpen ? 'open' : ''}`}>
                {/* Title for the menu */}
                <div className="menu-title">Connect</div>
                {/* List of menu items */}
                <ul>
                    {/* Strava authentication link */}
                    <li>
                        <a href={stravaAuthURL} className="auth-button" id="authStravaButton"></a>
                    </li>
                    {/* Oura authentication link */}
                    <li>
                        <a href={ouraAuthURL} className="auth-button" id="authOuraButton">
                            Authenticate with Oura
                        </a>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default SideMenu;