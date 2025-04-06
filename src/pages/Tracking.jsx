import React, { useState } from 'react';
import LoadingScreen from '../components/LoadingScreen';


const Tracking = () => {
  const [ipData, setIpData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIPData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Replace with your actual API key
      const ACCESS_KEY = '49c7d211f478d6ce3b6a1bc48952f80c';
      const url = `https://api.ipstack.com/check?access_key=${ACCESS_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.info || 'Failed to fetch IP data');
      }
      
      setIpData(data);
    } catch (err) {
      setError(err.message || 'Something went wrong');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">IP Geolocation Tracking</h1>
      
      <div className="mb-6">
        <button 
          onClick={fetchIPData}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {loading ? 'Fetching...' : 'Get My Location'}
        </button>
      </div>

      {loading && <LoadingScreen />}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}
      
      {ipData && !loading && (
        <div className="bg-white rounded shadow-md w-full overflow-hidden">
          <div className="border-b p-4 bg-gray-50">
            <h2 className="text-xl font-semibold">IP Information</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">IP Details</h3>
                <p><strong>IP:</strong> {ipData.ip}</p>
                <p><strong>Type:</strong> {ipData.type}</p>
                <p><strong>Hostname:</strong> {ipData.hostname || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Location</h3>
                <p><strong>Country:</strong> {ipData.country_name} ({ipData.country_code})</p>
                <p><strong>Region:</strong> {ipData.region_name}</p>
                <p><strong>City:</strong> {ipData.city}</p>
                <p><strong>Zip:</strong> {ipData.zip || 'N/A'}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Coordinates</h3>
                <p><strong>Latitude:</strong> {ipData.latitude}</p>
                <p><strong>Longitude:</strong> {ipData.longitude}</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Additional Info</h3>
                <p><strong>Timezone:</strong> {ipData.time_zone?.id || 'N/A'}</p>
                <p><strong>Currency:</strong> {ipData.currency?.name || 'N/A'} ({ipData.currency?.code || 'N/A'})</p>
                <p><strong>Connection Type:</strong> {ipData.connection?.type || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tracking;