import React, { useState, useEffect } from 'react';
import './Searchbar.css';
import SearchIcon from '@mui/icons-material/Search';
import geojsonData from './Study_Map.geojson'; 

const Searchbar = ({ onSearch }) => {
    const [inputValue, setInputValue] = useState('');
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [geojson, setGeojson] = useState({ type: "FeatureCollection", features: [] });

    useEffect(() => {
        // Fetch GeoJSON data
        fetch('./Study_Map.geojson')
            .then(response => response.json())
            .then(data => {
                setGeojson(data);
                const uniqueDepartments = Array.from(
                    new Set(data.features.map(feature => feature.properties.department))
                );
                setDepartments(uniqueDepartments);
            })
            .catch(error => console.error('Error loading GeoJSON data:', error));
    }, []);

    const handleInputChange = (event) => {
        const value = event.target.value;
        setInputValue(value);
        setFilteredDepartments(
            departments.filter(dept => dept.toLowerCase().includes(value.toLowerCase()))
        );
    };


    const handleSearch = (stop) => {
        if (stop) {
            onSearch(stop);
            setFilteredDepartments([]);  // Clear the filtered stops list after a search
            setInputValue('');  // Optionally clear the input field after a search

        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && filteredDepartments.length > 0) {
            handleSearch(filteredDepartments[0]);
        }
    };

    return (
        <div className="searchbar-container">
            <input
                type="text"
                id="search-input"
                placeholder="Enter department"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
            />
            <SearchIcon className="search-icon" />
            {filteredDepartments.length > 0 && (
                <ul className="autocomplete-dropdown">
                    {filteredDepartments.map((dept, index) => (
                        <li key={index} onClick={() => handleSearch(dept)}>
                            {dept}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Searchbar;