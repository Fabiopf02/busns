import MbxGeo from '@mapbox/mapbox-sdk/services/geocoding';

interface ICoords {
  body: {
    features: [
      {
        geometry: {
          coordinates: number[];
        };
      },
    ];
  };
}

const geocoder = MbxGeo({ accessToken: process.env.MAPBOX_TOKEN });

async function getGeocoding(address: string): Promise<number[]> {
  try {
    const response: ICoords = await geocoder
      .forwardGeocode({
        mode: 'mapbox.places',
        types: ['address'],
        query: address,
        limit: 1,
      })
      .send();

    const coords = response.body.features[0].geometry.coordinates;

    return coords;
  } catch (err) {
    return err;
  }
}

export { getGeocoding };
