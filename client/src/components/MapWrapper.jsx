import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import { defaults as defaultControls, ScaleLine, FullScreen } from 'ol/control';
import './MapWrapper.css';
import Searchbar from './Searchbar';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import Modal from 'react-modal';

const MapWrapper = forwardRef((props, ref) => {
    const [map, setMap] = useState();
    const [backgroundMap, setBackgroundMap] = useState('Landeskarte-farbe');
    const [attributionVisible, setAttributionVisible] = useState(false);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const mapElement = useRef();
    const mapRef = useRef();
    mapRef.current = map;

    useEffect(() => {
        const initialMap = new Map({
            target: mapElement.current,
            layers: [getBackgroundLayer()],
            view: new View({
                projection: 'EPSG:3857',
                center: [919705.97978, 5923388.48616],
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
                        projection: 'EPSG:3857',
                        params: {
                            'LAYERS': getLayerName(backgroundMap),
                            'FORMAT': 'image/jpeg'
                        },
                    }),
                    zIndex: 0
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
        return [506943.5, 5652213.5, 1301728.5, 6191092];
    };

    const addMarkers = (features) => {
        if (!map) return; // Ensure the map is initialized

        // Rimuove i layer esistenti per evitare sovrapposizioni
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
                    fill: new Fill({ color: 'rgba(255, 0, 0, 0.5)' }),
                    stroke: new Stroke({ color: 'red', width: 1 })
                })
            }));

            vectorSource.addFeature(marker);
        });

        const vectorLayer = new VectorLayer({
            source: vectorSource,
            zIndex: 1
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
                overlayClassName="overlay"
            >
                {renderFeatureDetails()}
            </Modal>
        </div>
    );
});

export default MapWrapper;
