import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { Unplug, SendHorizontal, MessageCircle } from 'lucide-react';
import abi from '../abi.json';

const ZKVoteChatbot = () => {
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
      addMessage("Wallet connected successfully! Hi I am Sarang, How may I help you with the ZKVote platform?", true);
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
              text: `You are an AI assistant for a ZKVote blockchain voting platform.
                     Parse this user request and respond with ONLY a JSON object containing 'function' and 'parameters'.
                     DO NOT include any markdown formatting or additional text.
                     
                     Available view functions (read-only): 
                     getTopicDetails, getDisputeDetails, getNFTDetails, getVoterDetails, 
                     topicCount, disputeCreditCost, disputePeriod, owner, name, symbol,
                     getApproved, isApprovedForAll, tokenURI, balanceOf, ownerOf,
                     supportsInterface, disputes, validators, getDisputeStatus, getValidatorStatus.
                     
                     User request: "${userInput}"
                     
                     If the request doesn't match any function, respond with:
                     {"function":"chat","response":"your helpful response"}
                     
                     For functions, respond with format:
                     {"function":"getTopicDetails","parameters":{"topicId":"1"}}
                     
                     For disputes mapping query:
                     {"function":"getDisputeStatus","parameters":{"disputeId":"1"}}
                     
                     For validators mapping query:
                     {"function":"getValidatorStatus","parameters":{"validator":"0x..."}}`
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
          result = await contract.getTopicDetails(action.parameters.topicId);
          addMessage(`📋 Topic #${action.parameters.topicId} Details:
• Name: ${result[0]}
• Description: ${result[1]}
• Choices: ${result[2].join(', ')}
• Method: ${result[3] === 0 ? 'Quadratic Voting' : result[3] === 1 ? 'Ranked Choice' : 'Simple Majority'}
• Start Time: ${new Date(result[4] * 1000).toLocaleString()}
• End Time: ${new Date(result[5] * 1000).toLocaleString()}
• Location Hash: ${result[6]}
• Min Voting Power: ${result[7]}
• Status: ${result[8] ? '✅ Open' : '❌ Closed'}
• Vote Counts: ${result[9].join(', ')}`, true);
          break;

        case 'getDisputeDetails':
          result = await contract.getDisputeDetails(action.parameters.disputeId);
          addMessage(`⚖️ Dispute #${action.parameters.disputeId} Details:
• Topic ID: ${result[0]}
• Reason: ${result[1]}
• Status: ${getDisputeStatusText(result[2])}
• Timestamp: ${new Date(result[3] * 1000).toLocaleString()}
• Resolution: ${result[4] || 'None'}`, true);
          break;

        case 'getNFTDetails':
          result = await contract.getNFTDetails(action.parameters.tokenId);
          addMessage(`🖼️ NFT #${action.parameters.tokenId} Details:
• Owner: ${formatAddress(result[0])}
• Token URI: ${result[1]}`, true);
          break;

        case 'getVoterDetails':
          result = await contract.getVoterDetails(action.parameters.voterCommitment);
          addMessage(`👤 Voter Details for commitment ${action.parameters.voterCommitment}:
• Dispute Credits: ${result[0]}
• Voting Power: ${result[1]}
• Remaining Credits: ${result[2]}`, true);
          break;

        case 'topicCount':
          result = await contract.topicCount();
          addMessage(`📊 Total Topics Created: ${result}`, true);
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
          addMessage(`👑 Contract Owner: ${formatAddress(result)}`, true);
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
          result = await contract.getApproved(action.parameters.tokenId);
          addMessage(`✅ Approved Address for NFT #${action.parameters.tokenId}: ${formatAddress(result)}`, true);
          break;

        case 'isApprovedForAll':
          result = await contract.isApprovedForAll(action.parameters.owner, action.parameters.operator);
          addMessage(`🔍 Approval Status: ${result ? '✅ Approved' : '❌ Not Approved'} for operator ${formatAddress(action.parameters.operator)}`, true);
          break;

        case 'tokenURI':
          result = await contract.tokenURI(action.parameters.tokenId);
          addMessage(`🌐 Token URI for NFT #${action.parameters.tokenId}: ${result}`, true);
          break;

        case 'balanceOf':
          result = await contract.balanceOf(action.parameters.owner);
          addMessage(`💰 NFT Balance for ${formatAddress(action.parameters.owner)}: ${result}`, true);
          break;

        case 'ownerOf':
          result = await contract.ownerOf(action.parameters.tokenId);
          addMessage(`👤 Owner of NFT #${action.parameters.tokenId}: ${formatAddress(result)}`, true);
          break;

        case 'supportsInterface':
          result = await contract.supportsInterface(action.parameters.interfaceId);
          addMessage(`🔄 Interface Support: ${result ? '✅ Supported' : '❌ Not Supported'} for interface ${action.parameters.interfaceId}`, true);
          break;

        case 'getDisputeStatus':
          const dispute = await contract.disputes(action.parameters.disputeId);
          addMessage(`⚖️ Dispute #${action.parameters.disputeId} Status:
• Topic ID: ${dispute.topicId}
• Reporter: ${formatAddress(dispute.reporter)}
• Status: ${getDisputeStatusText(dispute.status)}
• Timestamp: ${new Date(dispute.timestamp * 1000).toLocaleString()}
• Resolution: ${dispute.resolution || 'None'}`, true);
          break;

        case 'getValidatorStatus':
          result = await contract.validators(action.parameters.validator);
          addMessage(`🛡️ Validator Status for ${formatAddress(action.parameters.validator)}: ${result ? '✅ Active' : '❌ Inactive'}`, true);
          break;

        default:
          throw new Error('Unknown function');
      }
    } catch (error) {
      addMessage(`❌ Error executing ${action.function}: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDisputeStatusText = (status) => {
    switch(status) {
      case 0: return 'Pending';
      case 1: return 'Accepted';
      case 2: return 'Rejected';
      case 3: return 'Resolved';
      default: return 'Unknown';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    addMessage(input, false);
    setInput('');

    if (!isConnected) {
      addMessage("🔒 Please connect your wallet first to interact with the contract!", true);
      return;
    }

    const action = await processWithGemini(input);
    if (action) {
      await executeTransaction(action);
    }
  };

  
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-xl transition-all transform hover:scale-105"
        aria-label="Open chat"
      >
        <MessageCircle size={24} className="stroke-current" />
      </button>

      {isChatOpen && (
        <div className="absolute bottom-20 right-0 w-96 h-[500px] bg-gray-900 rounded-xl shadow-2xl flex flex-col border border-gray-700 overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-indigo-700 text-white">
            <div>
              <h1 className="text-xl font-bold">ZKVote Assistant</h1>
              <p className="text-xs text-indigo-200">Ask about voting topics, disputes, or NFTs</p>
            </div>
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-white text-indigo-700 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors text-sm flex items-center gap-1 font-medium"
                disabled={isLoading}
              >
                <Unplug size={14} className="stroke-current" />
                Connect
              </button>
            ) : (
              <span className="text-xs bg-indigo-800 px-3 py-1 rounded-lg font-medium">
                {formatAddress(walletAddress)}
              </span>
            )}
          </div>

          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-lg whitespace-pre-wrap ${
                    msg.isBot ? 'bg-gray-700 text-gray-100' : 'bg-indigo-600 text-white'
                  } ${msg.isBot ? 'rounded-tl-none' : 'rounded-tr-none'}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-3 rounded-lg bg-gray-700 text-gray-100 rounded-tl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-700 bg-gray-900">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about topics, disputes, NFTs, or voting..."
                className="flex-1 p-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-500 disabled:opacity-70"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                <SendHorizontal size={20} className="stroke-current" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ZKVoteChatbot;
