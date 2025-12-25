export const NDVI_NDWI_EVALSCRIPT = `
//VERSION=3
function setup() {
  return {
    input:  ["B04", "B08", "B03" ,"dataMask"],
    output: [
      { id: "ndvi", bands: 1 },
      { id: "ndwi", bands: 1 },
      { id: "dataMask", bands: 1 }
    ]
  };
}

function evaluatePixel(s) {
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);
  const ndwi = (s.B03 - s.B08) / (s.B03 + s.B08);

  return {
    ndvi: [ndvi],
    ndwi: [ndwi],
    dataMask: [s.dataMask]
  };
}

`;
