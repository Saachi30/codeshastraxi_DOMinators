import React, { useState } from 'react';
import { Search } from 'lucide-react';

const VoterDetailsModal = ({ contractInstance, provider }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [commitmentHash, setCommitmentHash] = useState('');
  const [voterDetails, setVoterDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    setVoterDetails(null);
    setError('');
  };

  const handleInputChange = (e) => {
    setCommitmentHash(e.target.value);
    setError('');
  };

  const fetchVoterDetails = async () => {
    if (!commitmentHash) {
      setError('Please enter a commitment hash');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Call the contract's getVoterDetails function
      const details = await contractInstance.getVoterDetails(commitmentHash);
      
      setVoterDetails({
        disputeCredits: details[0].toString(),
        votingPower: details[1].toString(),
        remainingCredits: details[2].toString()
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching voter details:', err);
      setError('Error fetching voter details. Please check the commitment hash and try again.');
      setVoterDetails(null);
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button 
        onClick={openModal}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center"
      >
        <Search className="mr-2 h-4 w-4" />
        View Voter Details
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Voter Details</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="commitmentHash" className="block text-sm font-medium text-gray-700 mb-1">
                Commitment Hash
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="commitmentHash"
                  value={commitmentHash}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  className="flex-grow p-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={fetchVoterDetails}
                  disabled={isLoading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isLoading ? 'Loading...' : 'Search'}
                </button>
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            {voterDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Voter Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Voting Power:</span>
                    <span className="font-medium">{voterDetails.votingPower}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dispute Credits:</span>
                    <span className="font-medium">{voterDetails.disputeCredits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining Credits:</span>
                    <span className="font-medium">{voterDetails.remainingCredits}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoterDetailsModal;