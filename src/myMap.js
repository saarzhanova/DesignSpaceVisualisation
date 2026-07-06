// get rid of sliding when scrolling the map

let viewerDiv = document.getElementById('viewerDiv');
let placement = {
    // coord: new itowns.Coordinates('EPSG:4326', 2.3522, 48.8566),
    coord: new itowns.Coordinates(
        'EPSG:4978',
        4197002.380555709, 171684.20746346193, 4783555.70678955
    ).as('EPSG:4326'),
    range: 500,
    tilt: 25,
};

let view = new itowns.GlobeView(viewerDiv, placement);

const mapStyle = new itowns.TMSSource({
    url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/${z}/${x}/${y}.png',
    crs: 'EPSG:3857',
    format: 'image/png',
});
view.addLayer(new itowns.ColorLayer('VoyagerNoLabels', { source: mapStyle }))

const elevationSource = new itowns.WMTSSource({
    url: 'https://data.geopf.fr/wmts?',
    crs: 'EPSG:4326',
    name: 'ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES',
    tileMatrixSet: 'WGS84G',
    format: 'image/x-bil;bits=32',
    zoom: { max : 19 } // remove!!
});
const elevationLayer = new itowns.ElevationLayer('MNT_WORLD', { source: elevationSource });
view.addLayer(elevationLayer);

const paris = new itowns.Extent('EPSG:4326', 2.224, 2.469, 48.815, 48.902);

function setAltitude(p) {
    return 0;
}
function setExtrusion(p) {
    return p.hauteur || 10;
}
function setColor(p) {
    return new itowns.THREE.Color(0xffffff);
}

const geometrySource = new itowns.WFSSource({
    url: 'https://data.geopf.fr/wfs/ows?',
    version: '2.0.0',
    typeName: 'BDTOPO_V3:batiment',
    crs: 'EPSG:4326',
    ipr: 'IGN',
    format: 'application/json',
    extent: paris,
});

const geometryLayer = new itowns.FeatureGeometryLayer('Buildings', {
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
view.addLayer(geometryLayer)

export { view, geometryLayer };




