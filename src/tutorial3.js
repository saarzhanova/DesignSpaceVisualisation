const viewerDiv = document.getElementById('viewerDiv');

itowns.proj4.defs(
    'EPSG:2154',
    '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

const viewExtent = new itowns.Extent(
    'EPSG:2154',
    644500.0, 659499.99,
    6857500.0, 6867499.99,
);

const view = new itowns.PlanarView(viewerDiv, viewExtent);