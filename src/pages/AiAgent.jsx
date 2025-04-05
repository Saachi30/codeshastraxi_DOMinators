import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { Unplug, SendHorizontal, MessageCircle } from 'lucide-react';
import abi from '../abi.json';

const MusicRightsChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);

  const CONTRACT_ADDRESS = "0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC";
  const GEMINI_API_KEY = 'AIzaSyBghO7MwnNGtqhvQBKZ27vFXkAxyltfN4M';
  const CONTRACT_ABI = abi;

  const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : null;
  const signer = provider?.getSigner();
  const contract = signer ? new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer) : null;

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (text, isBot = false) => {
    setMessages(prev => [...prev, { text, isBot, timestamp: Date.now() }]);
  };

  const connectWallet = async () => {
    try {
      if (!provider) {
        addMessage("Please install MetaMask!", true);
        return;
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = await signer.getAddress();
      setWalletAddress(address);
      setIsConnected(true);
      addMessage("Wallet connected successfully! Hi I am Sarang, How may I help you?", true);
    } catch (error) {
      addMessage("Failed to connect wallet: " + error.message, true);
    }
  };

  const processWithGemini = async (userInput) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI assistant for a blockchain voting platform.
                     Parse this user request and respond with ONLY a JSON object containing 'function' and 'parameters'.
                     DO NOT include any markdown formatting or additional text.
                     
                     Available functions: 
                     getTopicDetails, getDisputeDetails, getNFTDetails, getVoterDetails, 
                     topicCount, disputeCreditCost, disputePeriod, owner, name, symbol,
                     getApproved, isApprovedForAll, tokenURI, balanceOf, ownerOf,
                     supportsInterface, getDisputeStatus, getValidatorStatus.
                     
                     User request: "${userInput}"
                     
                     If the request doesn't match any function, respond with:
                     {"function":"chat","response":"your helpful response"}
                     
                     For functions, respond with format:
                     {"function":"getTopicDetails","parameters":{"topicId":"1"}}`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topP: 1,
            topK: 1,
            maxOutputTokens: 1000,
          },
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error('No text in API response');
      }

      // Clean the response by removing markdown formatting
      const cleanedResponse = aiResponse
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        const parsedResponse = JSON.parse(cleanedResponse);
        
        if (parsedResponse.function === 'chat') {
          addMessage(parsedResponse.response, true);
          return null;
        }
        
        if (!parsedResponse.function || !parsedResponse.parameters) {
          throw new Error('Invalid response format from AI');
        }
        
        return parsedResponse;
      } catch (parseError) {
        console.error('Failed to parse:', cleanedResponse);
        throw new Error(`AI response format error: ${parseError.message}`);
      }
    } catch (error) {
      addMessage(`⚠️ Error processing your request: ${error.message}`, true);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const executeTransaction = async (action) => {
    setIsLoading(true);
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }

      let result;
      switch (action.function) {
        case 'getTopicDetails':
          result = await contract.getTopicDetails(action.params.topicId);
          addMessage(`📋 Topic #${action.params.topicId} Details:
• Name: ${result[0]}
• Description: ${result[1]}
• Choices: ${result[2].join(', ')}
• Method: ${result[3]}
• Start Time: ${new Date(result[4] * 1000).toLocaleString()}
• End Time: ${new Date(result[5] * 1000).toLocaleString()}
• Location: ${result[6]}
• Min Voting Power: ${result[7]}
• Status: ${result[8] ? '✅ Open' : '❌ Closed'}
• Vote Counts: ${result[9].join(', ')}`, true);
          break;

        case 'getDisputeDetails':
          result = await contract.getDisputeDetails(action.params.disputeId);
          addMessage(`⚖️ Dispute #${action.params.disputeId} Details:
• Topic ID: ${result[0]}
• Reason: ${result[1]}
• Status: ${result[2]}
• Timestamp: ${new Date(result[3] * 1000).toLocaleString()}
• Resolution: ${result[4] || 'None'}`, true);
          break;

        case 'getNFTDetails':
          result = await contract.getNFTDetails(action.params.tokenId);
          addMessage(`🖼️ NFT #${action.params.tokenId} Details:
• Owner: ${result[0].slice(0, 6)}...${result[0].slice(-4)}
• Token URI: ${result[1]}`, true);
          break;

        case 'getVoterDetails':
          result = await contract.getVoterDetails(action.params.voterCommitment);
          addMessage(`👤 Voter Details:
• Dispute Credits: ${result[0]}
• Voting Power: ${result[1]}
• Remaining Credits: ${result[2]}`, true);
          break;

        case 'topicCount':
          result = await contract.topicCount();
          addMessage(`📊 Total Topics: ${result}`, true);
          break;

        case 'disputeCreditCost':
          result = await contract.disputeCreditCost();
          addMessage(`💳 Dispute Credit Cost: ${ethers.utils.formatEther(result)} ETH`, true);
          break;

        case 'disputePeriod':
          result = await contract.disputePeriod();
          addMessage(`⏳ Dispute Period: ${result} seconds (≈${Math.round(result / 3600)} hours)`, true);
          break;

        case 'owner':
          result = await contract.owner();
          addMessage(`👑 Contract Owner: ${result.slice(0, 6)}...${result.slice(-4)}`, true);
          break;

        case 'name':
          result = await contract.name();
          addMessage(`🏷️ Contract Name: ${result}`, true);
          break;

        case 'symbol':
          result = await contract.symbol();
          addMessage(`🔤 Contract Symbol: ${result}`, true);
          break;

        case 'getApproved':
          result = await contract.getApproved(action.params.tokenId);
          addMessage(`✅ Approved Address for NFT #${action.params.tokenId}: ${result.slice(0, 6)}...${result.slice(-4)}`, true);
          break;

        case 'isApprovedForAll':
          result = await contract.isApprovedForAll(action.params.owner, action.params.operator);
          addMessage(`🔍 Approval Status: ${result ? '✅ Approved' : '❌ Not Approved'} for operator ${action.params.operator.slice(0, 6)}...`, true);
          break;

        case 'tokenURI':
          result = await contract.tokenURI(action.params.tokenId);
          addMessage(`🌐 Token URI for NFT #${action.params.tokenId}: ${result}`, true);
          break;

        case 'balanceOf':
          result = await contract.balanceOf(action.params.owner);
          addMessage(`💰 NFT Balance for ${action.params.owner.slice(0, 6)}...: ${result}`, true);
          break;

        case 'ownerOf':
          result = await contract.ownerOf(action.params.tokenId);
          addMessage(`👤 Owner of NFT #${action.params.tokenId}: ${result.slice(0, 6)}...${result.slice(-4)}`, true);
          break;

        case 'supportsInterface':
          result = await contract.supportsInterface(action.params.interfaceId);
          addMessage(`🔄 Interface Support: ${result ? '✅ Supported' : '❌ Not Supported'} for interface ${action.params.interfaceId}`, true);
          break;

        case 'getDisputeStatus':
          const dispute = await contract.disputes(action.params.disputeId);
          addMessage(`⚖️ Dispute #${action.params.disputeId} Status:
• Topic ID: ${dispute.topicId}
• Reporter: ${dispute.reporter.slice(0, 6)}...
• Status: ${dispute.status}
• Timestamp: ${new Date(dispute.timestamp * 1000).toLocaleString()}
• Resolution: ${dispute.resolution || 'None'}`, true);
          break;

        case 'getValidatorStatus':
          result = await contract.validators(action.params.validator);
          addMessage(`🛡️ Validator Status for ${action.params.validator.slice(0, 6)}...: ${result ? '✅ Active' : '❌ Inactive'}`, true);
          break;

        default:
          throw new Error('Unknown function');
      }
    } catch (error) {
      addMessage(`❌ Error: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    addMessage(input, false);
    setInput('');

    if (!isConnected) {
      addMessage("🔒 Please connect your wallet first!", true);
      return;
    }

    const action = await processWithGemini(input);
    if (action) {
      await executeTransaction(action);
    }
  };

  const renderModal = () => {
    if (!showModal || !pendingAction) return null;

    const functionName = pendingAction.function
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Confirm Action</h2>
          <div className="mb-6">
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">
                {functionName}
              </h3>
              <div className="space-y-2">
                {Object.entries(pendingAction.params).map(([key, value], index) => (
                  <div key={index} className="grid grid-cols-2 gap-2">
                    <span className="text-sm font-medium text-gray-600">{key}:</span>
                    <span className="text-sm text-gray-800 break-words">
                      {typeof value === 'string' && value.startsWith('0x') 
                        ? `${value.slice(0, 6)}...${value.slice(-4)}`
                        : value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={() => executeTransaction(pendingAction)}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-colors"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>

      {isChatOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col border border-gray-200">
          <div className="flex justify-between items-center p-4 border-b bg-blue-500 text-white rounded-t-lg">
            <div>
              <h1 className="text-xl font-bold">ZKVote Assistant</h1>
              <p className="text-xs opacity-80">Ask about voting topics or disputes</p>
            </div>
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-white text-blue-500 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors text-sm flex items-center gap-1"
                disabled={isLoading}
              >
                <Unplug size={14} />
                Connect
              </button>
            ) : (
              <span className="text-xs bg-blue-600 px-3 py-1 rounded-lg">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
          </div>

          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg whitespace-pre-wrap ${
                    msg.isBot ? 'bg-white border border-gray-200' : 'bg-blue-500 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-lg bg-white border border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about topics, disputes, or voting..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                <SendHorizontal size={20} />
              </button>
            </div>
          </form>

          {renderModal()}
        </div>
      )}
    </div>
  );
};

export default MusicRightsChatbot;