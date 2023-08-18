const GOOGLE_MAP_API_KEY = 'REPLACE_WITH_API_KEY_FROM_ENV_VARIABLES';

const getAddressFromCoordinates = ({latitude, longitude}) =>
  new Promise((resolve, reject) => {
    fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${latitude},${longitude}&key=${GOOGLE_MAP_API_KEY}`,
    )
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.status === 'OK') {
          let neighborhood = '';
          const neighborhoodDataIndex =
            responseJson?.results?.[0].address_components.findIndex(a =>
              a.types.includes('neighborhood'),
            );
          if (neighborhoodDataIndex > -1) {
            neighborhood =
              responseJson?.results?.[0].address_components[
                neighborhoodDataIndex
              ].long_name;
          }

          const longAddress = responseJson?.results[0].formatted_address;

          const formattedAddress =
            responseJson?.results?.find(r => r.types.includes('political'))
              .formatted_address ||
            responseJson?.results?.find(r => r.types.includes('route'))
              .formatted_address;

          resolve({
            formattedAddress,
            longAddress,
            neighborhood,
          });
        } else {
          reject(new Error('not found'));
        }
      })
      .catch(error => {
        reject(error);
      });
  });

export default {
  getAddressFromCoordinates,
};
