import React from 'react';
import studyMapLogo from './STUDYMAP.png'; // adjust the path as necessary

const Header = () => {
  return (
    <header className="header-container">
      <div className="header-content">
        <img src={studyMapLogo} alt="Study Map Logo" className="header-logo" />
        <h1 className="header-title">StudyMap</h1>
      </div>
    </header>
  );
};

export default Header;
