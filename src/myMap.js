// get rid of sliding when scrolling the map
// hover on buildings and highlight frames

let viewerDiv = document.getElementById('viewerDiv');
let placement = {
    // coord: new itowns.Coordinates('EPSG:4326', 2.3522, 48.8566),
    coord: new itowns.Coordinates(
        'EPSG:4978',
        4199670.12118145, 168316.83159732557, 4781339.913502969
    ).as('EPSG:4326'),
    range: 700,
    tilt: 25,
};

let view = new itowns.GlobeView(viewerDiv, placement);

// const mapStyle = new itowns.TMSSource({
//     url: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/${z}/${x}/${y}.png',
//     crs: 'EPSG:3857',
//     format: 'image/png',
// });
// view.addLayer(new itowns.ColorLayer('VoyagerNoLabels', { source: mapStyle }))

// const graySource = new itowns.TMSSource({
//     url: 'src/styles/gray.png',
//     crs: 'EPSG:3857',
//     format: 'image/png',
// });
//
// view.addLayer(new itowns.ColorLayer('GrayBackground', {
//     source: graySource,
// }));

const graySource = new itowns.TMSSource({
    url: './src/styles/white.png',
    crs: 'EPSG:3857',
    format: 'image/png',
});

view.addLayer(new itowns.ColorLayer('GrayBackground', {
    source: graySource,
}));

const elevationSource = new itowns.WMTSSource({
    url: 'https://data.geopf.fr/wmts?',
    crs: 'EPSG:4326',
    name: 'ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES',
    tileMatrixSet: 'WGS84G',
    format: 'image/x-bil;bits=32',
    zoom: { max : 14 } // remove!!
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

const edgeMaterial = new itowns.THREE.LineBasicMaterial({
    color: 0xc5c5c5,
    linewidth: 1,
});

function addBuildingOutlines() {
    geometryLayer.object3d.traverse((obj) => {
        if (!obj.isMesh) return;
        if (obj.userData.hasOutline) return;

        const edges = new itowns.THREE.EdgesGeometry(obj.geometry, 20);
        const outline = new itowns.THREE.LineSegments(edges, edgeMaterial);

        outline.renderOrder = 999;
        obj.add(outline);

        obj.userData.hasOutline = true;
    });
}

view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.AFTER_RENDER, () => {
    addBuildingOutlines();
});

export { view, geometryLayer };




