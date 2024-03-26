import './App.css';
import React from 'react'
import { useState } from 'react'
import MapWrapper from './components/MapWrapper.jsx'
import FeatureTable from './components/FeatureTable.jsx'

function App() {
  const [features, setFeatures] = useState([]);
  const [selectedFeatureID, setSelectedFeatureID] = useState();
  return (
    <>
      <h1>
        <a href="https://openlayers.org/">
          <img src='./OpenLayers_logo.svg' className="logo" alt="OpenLayers logo" />
        </a>OpenLayers
        &
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src='./react.svg' className="logo" alt="React logo" />
        </a>React
      </h1>
      <div id='content'>
        <MapWrapper features={features} setFeatures={setFeatures} selectedFeatureID={selectedFeatureID} setSelectedFeatureID={setSelectedFeatureID} />
        <FeatureTable features={features} setFeatures={setFeatures} selectedFeatureID={selectedFeatureID} setSelectedFeatureID={setSelectedFeatureID} />
      </div>
    </>
  )
}
export default App