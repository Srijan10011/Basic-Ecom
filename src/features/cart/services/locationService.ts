export const getGeolocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        const errorMessages: { [key: number]: string } = {
          1: 'You denied the request for Geolocation. To use this feature, please enable location services for this site in your browser settings.',
          2: 'Location information is unavailable.',
          3: 'The request to get user location timed out.',
        };
        reject(new Error(errorMessages[error.code] || 'An unknown error occurred.'));
      }
    );
  });
};

export const formatLocation = (latitude: number, longitude: number): string => {
  return `${latitude}, ${longitude}`;
};

export const parseLocation = (location: string): { lat: number; lng: number } => {
  const [lat, lng] = location.split(', ').map(parseFloat);
  return { lat, lng };
};
