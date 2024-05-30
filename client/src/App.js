import React, { useState } from 'react';
import Searchbar from './components/Searchbar';
import MapComponent from './components/MapWrapper.jsx';

const App = () => {
  const [filteredData, setFilteredData] = useState([]);

  const handleSearch = (results) => {
    setFilteredData(results);
  };

  return (
    <div>
      <Searchbar onSearch={handleSearch} />
      <MapComponent data={filteredData} />
    </div>
  );
};

export default App;
