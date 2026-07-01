let viewerDiv = document.getElementById('viewerDiv');
let placement = {
    coord: new itowns.Coordinates('EPSG:4326', 4.818, 45.7354),
    range: 1000,
    tilt: 20,
};
let view = new itowns.GlobeView(viewerDiv, placement);

let colorSource = new itowns.WMTSSource({
    url: 'https://data.geopf.fr/wmts?',
    crs: 'EPSG:3857',
    name: 'ORTHOIMAGERY.ORTHOPHOTOS',
    tileMatrixSet: 'PM',
    format: 'image/jpeg'
});

let colorLayer = new itowns.ColorLayer('Ortho', {
    source: colorSource,
});

view.addLayer(colorLayer);

let elevationSource = new itowns.WMTSSource({
    url: 'https://data.geopf.fr/wmts?',
    crs: 'EPSG:4326',
    name: 'ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES',
    tileMatrixSet: 'WGS84G',
    format: 'image/x-bil;bits=32',
    tileMatrixSetLimits: {
        11: {
            minTileRow: 442,
            maxTileRow: 1267,
            minTileCol: 1344,
            maxTileCol: 2683
        },
        12: {
            minTileRow: 885,
            maxTileRow: 2343,
            minTileCol: 3978,
            maxTileCol: 5126
        },
        13: {
            minTileRow: 1770,
            maxTileRow: 4687,
            minTileCol: 7957,
            maxTileCol: 10253
        },
        14: {
            minTileRow: 3540,
            maxTileRow: 9375,
            minTileCol: 15914,
            maxTileCol: 20507
        }
    }
});

// Geometry Layer
let elevationLayer = new itowns.ElevationLayer('MNT_WORLD', {
    source: elevationSource,
});

view.addLayer(elevationLayer);

// Modifying the polygons

function setAltitude(properties) {
    // console.log(properties);
    return properties.altitude_minimale_sol;
}

function setExtrusion(properties) {
    return properties.hauteur;
}

function setColor(properties) {
    return new itowns.THREE.Color(0xaaaaaa);
}

var geometrySource = new itowns.WFSSource({
    url: 'https://data.geopf.fr/wfs/ows?',
    version: '2.0.0',
    typeName: 'BDTOPO_V3:batiment',
    crs: 'EPSG:4326',
    ipr: 'IGN',
    format: 'application/json',
});

var geometryLayer = new itowns.FeatureGeometryLayer('Buildings', {
    source: geometrySource,
    zoom: { min: 14 },
    style: {
        fill: {
            base_altitude: setAltitude,
            extrusion_height: setExtrusion,
            color: setColor,
        }
    },
});

view.addLayer(geometryLayer);




