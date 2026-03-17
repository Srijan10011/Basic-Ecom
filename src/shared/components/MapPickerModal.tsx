import React, { useState, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

interface MapPickerModalProps {
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number) => void;
  initialPosition?: { lat: number; lng: number };
}

const DEFAULT_CENTER = { lat: 28.212908, lng: 83.975433 };

const MapPickerModal: React.FC<MapPickerModalProps> = ({ onClose, onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number }>(initialPosition || DEFAULT_CENTER);

  if (!import.meta.env.VITE_GOOGLE_MAPS_KEY) {
    console.error("Google Maps API key is missing");
  }

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
   
  });

  React.useEffect(() => {
  if (initialPosition) return;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setPosition(DEFAULT_CENTER),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  } else {
    setPosition(DEFAULT_CENTER);
  }
}, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newPos = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setPosition(newPos);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 md:w-2/3 lg:w-1/2 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Select Delivery Location</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="flex-grow relative" style={{ height: '400px', minHeight: '400px' }}>
          {!isLoaded || !position ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Loading map...
            </div>
          ) : (
            <>
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={position}
                zoom={13}
                onClick={handleMapClick}
                clickableIcons={false}
                options={{
                  streetViewControl: false,
                  fullscreenControl: false,
                }}
              >
                {/* ✅ ALWAYS render marker when position exists */}
                {position && (
                  <Marker
                    key={`${position.lat}-${position.lng}`} // 🔥 forces re-render
                    position={position}
                    draggable={true}
                    onDragEnd={(e) => {
                      if (e.latLng) {
                        setPosition({
                          lat: e.latLng.lat(),
                          lng: e.latLng.lng(),
                        });
                      }
                    }}
                  />
                )}
              </GoogleMap>

              
            </>
          )}
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (position) {
                if (isLoaded && window.google) {
                  const geocoder = new google.maps.Geocoder();
                  geocoder.geocode({ location: position }, (results, status) => {
                    if (status === "OK" && results?.[0]) {
                      console.log("Selected address:", results[0].formatted_address);
                    }
                  });
                }

                onLocationSelect(position.lat, position.lng);
              }
            }}
            disabled={!position}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-semibold disabled:opacity-50"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;