import React, { useState, useEffect } from 'react';
import './Searchbar.css';
import SearchIcon from '@mui/icons-material/Search';

const Searchbar = ({ onSearch }) => {
    const [inputValue, setInputValue] = useState('');
    const [stops, setStops] = useState([]);
    const [filteredStops, setFilteredStops] = useState([]);

    useEffect(() => {
        // Fetch or set stops data
        setStops([
            { name: 'Stop 1', lon: 8.5417, lat: 47.3769 },
            { name: 'Stop 2', lon: 8.5480, lat: 47.3776 },
            // Add more stops as needed
        ]);
    }, []);

    const handleInputChange = (event) => {
        const value = event.target.value;
        setInputValue(value);
        setFilteredStops(
            stops.filter(stop => stop.name.toLowerCase().includes(value.toLowerCase()))
        );
    };

    const handleSearch = (stop) => {
        if (stop) {
            onSearch(stop);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && filteredStops.length > 0) {
            handleSearch(filteredStops[0]);
        }
    };

    return (
        <div className="searchbar-container">
            <input
                type="text"
                id="search-input"
                placeholder="Suchbegriff eingeben"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoComplete="off" // Disable browser autocomplete
            />
            <SearchIcon className="search-icon" />
            {filteredStops.length > 0 && (
                <ul className="autocomplete-dropdown">
                    {filteredStops.map((stop, index) => (
                        <li key={index} onClick={() => handleSearch(stop)}>
                            {stop.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Searchbar;
