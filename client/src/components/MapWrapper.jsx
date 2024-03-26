import { useState, useEffect, useRef } from 'react';
import Map from 'ol/Map'
import View from 'ol/View'
import GeoJSON from 'ol/format/GeoJSON';
import 'ol/ol.css';
import Select from 'ol/interaction/Select';
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'

function MapWrapper({ features, setFeatures, selectedFeatureID, setSelectedFeatureID }) {
    // set intial state
    const [featureLayer, setFeatureLayer] = useState()
    const [selectInteraction, setSelectInteraction] = useState()

    // create state ref that can be accessed in callbacks
    const mapRef = useRef()

    // initialize map on first render
    useEffect(() => {
        // if map already initialised, exit function
        if (mapRef.current) return
        let initFeatureLayer = new VectorLayer({
            source: new VectorSource({
                format: new GeoJSON(),
                url: '/countries.geojson'
            }),
        })
        setFeatureLayer(initFeatureLayer)
        mapRef.current = new Map({
            target: 'map',
            layers: [initFeatureLayer],
            view: new View({ projection: 'EPSG:3857', center: [0, 0], zoom: 4 })
        })
        initFeatureLayer.getSource().on('featuresloadend', (evt) => {
            setFeatures(evt.target.getFeatures())
        })
        // add interaction
        const select = new Select();
        select.on('select', function (e) {
            if (e.selected.length) {
                setSelectedFeatureID(e.selected[0].getId())
            } else setSelectedFeatureID()
        });
        mapRef.current.addInteraction(select);
        setSelectInteraction(select);
    }, [])

    // update featureLayer if features prop changes
    useEffect(() => {
        // featureLayer may not be initialised yet
        if (featureLayer && features?.length) {
            // fit map to feature extent (with 100px of padding)
            mapRef.current.getView().fit(featureLayer.getSource().getExtent(), {
                padding: [100, 100, 100, 100]
            })
        }
    }, [features, featureLayer])

    // set selected feature on map
    useEffect(() => {
        // check for initialisation
        if (selectInteraction && featureLayer) {
            selectInteraction.getFeatures().clear();
            // get selected feature
            const selectedFeature = featureLayer
                .getSource()
                .getFeatures()
                .filter(f => f.getId() === selectedFeatureID)[0];
            if (selectedFeature) {
                selectInteraction.getFeatures().push(selectedFeature);
                mapRef.current.getView().fit(selectedFeature.getGeometry(), {
                    padding: [100, 100, 100, 100], duration: 1000
                })
            }
        }
    }, [selectInteraction, selectedFeatureID, featureLayer])

    return (<div id='map' style={{ flex: '2 1 600px', margin: '1em', height: '70vh' }} className="map-container"></div>)
}

export default MapWrapper

/*
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
*/