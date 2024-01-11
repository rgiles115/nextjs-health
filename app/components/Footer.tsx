'use client'

import React from 'react';

const Footer = () => {
  return (
    <div className="footer">
      <img src="/api_logo_pwrdBy_strava_horiz_light.svg" className="footerImage" />
      <span id="footerVersion">Version: {process.env.APP_VERSION}</span>
    </div>
  );
};

export default Footer;
