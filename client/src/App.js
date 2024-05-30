import './App.css';
import React, { useState, useRef } from 'react';
import MapWrapper from './components/MapWrapper.jsx';

function App() {
  const [features, setFeatures] = useState([]);
  const [bbox, setBbox] = useState('838667,5997631,909982,6036843'); // Default bounding box
  const [zoom, setZoom] = useState(12); // Default zoom level
  const mapRef = useRef(); // Ref to access map instance

  return (
    <div className="App">
      <MapWrapper ref={mapRef} features={features} />
    </div>
  );
}

export default App;
