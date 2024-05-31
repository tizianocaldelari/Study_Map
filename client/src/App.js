import React, { useState } from 'react';
import MapComponent from './components/MapWrapper.jsx';
import { Helmet } from 'react-helmet';
import Header from './components/Header';

const App = () => {
  const [filteredData, setFilteredData] = useState([]);

  const handleSearch = (results) => {
    setFilteredData(results);
  };

  return (
    <div>
      <Helmet>
      <title>Study Map</title>
      </Helmet>
      <Header />
      <MapComponent data={filteredData} />
    </div>
  );
};

export default App;
