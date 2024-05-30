import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import { defaults as defaultControls, ScaleLine, FullScreen } from 'ol/control';
import 'ol/ol.css';
import './MapWrapper.css';
import Searchbar from './Searchbar';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import Modal from 'react-modal';
import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import { fromLonLat, toLonLat, transform } from 'ol/proj';

// Register EPSG:2056
proj4.defs('EPSG:2056', '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=2600000 +y_0=1200000 +ellps=bessel +towgs84=674.374,15.056,405.346,0,0,0,0 +units=m +no_defs');
register(proj4);

const MapWrapper = forwardRef((props, ref) => {
    const [map, setMap] = useState();
    const [backgroundMap, setBackgroundMap] = useState('Landeskarte-farbe');
    const [attributionVisible, setAttributionVisible] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const mapElement = useRef();
    const overlayElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;

    useEffect(() => {
        const initialMap = new Map({
            target: mapElement.current,
            layers: [getBackgroundLayer()],
            view: new View({
                projection: 'EPSG:2056',
                center: [2600000, 1200000],
                zoom: 8,
                maxZoom: 20,
                minZoom: getMinZoom(),
                extent: getBackgroundExtent(),
            }),
            controls: defaultControls().extend([
                new ScaleLine(),
                new FullScreen(),
            ]),
        });

        setMap(initialMap);

        return () => {
            if (initialMap) {
                initialMap.setTarget(null);
            }
        };
    }, []);

    useEffect(() => {
        if (map) {
            map.on('singleclick', handleMapClick);
        }
    }, [map]);

    const getMinZoom = () => {
        const desktopMinZoom = 8.3;
        const mobileMinZoom = 7.5;
        return window.matchMedia('(max-width: 1080px)').matches ? mobileMinZoom : desktopMinZoom;
    };

    const getBackgroundLayer = () => {
        switch (backgroundMap) {
            case 'Landeskarte-farbe':
                return new TileLayer({
                    source: new TileWMS({
                        url: 'https://wms.geo.admin.ch/',
                        crossOrigin: 'anonymous',
                        attributions: '© <a href="http://www.geo.admin.ch/internet/geoportal/en/home.html">SWISSIMAGE / geo.admin.ch</a>',
                        projection: 'EPSG:2056',
                        params: {
                            'LAYERS': getLayerName(backgroundMap),
                            'FORMAT': 'image/jpeg'
                        },
                    }),
                    zIndex: 0,
                    opacity: 0.5,
                });
            default:
                return new TileLayer({ source: new OSM(), zIndex: 0 });
        }
    };

    const getLayerName = (mapType) => {
        switch (mapType) {
            case 'Landeskarte-farbe':
                return 'ch.swisstopo.pixelkarte-farbe';
        }
    };

    const getBackgroundExtent = () => {
        return [2420000, 1030000, 2900000, 1350000];
    };

    const addMarkers = (features) => {
        if (!map) return;

        map.getLayers().getArray().slice(1).forEach(layer => map.removeLayer(layer));

        const vectorSource = new VectorSource();

        features.forEach(feature => {
            const coordinates = feature.geometry.coordinates;
            const { University, Campus } = feature.properties;

            const marker = new Feature({
                geometry: new Point(coordinates),
                name: University,
                campus: Campus,
            });

            marker.setStyle(new Style({
                image: new CircleStyle({
                    radius: 7,
                    fill: new Fill({ color: 'rgb(50, 140, 255)' }),
                    stroke: new Stroke({ color: 'rgb(100, 0, 200)', width: 3 }),
                    zIndex: 1000
                })
            }));

            vectorSource.addFeature(marker);
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            zIndex: 2
        });

        map.addLayer(vectorLayer);
        map.getView().fit(vectorSource.getExtent(), { padding: [100, 100, 100, 100] });
    };

    useImperativeHandle(ref, () => ({
        getMap: () => mapRef.current
    }));

    useEffect(() => {
        if (map) {
            const layers = map.getLayers().getArray();
            layers[0] = getBackgroundLayer();
            map.render();
        }
    }, [backgroundMap, map]);

    const handleSearch = (filteredDepartments, geojsonData) => {
        const featuresFound = geojsonData.features.filter(feature =>
            filteredDepartments.some(dept => feature.properties.Departments.includes(dept))
        );

        if (featuresFound.length > 0) {
            console.log(`Features found: ${JSON.stringify(featuresFound)}`); // Debug log
            addMarkers(featuresFound);
        } else {
            alert('No departments found.');
        }
    };

    const handleMapClick = (event) => {
        if (!map) return; // Ensure the map is initialized

        map.forEachFeatureAtPixel(event.pixel, function (feature) {
            setSelectedFeature(feature.getProperties());
            setModalIsOpen(true);
            return true; // Stop after the first feature is found
        });
    };

    const toggleAttribution = () => {
        setAttributionVisible(!attributionVisible);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const renderFeatureDetails = () => {
        if (!selectedFeature) return null;
        return (
            <div>
                <h2>Feature Details</h2>
                <ul>
                    {Object.keys(selectedFeature).map((key, index) => {
                        const value = selectedFeature[key];
                        return (
                            <li key={index}>
                                <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : value}
                            </li>
                        );
                    })}
                </ul>
                <button onClick={closeModal}>Close</button>
            </div>
        );
    };

    return (
        <div className="container">
            <Searchbar onSearch={handleSearch} />
            <div ref={mapElement} className="map-container"></div>
            <button onClick={toggleAttribution} className="attribution-button">i</button>
            {attributionVisible && (
                <div className="attribution-content">
                    © <a href="http://www.geo.admin.ch/internet/geoportal/en/home.html">SWISSIMAGE / geo.admin.ch</a>
                </div>
            )}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Feature Details"
                className="modal"
                overlayClassName="modal-overlay"
            >
                {renderFeatureDetails()}
            </Modal>
        </div>
    );
});

export default MapWrapper;
