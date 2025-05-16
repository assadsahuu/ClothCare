import React, { useEffect, useState } from 'react';
import '../css/home.css';
import { Button, Card } from 'flowbite-react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { ref, get } from 'firebase/database';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import { Modal } from 'flowbite-react';

const StarRating = ({ totalStars, rating }) => (
  <>
    {Array.from({ length: totalStars }).map((_, index) => (
      <svg
        key={index}
        className={`h-5 w-5 ${index < rating ? 'text-yellow-300' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </>
);

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const TouchMarker = ({ position, children }) => {
  const markerRef = React.useRef(null);

  const eventHandlers = React.useMemo(() => ({
    touchstart(e) {
      e.originalEvent.preventDefault();
      const marker = markerRef.current;
      if (marker) marker.openPopup();
    }
  }), []);

  return (
    <Marker
      ref={markerRef}
      position={position}
      eventHandlers={eventHandlers}
    >
      {children}
    </Marker>
  );
};


const Home = () => {
  const [showMap, setShowMap] = useState(false);
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([27.7172, 85.3240]); // Default center (Kathmandu)
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [radius, setRadius] = useState(5); // in kilometers




  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Correct Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setMapCenter([latitude, longitude]); // Update map center
        },
        (error) => {
          setError(`Location access denied: ${error.message}`);
          setLocation(null);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const RadiusCircle = () => {
    return selectedLocation ? (
      <Circle
        center={[selectedLocation.lat, selectedLocation.lng]}
        radius={radius * 1000} // Convert km to meters
        color="blue"
        fillColor="blue"
        fillOpacity={0.1}
      />
    ) : null;
  };

  const fetchShops = async () => {
    setLoading(true);
    try {
      const shopsRef = ref(db, 'SHOPS');
      const snapshot = await get(shopsRef);

      if (snapshot.exists()) {
        const shopsData = snapshot.val();
        const shopsArray = Object.keys(shopsData).map(key => ({
          id: key,
          ...shopsData[key]
        }));

        // Removed location filtering
        setShops(shopsArray);
        setFilteredShops(shopsArray);
      } else {
        setShops([]);
        setFilteredShops([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []); // Empty dependency array to run only once on mount

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();

    setFilteredShops(
      shops.filter(shop => {
        if (!shop.latitude || !shop.longitude) return false;

        const matchesSearch = (shop.name || "").toLowerCase().includes(lowercasedQuery) ||
          (shop.address || "").toLowerCase().includes(lowercasedQuery);

        // Check distance if any location is selected
        const currentLocation = selectedLocation || location;
        if (currentLocation) {
          const distance = calculateDistance(
            currentLocation.lat || currentLocation.latitude,
            currentLocation.lng || currentLocation.longitude,
            shop.latitude,
            shop.longitude
          );
          return matchesSearch && distance <= radius;
        }

        return matchesSearch;
      })
    );
  }, [searchQuery, shops, location, radius, selectedLocation]);



  if (loading) return <p>Loading...</p>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 p-4">
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              pill
              type="text"
              placeholder="Search for shops..."
              className="flex-1 px-4 py-2 text-sm border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:ring-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button outline pill onClick={handleLocation} gradientMonochrome="info">
              <FaMapMarkerAlt className="mr-2" />
              {location ? 'Update Location' : 'Near Me'}
            </Button>
            <Button outline pill onClick={() => setShowMap(true)} gradientMonochrome="info">
              Select On Map
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <label className="whitespace-nowrap">Search Radius (km):</label>
            <input
              type="range"
              min="1"
              max="20"
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="w-16 text-center font-semibold">{radius} km</span>
          </div>
        </div>

        <Modal show={showMap} onClose={() => setShowMap(false)} size="4xl">
          <Modal.Header>Select Location and Radius</Modal.Header>
          <Modal.Body>
            <div className="h-96 w-full relative">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                touchZoom={true}
                doubleClickZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />

                <MapClickHandler onMapClick={(latlng) => {
                  setSelectedLocation(latlng);
                  setMapCenter([latlng.lat, latlng.lng]);
                }} />

                {selectedLocation && (
                  <>
                    <TouchMarker position={[selectedLocation.lat, selectedLocation.lng]}>
                      <Popup>
                        Selected Area Center <br />
                        Radius: {radius}km
                      </Popup>
                    </TouchMarker>
                    <RadiusCircle />
                  </>
                )}

                {location && (
                  <TouchMarker position={[location.latitude, location.longitude]}>
                    <Popup>Your Location</Popup>
                  </TouchMarker>
                )}
              </MapContainer>
            </div>
          </Modal.Body>
        </Modal>
      </div>


      <div className="p-4 services-container">
        {filteredShops.length === 0 ? (
          <p>No shops found matching your criteria.</p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 services-list">
            {filteredShops.map((shp) => (
              <li
                key={shp.id}
                className="service-item flex flex-col justify-between rounded-lg border border-gray-300 bg-white shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                <Card className="h-full w-full flex flex-col">
                  <Link to={`/details/${shp.id}/services`}>
                    <img
                      src={shp.image}
                      alt={shp.name}
                      className="h-48 w-full object-cover rounded-lg"
                    />
                  </Link>
                  <div className="p-4">
                    <h5 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                      {shp.name}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-300">{shp.address}</p>
                    <div className="mb-5 mt-2.5 flex items-center">
                      <StarRating
                        totalStars={5}
                        rating={Object.values(shp.rating || {}).reduce((acc, curr) => acc + curr.rate, 0) / Object.keys(shp.rating || {}).length || 0}
                      />
                      <span className="ml-3 mr-2 rounded bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold text-cyan-800 dark:bg-cyan-200 dark:text-cyan-800">
                        {Object.keys(shp.rating || {}).length} reviews
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Minimum order: ₨{shp.min}
                      </span>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default Home;