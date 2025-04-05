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
  const chatRef = useRef(null);

  const CA = "0x12b4166e7C81dF1b47722746bD511Fca44dcb7EC"; // ZKVote contract address
  const GEMINI_API_KEY = 'AIzaSyCFKswhga9q7KF-qZ4ZzwcTxZRtrg6sb7Y';

  const CONTRACT_ABI = abi;

  const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : null;
  const signer = provider?.getSigner();
  const contract = CA && signer ? new ethers.Contract(CA, CONTRACT_ABI, signer) : null;

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
      addMessage("Wallet connected successfully! Hi I am ZKVote Assistant, How may I help you with voting or disputes?", true);
    } catch (error) {
      addMessage("Failed to connect wallet: " + error.message, true);
    }
  };

  const processWithGemini = async (userInput) => {
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an AI assistant for a ZKVote platform that handles voting and dispute resolution.
                     Parse this user request and respond with a JSON object containing 'function' and 'parameters'.
                     Available functions: getTopicDetails, getDisputeDetails, getNFTDetails, getVoterDetails, 
                     topicCount, disputeCreditCost, disputePeriod, owner, name, symbol.
                     Give answer in the language of the user.
                     
                     User request: "${userInput}"
                     
                     If the request doesn't match any function, respond with:
                     {
                       "function": "chat",
                       "response": "your helpful response about ZKVote platform"
                     }
                     
                     For functions, respond with format:
                     {
                       "function": "getTopicDetails",
                       "parameters": {
                         "topicId": "1"
                       }
                     }`
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
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Details:', errorData);
        throw new Error(`API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Unexpected API response structure:', data);
        throw new Error('Invalid response structure from Gemini API');
      }

      const aiResponse = data.candidates[0].content.parts[0].text;

      try {
        const parsedResponse = JSON.parse(aiResponse.trim());
        
        if (parsedResponse.function === 'chat') {
          addMessage(parsedResponse.response, true);
          return null;
        }
        
        return processAIResponse(parsedResponse, userInput);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error(`Failed to parse AI response: ${parseError.message}`);
      }
    } catch (error) {
      console.error('AI Processing error:', error);
      addMessage(`Error: ${error.message}. Please try again.`, true);
      return null;
    }
  };

  const processAIResponse = (aiResponse, originalInput) => {
    if (!aiResponse.function || !aiResponse.parameters) {
      throw new Error('Invalid AI response format');
    }

    return {
      function: aiResponse.function,
      params: aiResponse.parameters
    };
  };

  const executeTransaction = async (action) => {
    try {
      let result;
      switch (action.function) {
        case 'getTopicDetails':
          result = await contract.getTopicDetails(action.params.topicId);
          addMessage(`Topic Details:
            Name: ${result[0]}
            Description: ${result[1]}
            Choices: ${result[2].join(', ')}
            Method: ${result[3]}
            Start Time: ${new Date(result[4] * 1000).toLocaleString()}
            End Time: ${new Date(result[5] * 1000).toLocaleString()}
            Location: ${result[6]}
            Min Voting Power: ${result[7]}
            Is Voting Open: ${result[8] ? 'Yes' : 'No'}
            Vote Counts: ${result[9].join(', ')}`, true);
          break;
        
        case 'getDisputeDetails':
          result = await contract.getDisputeDetails(action.params.disputeId);
          addMessage(`Dispute Details:
            Topic ID: ${result[0]}
            Reason: ${result[1]}
            Status: ${result[2]}
            Timestamp: ${new Date(result[3] * 1000).toLocaleString()}
            Resolution: ${result[4] || 'None'}`, true);
          break;
        
        case 'getNFTDetails':
          result = await contract.getNFTDetails(action.params.tokenId);
          addMessage(`NFT Details:
            Owner: ${result[0]}
            Token URI: ${result[1]}`, true);
          break;
        
        case 'getVoterDetails':
          result = await contract.getVoterDetails(action.params.voterCommitment);
          addMessage(`Voter Details:
            Dispute Credits: ${result[0]}
            Voting Power: ${result[1]}
            Remaining Credits: ${result[2]}`, true);
          break;
        
        case 'topicCount':
          result = await contract.topicCount();
          addMessage(`Total Topics: ${result}`, true);
          break;
        
        case 'disputeCreditCost':
          result = await contract.disputeCreditCost();
          addMessage(`Dispute Credit Cost: ${result}`, true);
          break;
        
        case 'disputePeriod':
          result = await contract.disputePeriod();
          addMessage(`Dispute Period: ${result} seconds`, true);
          break;
        
        case 'owner':
          result = await contract.owner();
          addMessage(`Contract Owner: ${result}`, true);
          break;
        
        case 'name':
          result = await contract.name();
          addMessage(`Contract Name: ${result}`, true);
          break;
        
        case 'symbol':
          result = await contract.symbol();
          addMessage(`Contract Symbol: ${result}`, true);
          break;
        
        default:
          throw new Error('Unknown function');
      }
    } catch (error) {
      addMessage("Query failed: " + error.message, true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    addMessage(input, false);
    setInput('');

    if (!isConnected) {
      addMessage("Please connect your wallet first!", true);
      return;
    }

    const action = await processWithGemini(input);
    if (action) {
      executeTransaction(action);
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-colors"
      >
        <MessageCircle size={24} />
      </button>

      {isChatOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[500px] bg-white rounded-lg shadow-lg flex flex-col">
          <div className="mb-4 flex justify-between items-center p-4 border-b">
            <h1 className="text-2xl font-bold text-gray-800">ZKVote Assistant</h1>
            <h4 className="text-sm font-bold text-gray-500">AI Agent</h4>
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Unplug />
              </button>
            ) : (
              <span className="text-sm text-gray-600 bg-gray-200 px-4 py-2 rounded-lg">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </span>
            )}
          </div>

          <div 
            ref={chatRef}
            className="flex-1 overflow-y-auto mb-4 p-4 space-y-4"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isBot ? 'bg-gray-100' : 'bg-blue-500 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about topics, disputes, or voting..."
              className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <SendHorizontal />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ZKVoteChatbot;