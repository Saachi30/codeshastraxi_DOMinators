import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NFTManager from './NFT.jsx';

const AnalyticsDashboard = () => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [electionId, setElectionId] = useState('election-1');
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  
  // Gamification data - hardcoded for now
  const userProfile = {
    name: "Khushi Parekh",
    points: 750,
    credits: 25,
    level: 3,
    votesSubmitted: 17,
    badgesEarned: [
      { id: 1, name: "First Feedback", icon: "🎯", description: "Submitted your first feedback" },
      { id: 2, name: "Frequent Voter", icon: "🗳️", description: "Participated in 3 polls" },
      { id: 3, name: "Influencer", icon: "📢", description: "Your feedback was marked helpful 10 times" }
    ],
    availableBadges: [
      { id: 4, name: "Power Voter", icon: "⚡", description: "Vote in 5 consecutive polls", progress: 60 },
      { id: 5, name: "Analyst", icon: "📊", description: "Review 20 candidate statements", progress: 45 },
      { id: 6, name: "Community Voice", icon: "🔊", description: "Earn 1000 points", progress: 75 }
    ]
  };
  
  // Redemption options
  const redemptionOptions = [
    { id: 1, name: "5 Quadratic Voting Credits", cost: 100, icon: "🎟️" },
    { id: 2, name: "Exclusive Poll Access", cost: 250, icon: "🔓" },
    { id: 3, name: "Premium Dashboard Features", cost: 500, icon: "✨" },
    { id: 4, name: "Community Spotlight", cost: 750, icon: "🌟" }
  ];

  // Environmental impact calculations
  const environmentalImpact = {
    paperSaved: userProfile.votesSubmitted * 2, // sheets of paper
    treesSaved: (userProfile.votesSubmitted * 2) / 8333, // 8,333 sheets per tree
    carbonOffset: userProfile.votesSubmitted * 0.03, // kg of CO2
    waterSaved: userProfile.votesSubmitted * 10, // gallons
    energySaved: userProfile.votesSubmitted * 0.055 // kWh
  };

  useEffect(() => {
    const fetchSentimentData = async () => {
      try {
        const db = getFirestore();
        const q = query(collection(db, "sentiments"), where("electionId", "==", electionId));
        const querySnapshot = await getDocs(q);
        
        const sentiments = [];
        querySnapshot.forEach((doc) => {
          sentiments.push(doc.data());
        });
        
        // Calculate statistics
        const sentimentCounts = sentiments.reduce((acc, curr) => {
          acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
          return acc;
        }, {});
        
        const total = sentiments.length;
        const positivePercentage = Math.round(((sentimentCounts.positive || 0) / total) * 100);
        const neutralPercentage = Math.round(((sentimentCounts.neutral || 0) / total) * 100);
        const negativePercentage = Math.round(((sentimentCounts.negative || 0) / total) * 100);
        
        // Extract common words
        const allWords = sentiments.flatMap(s => {
          const text = s.text.toLowerCase().split(/\s+/);
          return text.filter(word => word.length > 3);
        });
        
        const wordCounts = allWords.reduce((acc, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {});
        
        const sortedWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]);
        const topWords = sortedWords.slice(0, 10).map(item => item[0]);
        
        setSentimentData({
          total,
          positivePercentage,
          neutralPercentage,
          negativePercentage,
          sentiments,
          topWords,
          sentimentCounts
        });
      } catch (error) {
        console.error("Error fetching sentiment data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSentimentData();
  }, [electionId]);

  const handleRedeemPoints = (option) => {
    // In a real app, this would make an API call
    alert(`Redeemed ${option.name} for ${option.cost} points!`);
    setShowRedeemModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!sentimentData) {
    return <div className="text-center py-10">No sentiment data available</div>;
  }

  // Prepare data for charts
  const pieChartData = [
    { name: 'Positive', value: sentimentData.sentimentCounts.positive || 0, color: '#99BC85' },
    { name: 'Neutral', value: sentimentData.sentimentCounts.neutral || 0, color: '#E4EFE7' },
    { name: 'Negative', value: sentimentData.sentimentCounts.negative || 0, color: '#FAF1E6' }
  ];

  // Prepare data for confidence scores bar chart
  const barChartData = [
    { 
      name: 'Positive', 
      value: sentimentData.sentiments.filter(s => s.sentiment === 'positive').reduce((sum, curr) => sum + (curr.confidence || 0), 0) / (sentimentData.sentimentCounts.positive || 1),
      color: '#99BC85'
    },
    { 
      name: 'Neutral', 
      value: sentimentData.sentiments.filter(s => s.sentiment === 'neutral').reduce((sum, curr) => sum + (curr.confidence || 0), 0) / (sentimentData.sentimentCounts.neutral || 1),
      color: '#E4EFE7'
    },
    { 
      name: 'Negative', 
      value: sentimentData.sentiments.filter(s => s.sentiment === 'negative').reduce((sum, curr) => sum + (curr.confidence || 0), 0) / (sentimentData.sentimentCounts.negative || 1),
      color: '#FAF1E6'
    }
  ];

  const COLORS = ['#99BC85', '#E4EFE7', '#FAF1E6'];

  return (
    <div className="min-h-screen bg-FDFAF6 p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* User Profile & Gamification Banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg shadow-lg mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Voter Sentiment Analytics</h1>
              <p className="opacity-90">Election: {electionId} | Total responses: {sentimentData.total}</p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center">
              <div className="mr-6">
                <p className="text-sm opacity-80">User</p>
                <p className="font-semibold">{userProfile.name}</p>
              </div>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-2 flex justify-center">
                    <span className="text-xl">⭐</span>
                  </div>
                  <p className="mt-1 font-semibold">{userProfile.points}</p>
                  <p className="text-xs opacity-80">Points</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-2 flex justify-center">
                    <span className="text-xl">🎟️</span>
                  </div>
                  <p className="mt-1 font-semibold">{userProfile.credits}</p>
                  <p className="text-xs opacity-80">Credits</p>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-full p-2 flex justify-center">
                    <span className="text-xl">🏆</span>
                  </div>
                  <p className="mt-1 font-semibold">{userProfile.level}</p>
                  <p className="text-xs opacity-80">Level</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Original Charts - Now in 2/3 width */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Sentiment Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="bg-green-50 p-3 rounded text-center">
                    <p className="text-2xl font-bold text-green-600">{sentimentData.positivePercentage}%</p>
                    <p className="text-sm text-green-700">Positive</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded text-center">
                    <p className="text-2xl font-bold text-green-600">{sentimentData.neutralPercentage}%</p>
                    <p className="text-sm text-green-700">Neutral</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded text-center">
                    <p className="text-2xl font-bold text-green-600">{sentimentData.negativePercentage}%</p>
                    <p className="text-sm text-green-700">Negative</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Confidence Scores</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        domain={[0, 1]}
                        tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                      />
                      <Tooltip 
                        formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Confidence']}
                      />
                      <Legend />
                      <Bar dataKey="value" name="Confidence">
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Higher confidence scores indicate stronger sentiment detection by the model.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Top Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {sentimentData.topWords.map((word, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Recent Feedback</h3>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {sentimentData.sentiments.slice(0, 5).map((feedback, index) => (
                    <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center mb-1">
                        <span className={`px-2 py-1 text-xs rounded ${
                          feedback.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                          feedback.sentiment === 'neutral' ? 'bg-green-100 text-green-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {feedback.sentiment}
                        </span>
                        <span className="ml-2 text-xs text-gray-500">
                          Confidence: {Math.round(feedback.confidence * 100)}%
                        </span>
                      </div>
                      <p className="text-gray-700">{feedback.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Gamification Panel - 1/3 width */}
          <div className="space-y-6">
            {/* Badges Showcase */}
            {/* <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Your Badges</h3>
                <span className="text-sm text-green-600">{userProfile.badgesEarned.length}/{userProfile.badgesEarned.length + userProfile.availableBadges.length}</span>
              </div> */}
              {/* <div className="grid grid-cols-3 gap-4 mb-6">
                {userProfile.badgesEarned.map(badge => (
                  <div key={badge.id} className="text-center group relative">
                    <div className="bg-green-100 w-full aspect-square rounded-lg flex items-center justify-center text-3xl">
                      {badge.icon}
                    </div>
                    <p className="text-xs mt-2 font-medium">{badge.name}</p>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-1 left-0 right-0 bg-gray-800 text-white p-2 rounded text-xs z-10 transition-opacity">
                      {badge.description}
                    </div>
                  </div>
                ))}
              </div> */}
              
              {/* <h4 className="text-sm font-medium text-gray-700 mb-3">Available Badges</h4>
              <div className="space-y-3">
                {userProfile.availableBadges.map(badge => (
                  <div key={badge.id} className="bg-FAF1E6 p-3 rounded flex items-center">
                    <div className="bg-E4EFE7 h-10 w-10 rounded-full flex items-center justify-center text-xl mr-3 flex-shrink-0">
                      {badge.icon}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium">{badge.name}</p>
                      <p className="text-xs text-gray-500">{badge.description}</p>
                      <div className="mt-1 bg-gray-200 h-2 rounded-full">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${badge.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-xs text-green-600 ml-2">{badge.progress}%</span>
                  </div>
                ))}
              </div> */}
            {/* </div> */}
            
            {/* Points & Redemption */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Rewards Center</h3>
              <div className="bg-gradient-to-r from-E4EFE7 to-FAF1E6 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Your Points</span>
                  <span className="font-bold text-green-700">{userProfile.points}</span>
                </div>
                <div className="text-sm text-gray-600">Earn points by providing feedback, voting in polls, and engaging with election content.</div>
              </div>
              
              <button 
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                onClick={() => setShowRedeemModal(true)}
              >
                Redeem Points
              </button>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Recent Activity</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Poll Response Submitted</span>
                    <span className="text-green-600">+25 points</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Feedback marked helpful</span>
                    <span className="text-green-600">+10 points</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Redeemed voting credits</span>
                    <span className="text-red-600">-100 points</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quadratic Voting Credits */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Voting Credits</h3>
                <div className="flex items-center">
                  <span className="text-xl mr-1">🎟️</span>
                  <span className="font-bold text-green-700">{userProfile.credits}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Use credits for quadratic voting on key issues. More credits spent on a single issue means your vote counts more!
              </p>
              <div className="bg-E4EFE7 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Quadratic Voting Power</h4>
                <div className="grid grid-cols-5 gap-2">
                  <div className="text-center">
                    <div className="bg-green-100 p-2 rounded mb-1">1 credit</div>
                    <div className="text-xs font-medium">1× vote</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-200 p-2 rounded mb-1">4 credits</div>
                    <div className="text-xs font-medium">2× votes</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-300 p-2 rounded mb-1">9 credits</div>
                    <div className="text-xs font-medium">3× votes</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-400 p-2 rounded mb-1">16 credits</div>
                    <div className="text-xs font-medium">4× votes</div>
                  </div>
                  <div className="text-center">
                    <div className="bg-green-500 p-2 rounded mb-1 text-white">25 credits</div>
                    <div className="text-xs font-medium">5× votes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Environmental Impact Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-green-700">Your Environmental Impact</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-FAF1E6 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🗳️</div>
              <div className="text-2xl font-bold text-green-700">{userProfile.votesSubmitted}</div>
              <div className="text-sm text-gray-600">Online Votes Cast</div>
            </div>
            
            <div className="bg-E4EFE7 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">📄</div>
              <div className="text-2xl font-bold text-green-700">{environmentalImpact.paperSaved}</div>
              <div className="text-sm text-gray-600">Sheets of Paper Saved</div>
            </div>
            
            <div className="bg-FAF1E6 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">🌳</div>
              <div className="text-2xl font-bold text-green-700">{environmentalImpact.treesSaved.toFixed(3)}</div>
              <div className="text-sm text-gray-600">Trees Preserved</div>
            </div>
            
            <div className="bg-E4EFE7 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">💧</div>
              <div className="text-2xl font-bold text-green-700">{environmentalImpact.waterSaved}</div>
              <div className="text-sm text-gray-600">Gallons of Water Saved</div>
            </div>
            
            <div className="bg-FAF1E6 p-4 rounded-lg text-center">
              <div className="text-3xl mb-2">♻️</div>
              <div className="text-2xl font-bold text-green-700">{environmentalImpact.carbonOffset.toFixed(1)}</div>
              <div className="text-sm text-gray-600">kg CO₂ Emissions Prevented</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-99BC85 rounded-lg">
            <div className="flex items-center">
              {/* <div className="text-4xl mr-4">🌎</div> */}
              <div>
                <h4 className="font-bold text-white">Your voting makes a difference!</h4>
                <p className="text-white">By voting online, you've helped save {environmentalImpact.paperSaved} sheets of paper, which is equivalent to saving {environmentalImpact.treesSaved.toFixed(3)} trees. This has prevented {environmentalImpact.carbonOffset.toFixed(1)} kg of CO₂ emissions and conserved {environmentalImpact.waterSaved} gallons of water.</p>
                <p className="mt-2 text-white text-sm">Digital voting reduces transportation emissions, paper usage, and energy consumption of traditional polling stations.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Share Your Environmental Impact
            </button>
          </div>
        </div>
        
        <NFTManager/>
      </div>
      
      {/* Redeem Points Modal */}
      {showRedeemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Redeem Points</h3>
              <button 
                onClick={() => setShowRedeemModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600">Available Points: <span className="font-semibold text-green-600">{userProfile.points}</span></p>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {redemptionOptions.map(option => (
                <div 
                  key={option.id} 
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{option.icon}</span>
                    <div>
                      <p className="font-medium">{option.name}</p>
                      <p className="text-xs text-gray-500">Cost: {option.cost} points</p>
                    </div>
                  </div>
                  <button 
                    className={`px-3 py-1 rounded ${userProfile.points >= option.cost 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    onClick={() => userProfile.points >= option.cost && handleRedeemPoints(option)}
                    disabled={userProfile.points < option.cost}
                  >
                    Redeem
                  </button>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowRedeemModal(false)}
              className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
     
    </div>
  );
};

export default AnalyticsDashboard;