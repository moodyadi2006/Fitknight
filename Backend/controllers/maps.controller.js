import {
  calculateDistance,
  getAddressCoordinate,
} from '../services/maps.service.js';

const getDistance = async (req, res) => {
  try {
    const ltd1 = req.body.lat1;
    const lng1 = req.body.lng1;
    const ltd2 = req.body.lat2;
    const lng2 = req.body.lng2;

    if (!ltd1 || !lng1 || !ltd2 || !lng2) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required query parameters: 'ltd1', 'lng1', 'ltd2', 'lng2'.",
      });
    }

    const latitude1 = parseFloat(ltd1);
    const longitude1 = parseFloat(lng1);
    const latitude2 = parseFloat(ltd2);
    const longitude2 = parseFloat(lng2);

    if (
      isNaN(latitude1) ||
      isNaN(longitude1) ||
      isNaN(latitude2) ||
      isNaN(longitude2)
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid query parameters. Ensure 'ltd1', 'lng1', 'ltd2', and 'lng2' are valid numbers.",
      });
    }

    // Calculate distance
    const distance = calculateDistance(
      latitude1,
      longitude1,
      latitude2,
      longitude2,
    );

    res.status(200).json({
      success: true,
      data: {
        distance,
        unit: 'meters',
      },
    });
  } catch (error) {
    console.error('Error calculating distance:', error);

    // Internal server error response
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.',
    });
  }
};

const getAddressCoordinates = async (req, res) => {
  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({
        error:
          "Invalid or missing 'address' parameter. Please provide a valid address.",
      });
    }

    // Call the function to get coordinates
    const coordinates = await getAddressCoordinate(address);

    if (!coordinates) {
      return res.status(404).json({
        error: 'Coordinates not found for the given address.',
      });
    }

    return res.status(200).json(coordinates);
  } catch (error) {
    console.error('Error fetching address coordinates:', error);

    // Handle specific errors if needed
    if (error.response) {
      // If error originates from an API call
      return res.status(error.response.status).json({
        error: error.response.data.error || 'External API error occurred.',
      });
    }

    // Generic error response
    res.status(500).json({
      error: 'Internal server error. Please try again later.',
    });
  }
};

export { getDistance, getAddressCoordinates };
