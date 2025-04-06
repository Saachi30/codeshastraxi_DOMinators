import React, { useState, useRef } from 'react';
import { ethers } from 'ethers';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import Papa from 'papaparse';
import abi from '../abi.json';
import { sendElectionInvitations } from '../components/Email';
const CreateTopic = () => {
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    choices: ['', ''],
    duration: 86400, // Default duration - 1 day in seconds
    locationHash: '',
    votingMethod: 0, // Default: 0 - Single choice
    minVotingPower: 1, // Default minimum voting power
    // Firebase specific fields
    pincode: '',
    type: 'college', // Default type
    creatorEmail: '',
    allowAllUsers: true, // Toggle between all users or specific users
    participants: [] // Array of participant emails
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [csvFile, setCsvFile] = useState(null);
  const [parsedEmails, setParsedEmails] = useState([]);
  
  const contractAddress = '0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC';
  const contractABI = abi;
  
  const electionTypes = [
    { value: 'college', label: 'College/University' },
    { value: 'office', label: 'Office/Workplace' },
    { value: 'building', label: 'Residential Building' },
    { value: 'community', label: 'Community/Association' },
    { value: 'other', label: 'Other' }
  ];
  
  const votingMethods = [
    { value: 0, label: 'Single Choice' },
    { value: 1, label: 'Multiple Choice' },
    { value: 2, label: 'Ranked Choice' },
    { value: 3, label: 'Quadratic Voting' }
  ];
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleChoiceChange = (index, value) => {
    const updatedChoices = [...formData.choices];
    updatedChoices[index] = value;
    setFormData({
      ...formData,
      choices: updatedChoices
    });
  };
  
  const addChoice = () => {
    setFormData({
      ...formData,
      choices: [...formData.choices, '']
    });
  };
  
  const removeChoice = (index) => {
    if (formData.choices.length <= 2) {
      setError("At least two choices are required");
      return;
    }
    
    const filteredChoices = formData.choices.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      choices: filteredChoices
    });
  };
  
  const handleToggleChange = () => {
    setFormData({
      ...formData,
      allowAllUsers: !formData.allowAllUsers,
      participants: [] // Reset participants when toggling
    });
    setParsedEmails([]);
    setCsvFile(null);
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      
      Papa.parse(file, {
        complete: (results) => {
          // Extract emails from CSV
          const emails = results.data
            .flat() // Flatten in case of nested arrays
            .filter(email => email && email.includes('@')) // Basic email validation
            .map(email => email.trim());
          
          setParsedEmails(emails);
          setFormData({
            ...formData,
            participants: emails
          });
        },
        error: (error) => {
          setError(`CSV parsing error: ${error.message}`);
        }
      });
    }
  };
  
  const generateUniqueCode = () => {
    // Generate a 6-character alphanumeric code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };
  
  // const saveToFirebase = async (topicId) => {
  //   try {
  //     const db = getFirestore();
  //     const uniqueCode = generateUniqueCode();
  //     const electionId = uuidv4();
      
  //     await setDoc(doc(db, "elections", electionId), {
  //       topicId,
  //       name: formData.name,
  //       description: formData.description,
  //       pincode: formData.pincode,
  //       type: formData.type,
  //       creatorEmail: formData.creatorEmail,
  //       participants: formData.allowAllUsers ? [] : formData.participants,
  //       allowAllUsers: formData.allowAllUsers,
  //       uniqueCode,
  //       txHash,
  //       createdAt: new Date().toISOString(),
  //       duration: Number(formData.duration),
  //       votingMethod: Number(formData.votingMethod)
  //     });
      
  //     return uniqueCode;
  //   } catch (error) {
  //     console.error("Firebase error:", error);
  //     throw new Error("Failed to save election data to Firebase");
  //   }
  // };
  
  const saveToFirebase = async (topicId) => {
    try {
      const db = getFirestore();
      const uniqueCode = generateUniqueCode();
      const electionId = uuidv4();
      
      const electionData = {
        topicId,
        name: formData.name,
        description: formData.description,
        pincode: formData.pincode,
        type: formData.type,
        creatorEmail: formData.creatorEmail,
        participants: formData.allowAllUsers ? [] : formData.participants,
        allowAllUsers: formData.allowAllUsers,
        uniqueCode,
        txHash,
        createdAt: new Date().toISOString(),
        duration: Number(formData.duration),
        votingMethod: Number(formData.votingMethod)
      };
      
      await setDoc(doc(db, "elections", electionId), electionData);
      
      return { uniqueCode, electionData };
    } catch (error) {
      console.error("Firebase error:", error);
      throw new Error("Failed to save election data to Firebase");
    }
  };
  const createTopic = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setTxHash('');
    setIsSuccess(false);
    
    // Validate form
    if (!formData.name.trim()) {
      setError("Topic name is required");
      setIsLoading(false);
      return;
    }
    
    if (!formData.description.trim()) {
      setError("Description is required");
      setIsLoading(false);
      return;
    }
    
    if (formData.choices.length < 2 || formData.choices.some(choice => !choice.trim())) {
      setError("At least two non-empty choices are required");
      setIsLoading(false);
      return;
    }
    
    if (!formData.pincode.trim()) {
      setError("Pincode is required");
      setIsLoading(false);
      return;
    }
    
    if (!formData.creatorEmail.trim()) {
      setError("Creator email is required");
      setIsLoading(false);
      return;
    }
    
    if (!formData.allowAllUsers && formData.participants.length === 0) {
      setError("Please upload a CSV file with participant emails");
      setIsLoading(false);
      return;
    }
    
    try {
      // Connect to provider and get signer
      if (!window.ethereum) {
        throw new Error("MetaMask or similar provider not found. Please install MetaMask.");
      }
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Create contract instance
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      
      // Convert duration to seconds if it's entered in days
      const durationInSeconds = Number(formData.duration);
      
      // Call contract function
      const tx = await contract.createTopic(
        formData.name,
        formData.description,
        formData.choices.filter(choice => choice.trim() !== ''),
        durationInSeconds,
        formData.locationHash,
        Number(formData.votingMethod),
        ethers.BigNumber.from(formData.minVotingPower)
      );
      
      setTxHash(tx.hash);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Extract topicId from event logs
      const topicCreatedEvent = receipt.events.find(e => e.event === 'TopicCreated');
      const topicId = topicCreatedEvent ? topicCreatedEvent.args.topicId.toString() : tx.hash;
      
      // Save to Firebase
      const { uniqueCode, electionData } = await saveToFirebase(topicId);
      
      // Send email invitations if there are specific participants
    if (!formData.allowAllUsers && formData.participants.length > 0) {
      await sendElectionInvitations({
        ...electionData,
        uniqueCode
      });
    }
    
    setIsSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        choices: ['', ''],
        duration: 86400,
        locationHash: '',
        votingMethod: 0,
        minVotingPower: 1,
        pincode: '',
        type: 'college',
        creatorEmail: '',
        allowAllUsers: true,
        participants: []
      });
      
      setCsvFile(null);
      setParsedEmails([]);
      
    } catch (err) {
      console.error("Error creating topic:", err);
      setError(err.message || "Failed to create topic. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-white to-[#E4EFE7] rounded-xl shadow-lg border border-green-100 pt-28">
      <div className="flex items-center mb-8">
        <div className="bg-[#99BC85] p-3 rounded-lg shadow-md mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-[#99BC85] flex-1">Create New Election</h1>
        <div className="text-sm text-green-600 font-medium bg-[#E4EFE7] px-3 py-1 rounded-full">
          Blockchain Voting
        </div>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm animate-pulse">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}
      
      {isSuccess && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-600 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-bold text-lg text-green-800">Election created successfully!</p>
          </div>
          {txHash && (
            <div className="mt-3 bg-white p-4 rounded-md border border-green-200 flex items-center">
              <div className="mr-3 bg-green-100 p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Transaction Hash:</p>
                <a 
                  href={`https://etherscan.io/tx/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-800 truncate block font-mono"
                >
                  {txHash.substring(0, 20)}...{txHash.substring(txHash.length - 8)}
                </a>
              </div>
              <a 
                href={`https://etherscan.io/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-auto bg-green-600 text-white text-sm py-2 px-3 rounded hover:bg-green-700 transition-colors duration-200"
              >
                View on Etherscan
              </a>
            </div>
          )}
        </div>
      )}
      
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex">
        <button 
          onClick={() => setActiveTab('basic')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
            activeTab === 'basic' 
              ? 'bg-[#99BC85] text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Election Details
        </button>
        <button 
          onClick={() => setActiveTab('choices')}
          className={`flex-1 py-3 px-4 mx-2 rounded-lg font-medium transition-colors duration-200 ${
            activeTab === 'choices' 
              ? 'bg-[#99BC85] text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Voting Options
        </button>
        <button 
          onClick={() => setActiveTab('access')}
          className={`flex-1 py-3 px-4 mx-2 rounded-lg font-medium transition-colors duration-200 ${
            activeTab === 'access' 
              ? 'bg-[#99BC85] text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Access Control
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
            activeTab === 'settings' 
              ? 'bg-[#99BC85] text-white shadow-md' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Advanced Settings
        </button>
      </div>
      
      <form onSubmit={createTopic} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        {activeTab === 'basic' && (
          <>
            {/* Topic Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-1 rounded mr-2 w-6 h-6 inline-flex items-center justify-center">1</span>
                Election Name
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Enter a clear, concise name for your election"
                required
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-1 rounded mr-2 w-6 h-6 inline-flex items-center justify-center">2</span>
                Description
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Provide a detailed description about this election"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Clearly explain what participants are voting on and provide context for making informed decisions.
              </p>
            </div>
            
            {/* Election Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-1 rounded mr-2 w-6 h-6 inline-flex items-center justify-center">3</span>
                Election Type
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                required
              >
                {electionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-1 rounded mr-2 w-6 h-6 inline-flex items-center justify-center">4</span>
                Pincode / ZIP Code
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Area pincode where this election is relevant"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                This helps in organizing location-based elections and filtering.
              </p>
            </div>
            
            {/* Creator Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-1 rounded mr-2 w-6 h-6 inline-flex items-center justify-center">5</span>
                Creator Email
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="email"
                name="creatorEmail"
                value={formData.creatorEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Your email address"
                required
              />
            </div>
          </>
        )}
        
        {activeTab === 'choices' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-1 rounded mr-2 w-6 h-6 inline-flex items-center justify-center">1</span>
                Voting Options
                <span className="text-red-500 ml-1">*</span>
              </label>
              <button
                type="button"
                onClick={addChoice}
                className="inline-flex items-center px-3 py-2 border border-green-500 text-[#99BC85] bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Option
              </button>
            </div>
            
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {formData.choices.map((choice, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                  <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeChoice(index)}
                    className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {formData.choices.length < 2 && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  At least two options are required.
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'access' && (
          <div className="space-y-6">
            <div className="bg-[#E4EFE7] p-4 rounded-lg border border-blue-100 mb-6">
              <h3 className="font-semibold text-[#99BC85] mb-2">Access Control Settings</h3>
              <p className="text-sm text-green-600">
                Determine who can participate in this election. You can either allow all registered users or restrict to specific participants.
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">Participant Access</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.allowAllUsers 
                    ? "All registered users can participate" 
                    : "Only specific users can participate"}
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.allowAllUsers} 
                  onChange={handleToggleChange} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {formData.allowAllUsers ? "All Users" : "Specific Users"}
                </span>
              </label>
            </div>
            
            {!formData.allowAllUsers && (
              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Participant List (CSV)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex flex-col space-y-4">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".csv"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current.click()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload CSV File
                        </button>
                        {csvFile && (
                          <span className="ml-3 text-sm text-gray-600">
                            {csvFile.name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        CSV should contain a list of email addresses, one per row or column.
                      </p>
                    </div>
                    
                    {parsedEmails.length > 0 && (
                      <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="font-medium text-gray-800">Participant List</h5>
                          <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            {parsedEmails.length} emails
                          </span>
                        </div>
                        <ul className="space-y-1">
                          {parsedEmails.map((email, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2 text-blue-500">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              {email}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'settings' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Duration */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (in seconds)
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="60"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <div className="mt-3 bg-blue-50 p-3 rounded-lg text-blue-700 text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {Math.floor(formData.duration / 86400)} days, {Math.floor((formData.duration % 86400) / 3600)} hours, {Math.floor((formData.duration % 3600) / 60)} minutes
                </span>
              </div>
            </div>
            
            {/* Voting Method */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voting Method
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                name="votingMethod"
                value={formData.votingMethod}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {votingMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
              <div className="mt-3 bg-yellow-50 p-3 rounded-lg text-yellow-800 text-sm">
                <p className="font-medium">Method details:</p>
                <p className="mt-1">
                  {formData.votingMethod === 0 && "Voters can select only one option from the available choices."}
                  {formData.votingMethod === 1 && "Voters can select multiple options from the available choices."}
                  {formData.votingMethod === 2 && "Voters rank choices in order of preference."}
                  {formData.votingMethod === 3 && "Voters distribute their voting power across options."}
                </p>
              </div>
            </div>
            
            {/* Minimum Voting Power */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Voting Power
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="number"
                name="minVotingPower"
                value={formData.minVotingPower}
                onChange={handleInputChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Minimum token amount required to participate in voting.
              </p>
            </div>
            
            {/* Location Hash */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location Hash
              </label>
              <input
                type="text"
                name="locationHash"
                value={formData.locationHash}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional: Location hash for geo-restricted voting"
              />
              <p className="mt-2 text-sm text-gray-500">
                Leave empty for global voting access.
              </p>
            </div>
          </div>
        </>
        )}
        
        {/* Progress bar */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#99BC85] font-medium">Form completion</span>
            <span className="text-gray-600 font-medium">
              Step {activeTab === 'basic' ? '1' : activeTab === 'choices' ? '2' : activeTab === 'access' ? '3' : '4'} of 4
            </span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#99BC85] h-2 rounded-full transition-all duration-300 ease-in-out" 
              style={{ 
                width: `${activeTab === 'basic' ? 25 : activeTab === 'choices' ? 50 : activeTab === 'access' ? 75 : 100}%` 
              }}
            ></div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between pt-6">
          {activeTab !== 'basic' ? (
            <button
              type="button"
              onClick={() => setActiveTab(
                activeTab === 'choices' ? 'basic' : 
                activeTab === 'access' ? 'choices' : 'access'
              )}
              className="py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <div></div>
          )}
          
          {activeTab !== 'settings' ? (
            <button
              type="button"
              onClick={() => setActiveTab(
                activeTab === 'basic' ? 'choices' : 
                activeTab === 'choices' ? 'access' : 'settings'
              )}
              className="py-3 px-6 bg-[#99BC85] text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center"
            >
              Next
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="ml-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className={`py-3 px-6 font-medium rounded-lg transition-all duration-300 flex items-center ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Election...
                </>
              ) : (
                <>
                  Create Election
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="ml-2">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </form>
      
      {txHash && !isSuccess && (
        <div className="mt-6 p-5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 shadow-sm">
          <div className="flex items-center mb-2">
            <div className="mr-3 bg-blue-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Transaction submitted!</p>
              <p className="text-sm mt-1">
                Your transaction is being processed. This might take a few minutes.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-blue-200 mt-3">
            <div className="flex items-center">
              <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium">Processing</span>
            </div>
            <a 
              href={`https://etherscan.io/tx/${txHash}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
            >
              View on Etherscan
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTopic;