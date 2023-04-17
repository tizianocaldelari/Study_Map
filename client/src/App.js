import './App.css';

// react
import React, { useState, useEffect } from 'react';

// openlayers
import GeoJSON from 'ol/format/GeoJSON'
//import Feature from 'ol/Feature';

// components
import MapWrapper from './components/MapWrapper';

function App() {
  
  // set intial state
  const [ features, setFeatures ] = useState([])

  // initialization - retrieve GeoJSON features from Mock JSON API get features from mock 
  //  GeoJson API (read from flat .json file in public directory)
  useEffect(() => {
    // Folgende URL nutzen, falls das Server Backend läuft (FastAPI)
    // fetch('http://localhost:8000/points/')
    // Test Geojson Datei, falls das Server Backend nicht läuft (FastAPI)
    fetch('/geojson_points.json')
      .then(response => response.json())
      .then((fetchedFeatures) => {

        // parse fetched geojson into OpenLayers features
        //  use options to convert feature from EPSG:4326 to EPSG:3857
        const wktOptions = {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        }
        const parsedFeatures = new GeoJSON().readFeatures(fetchedFeatures, wktOptions)

        // set features into state (which will be passed into OpenLayers
        //  map component as props)
        setFeatures(parsedFeatures)

      })

  },[])
  // <MapWrapper features={features} />
  return (
    <div className="App">      
      <div className="app-label">
        <p>GDI Projekt Template</p>        
      </div>      
      <MapWrapper features={features} />
    </div>
  )
}
export default App