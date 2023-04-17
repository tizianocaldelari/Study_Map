// adapted from: https://github.com/tcallsen/react-func-openlayers
// blog entry: https://taylor.callsen.me/using-openlayers-with-react-functional-components/
// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import { transform } from 'ol/proj'
import { toStringXY } from 'ol/coordinate';
import { Fill, Stroke, Circle, Style } from 'ol/style.js';
import { DragRotateAndZoom, defaults as defaultInteractions } from 'ol/interaction.js';
import { FullScreen, ScaleLine, defaults as defaultControls } from 'ol/control.js';

function MapWrapper(props) {
  // set intial state
  const [map, setMap] = useState()
  const [featuresLayer, setFeaturesLayer] = useState()
  const [selectedCoord, setSelectedCoord] = useState()

  // pull refs
  const mapElement = useRef()

  // create state ref that can be accessed in OpenLayers onclick callback function
  //  https://stackoverflow.com/a/60643670
  const mapRef = useRef()
  mapRef.current = map


  // Tile Layers
  var osmsource = new OSM();
  var osmlayer = new TileLayer({
    source: osmsource
  })
  // Google Maps Terrain
  var tileLayerGoogle = new TileLayer({
    source: new XYZ({ url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}', })
  })
  //Laden des WMTS von geo.admin.ch > Hintergrungkarte in der Applikation
  var swisstopoWMTSLayer = 'ch.swisstopo.pixelkarte-grau'; // Swisstopo WMTS Layername

  var wmtsLayer = new TileLayer({
    //extent: extent,
    source: new TileWMS({
      url: 'https://wms.geo.admin.ch/',
      crossOrigin: 'anonymous',
      attributions: '© <a href="http://www.geo.admin.ch/internet/geoportal/' +
        'en/home.html">SWISSIMAGE / geo.admin.ch</a>',
      projection: 'EPSG:3857',
      params: {
        'LAYERS': swisstopoWMTSLayer,
        'FORMAT': 'image/jpeg'
      },
      // serverType: 'mapserver'
    })
  });

  // Style Definitionen
  const bluePointStyle = new Style({
    image: new Circle({
      radius: 5,
      fill: new Fill({
        color: '#3b8cd6'
      }),
      stroke: new Stroke({
        color: 'white',
        width: 2
      })
    })
  });

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect(() => {
    // create and add vector source layer
    const initalFeaturesLayer = new VectorLayer({
      source: new VectorSource(),
      style: bluePointStyle,
    })
    // create map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [wmtsLayer, initalFeaturesLayer],
      view: new View({
        projection: 'EPSG:3857',
        center: [8, 47],
        zoom: 8
      }),
      controls: defaultControls({
        attributionOptions: { collapsible: false },
      }).extend([new FullScreen(), new ScaleLine({ units: 'metric' })]),
      interactions: defaultInteractions().extend([new DragRotateAndZoom()])
    })

    // set map onclick handler
    initialMap.on('click', handleMapClick)

    // save map and vector layer references to state
    //initialMap.setTarget(mapRef.current || "")
    setMap(initialMap)
    setFeaturesLayer(initalFeaturesLayer)
    // required otherwise the map div is rendered twice
    return () => initialMap.setTarget("")
  }, [])

  // update map if features prop changes - logic formerly put into componentDidUpdate
  useEffect(() => {
    if (props.features.length) { // may be null on first render
      // set features to map
      featuresLayer.setSource(
        new VectorSource({
          features: props.features // make sure features is an array
        })
      )
      // fit map to feature extent (with 100px of padding)
      map.getView().fit(featuresLayer.getSource().getExtent(), {
        padding: [100, 100, 100, 100]
      })
    }
  }, [props.features])

  // map click handler
  const handleMapClick = (event) => {
    // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
    //  https://stackoverflow.com/a/60643670
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
    // transform coord to EPSG 4326 standard Lat Long
    const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')
    // set React state
    setSelectedCoord(transormedCoord)
    console.log(transormedCoord)
  }

  // render component
  return (
    <div>

      <div ref={mapElement} className="map-container"></div>

      <div className="clicked-coord-label">
        <p>{(selectedCoord) ? toStringXY(selectedCoord, 5) : ''}</p>
      </div>

    </div>
  )
}
export default MapWrapper