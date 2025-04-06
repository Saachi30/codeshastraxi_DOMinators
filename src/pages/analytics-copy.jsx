
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AnalyticsDashboard = () => {
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [electionId, setElectionId] = useState('election-1');

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!sentimentData) {
    return <div className="text-center py-10">No sentiment data available</div>;
  }

  // Prepare data for charts
  const pieChartData = [
    { name: 'Positive', value: sentimentData.sentimentCounts.positive || 0, color: '#4ade80' },
    { name: 'Neutral', value: sentimentData.sentimentCounts.neutral || 0, color: '#fbbf24' },
    { name: 'Negative', value: sentimentData.sentimentCounts.negative || 0, color: '#f87171' }
  ];

  // Prepare data for confidence scores bar chart
  const barChartData = [
    { 
      name: 'Positive', 
      value: sentimentData.sentiments.filter(s => s.sentiment === 'positive').reduce((sum, curr) => sum + (curr.confidence || 0), 0) / (sentimentData.sentimentCounts.positive || 1),
      color: '#4ade80'
    },
    { 
      name: 'Neutral', 
      value: sentimentData.sentiments.filter(s => s.sentiment === 'neutral').reduce((sum, curr) => sum + (curr.confidence || 0), 0) / (sentimentData.sentimentCounts.neutral || 1),
      color: '#fbbf24'
    },
    { 
      name: 'Negative', 
      value: sentimentData.sentiments.filter(s => s.sentiment === 'negative').reduce((sum, curr) => sum + (curr.confidence || 0), 0) / (sentimentData.sentimentCounts.negative || 1),
      color: '#f87171'
    }
  ];

  const COLORS = ['#4ade80', '#fbbf24', '#f87171'];

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Voter Sentiment Analytics</h1>
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Election: {electionId}</h2>
          <p className="text-gray-600">Total feedback responses: {sentimentData.total}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
              <div className="bg-yellow-50 p-3 rounded text-center">
                <p className="text-2xl font-bold text-yellow-600">{sentimentData.neutralPercentage}%</p>
                <p className="text-sm text-yellow-700">Neutral</p>
              </div>
              <div className="bg-red-50 p-3 rounded text-center">
                <p className="text-2xl font-bold text-red-600">{sentimentData.negativePercentage}%</p>
                <p className="text-sm text-red-700">Negative</p>
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Top Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {sentimentData.topWords.map((word, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
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
                      feedback.sentiment === 'neutral' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
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
    </div>
  );
};

export default AnalyticsDashboard;