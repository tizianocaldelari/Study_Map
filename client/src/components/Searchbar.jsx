import React, { useState, useEffect } from 'react';
import './Searchbar.css';
import SearchIcon from '@mui/icons-material/Search';

const Searchbar = ({ onSearch }) => {
    const [inputValue, setInputValue] = useState('');
    const [departments, setDepartments] = useState([]);
    const [filteredDepartments, setFilteredDepartments] = useState([]);
    const [geojson, setGeojson] = useState({ type: "FeatureCollection", features: [] });

    useEffect(() => {
        // Fetch GeoJSON data
        fetch('/Study_Map.geojson')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setGeojson(data);
                const uniqueDepartments = Array.from(
                    new Set(data.features
                        .flatMap(feature => feature.properties.Departments.split(', '))
                        .filter(dept => dept) // Filter out undefined values
                    )
                );
                setDepartments(uniqueDepartments);
                console.log(`Loaded GeoJSON data with ${data.features.length} features.`);
            })
            .catch(error => console.error('Error loading GeoJSON data:', error));
    }, []);

    const handleInputChange = (event) => {
        const value = event.target.value;
        setInputValue(value);
        const filtered = departments.filter(dept => dept && dept.toLowerCase().includes(value.toLowerCase())); // Add a check for undefined
        setFilteredDepartments(filtered);
        console.log(`Filtered departments: ${filtered.length} found.`);
    };

    const handleSearch = (depts) => {
        if (depts.length > 0) {
            onSearch(depts, geojson);
            setFilteredDepartments([]);  // Clear the filtered departments list after a search
            setInputValue('');  // Optionally clear the input field after a search
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && filteredDepartments.length > 0) {
            handleSearch(filteredDepartments);
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
                        <li key={index} onClick={() => handleSearch([dept])}>
                            {dept}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Searchbar;
