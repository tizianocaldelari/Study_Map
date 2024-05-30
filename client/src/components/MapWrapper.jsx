import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import { defaults as defaultControls } from 'ol/control.js';
import './MapWrapper.css'; // Import the CSS file

const MapWrapper = forwardRef((props, ref) => {
    const [map, setMap] = useState();
    const [backgroundMap, setBackgroundMap] = useState('Landeskarte-farbe');
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
                zoom: 1,
                maxZoom: 20,
                minZoom: getMinZoom(),
                extent: getBackgroundExtent(),
            }),
            controls: defaultControls({
                attributionOptions: { collapsible: false },
            }),
        });

        setMap(initialMap);

        return () => {
            if (initialMap) {
                initialMap.setTarget(null);
            }
        };
    }, []);

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
                    })
                });
            default:
                return new TileLayer({ source: new OSM() });
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

    return (
        <div className="container">
            <div ref={mapElement} className="map-container"></div>
        </div>
    );
});

export default MapWrapper;