import axios from 'axios';
const getAddressCoordinate = async (address) => {
  const api_key = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${api_key}`;
  try {
    const response = await axios.get(url);
    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return { ltd: location.lat, lng: location.lng };
    } else {
      console.log('Unable to fetch Coordinates');
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const toRadians = (deg) => (deg * Math.PI) / 180;

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c * 1000; // Distance in meters
};

export { getAddressCoordinate, calculateDistance };
