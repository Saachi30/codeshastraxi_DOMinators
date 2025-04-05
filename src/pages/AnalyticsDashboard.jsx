// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { 
//   FaChartBar, FaMapMarkedAlt, FaUsers, FaRegClock, 
//   FaExclamationTriangle, FaArrowUp, FaArrowDown, FaThumbsUp 
// } from 'react-icons/fa';
// import { 
//   LineChart, Line, BarChart, Bar, PieChart, Pie, 
//   Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
// } from 'recharts';

// const AnalyticsDashboard = () => {
//   const [activeTab, setActiveTab] = useState('overview');
//   const [realTimeData, setRealTimeData] = useState({
//     totalVotes: 0,
//     participation: 0,
//     positiveVotes: 0,
//     regions: {}
//   });
  
//   // Mock data for charts
//   const votingTrends = [
//     { time: '08:00', votes: 245 },
//     { time: '10:00', votes: 388 },
//     { time: '12:00', votes: 470 },
//     { time: '14:00', votes: 650 },
//     { time: '16:00', votes: 830 },
//     { time: '18:00', votes: 1200 },
//     { time: '20:00', votes: 1500 },
//   ];
  
//   const sentimentData = [
//     { name: 'Strongly Positive', value: 35 },
//     { name: 'Positive', value: 40 },
//     { name: 'Neutral', value: 15 },
//     { name: 'Negative', value: 7 },
//     { name: 'Strongly Negative', value: 3 },
//   ];
  
//   const votingMethodData = [
//     { method: 'Ranked Choice', count: 560 },
//     { method: 'Approval', count: 420 },
//     { method: 'Quadratic', count: 380 },
//     { method: 'Standard', count: 240 },
//   ];

//   const regionData = [
//     { region: 'North', participation: 78 },
//     { region: 'South', participation: 62 },
//     { region: 'East', participation: 84 },
//     { region: 'West', participation: 71 },
//     { region: 'Central', participation: 90 },
//   ];
  
//   const SENTIMENT_COLORS = ['#4caf50', '#8bc34a', '#ffeb3b', '#ff9800', '#f44336'];
  
//   // Simulate real-time data updates
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setRealTimeData(prevData => ({
//         totalVotes: prevData.totalVotes + Math.floor(Math.random() * 10),
//         participation: Math.min(100, prevData.participation + Math.random() * 0.5),
//         positiveVotes: prevData.positiveVotes + Math.floor(Math.random() * 7),
//         regions: {
//           ...prevData.regions,
//           // Update random region
//           [['North', 'South', 'East', 'West', 'Central'][Math.floor(Math.random() * 5)]]: 
//             Math.min(100, (prevData.regions[['North', 'South', 'East', 'West', 'Central'][Math.floor(Math.random() * 5)]] || 50) + Math.random() * 1)
//         }
//       }));
//     }, 5000);
    
//     // Initial data
//     setRealTimeData({
//       totalVotes: 1600,
//       participation: 64.8,
//       positiveVotes: 1100,
//       regions: {
//         'North': 75,
//         'South': 62,
//         'East': 80,
//         'West': 69,
//         'Central': 86
//       }
//     });
    
//     return () => clearInterval(interval);
//   }, []);

//   // List of detected anomalies (mock data)
//   const anomalies = [
//     { id: 1, region: 'West Ward', type: 'Unusual Voting Pattern', severity: 'Medium', time: '15 min ago' },
//     { id: 2, region: 'North District', type: 'Multiple Authentication Failures', severity: 'High', time: '32 min ago' },
//     { id: 3, region: 'Central Region', type: 'Geo-fencing Breach', severity: 'Low', time: '1 hour ago' },
//   ];

//   // Percentage of votes on different issues (mock data)
//   const issueData = [
//     { issue: 'Environmental', percentage: 35 },
//     { issue: 'Community Dev', percentage: 25 },
//     { issue: 'Infrastructure', percentage: 20 },
//     { issue: 'Education', percentage: 15 },
//     { issue: 'Other', percentage: 5 },
//   ];

//   const renderStat = (label, value, icon, change, color) => (
//     <div className="bg-white rounded-xl shadow-md p-4">
//       <div className="flex justify-between items-start">
//         <div>
//           <p className="text-gray-500 text-sm">{label}</p>
//           <p className="text-2xl font-bold mt-1">{value}</p>
//           {change && (
//             <p className={`flex items-center text-sm ${color === 'green' ? 'text-green-500' : 'text-red-500'}`}>
//               {color === 'green' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
//               {change}
//             </p>
//           )}
//         </div>
//         <div className={`p-3 rounded-lg ${color === 'green' ? 'bg-green-100' : color === 'blue' ? 'bg-blue-100' : color === 'purple' ? 'bg-purple-100' : 'bg-red-100'}`}>
//           {icon}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-indigo-900 text-white">
//         <div className="container mx-auto px-4 py-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
//               <p className="text-indigo-200">Community Development Initiative</p>
//             </div>
//             <div className="flex items-center">
//               <div className="mr-6">
//                 <div className="text-sm text-indigo-200">Election Status</div>
//                 <div className="flex items-center">
//                   <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
//                   <span className="font-medium">Active (8h remaining)</span>
//                 </div>
//               </div>
//               <Link to="/" className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition">
//                 Exit Dashboard
//               </Link>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Tab Navigation */}
//       <div className="bg-white shadow">
//         <div className="container mx-auto px-4">
//           <div className="flex overflow-x-auto">
//             <button 
//               onClick={() => setActiveTab('overview')} 
//               className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
//             >
//               Overview
//             </button>
//             <button 
//               onClick={() => setActiveTab('sentiment')} 
//               className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'sentiment' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
//             >
//               Sentiment Analysis
//             </button>
//             <button 
//               onClick={() => setActiveTab('geographic')} 
//               className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'geographic' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
//             >
//               Geographic Distribution
//             </button>
//             <button 
//               onClick={() => setActiveTab('anomalies')} 
//               className={`px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'anomalies' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
//             >
//               Anomalies
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Dashboard Content */}
//       <div className="container mx-auto px-4 py-8">
//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {renderStat('Total Votes Cast', realTimeData.totalVotes.toLocaleString(), <FaChartBar className="text-blue-500" />, '+8.2% vs target', 'blue')}
//           {renderStat('Participation Rate', `${realTimeData.participation.toFixed(1)}%`, <FaUsers className="text-green-500" />, '+2.4% since yesterday', 'green')}
//           {renderStat('Positive Sentiment', `${Math.round((realTimeData.positiveVotes / realTimeData.totalVotes) * 100)}%`, <FaThumbsUp className="text-purple-500" />, '+5.7% from baseline', 'purple')}
//           {renderStat('Anomalies Detected', anomalies.length, <FaExclamationTriangle className="text-red-500" />, null, 'red')}
//         </div>

//         {/* Tab Content */}
//         {activeTab === 'overview' && (
//           <div className="space-y-6">
//             {/* Voting Trends Chart */}
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h2 className="text-lg font-bold mb-4">Voting Activity Trends</h2>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={votingTrends}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                   <XAxis dataKey="time" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line type="monotone" dataKey="votes" stroke="#6366f1" strokeWidth={2} activeDot={{ r: 8 }} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Method Distribution & Issue Breakdown */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white rounded-xl shadow-md p-6">
//                 <h2 className="text-lg font-bold mb-4">Voting Method Distribution</h2>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={votingMethodData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                     <XAxis dataKey="method" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="#818cf8" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>

//               <div className="bg-white rounded-xl shadow-md p-6">
//                 <h2 className="text-lg font-bold mb-4">Issues Breakdown</h2>
//                 <div className="grid grid-cols-2 gap-4">
//                   <ResponsiveContainer width="100%" height={220}>
//                     <PieChart>
//                       <Pie
//                         data={issueData}
//                         dataKey="percentage"
//                         nameKey="issue"
//                         cx="50%"
//                         cy="50%"
//                         outerRadius={80}
//                         fill="#8884d8"
//                         labelLine={false}
//                         label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                       >
//                         {issueData.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 60%)`} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                     </PieChart>
//                   </ResponsiveContainer>
//                   <div className="flex flex-col justify-center">
//                     {issueData.map((item, index) => (
//                       <div key={index} className="flex items-center mb-2">
//                         <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}></div>
//                         <div className="text-sm">
//                           <span className="font-medium">{item.issue}:</span> {item.percentage}%
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Recent Activity Log */}
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h2 className="text-lg font-bold mb-4">Recent Activities</h2>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left">Time</th>
//                       <th className="px-6 py-3 text-left">Activity</th>
//                       <th className="px-6 py-3 text-left">Region</th>
//                       <th className="px-6 py-3 text-left">Method</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {[...Array(5)].map((_, i) => (
//                       <tr key={i} className="border-b hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                           {new Date(Date.now() - i * 3 * 60000).toLocaleTimeString()}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {['Vote cast', 'Authentication', 'NFT Badge claimed', 'Dispute flagged', 'Vote verified'][i]}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {['North', 'South', 'East', 'West', 'Central'][i]}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {['Ranked Choice', 'Quadratic', 'Approval', 'Standard', 'Ranked Choice'][i]}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'sentiment' && (
//           <div className="space-y-6">
//             {/* Sentiment Distribution */}
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h2 className="text-lg font-bold mb-4">Sentiment Distribution</h2>
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={sentimentData}
//                       dataKey="value"
//                       nameKey="name"
//                       cx="50%"
//                       cy="50%"
//                       outerRadius={100}
//                       fill="#8884d8"
//                     >
//                       {sentimentData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <div className="flex flex-col justify-center">
//                   <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
//                   <p className="text-gray-600 mb-4">
//                     Based on NLP analysis of voting patterns and comments, the community sentiment is predominantly positive (75%) regarding the current initiatives.
//                   </p>
//                   <div className="space-y-3">
//                     <div>
//                       <div className="flex justify-between mb-1">
//                         <span className="text-sm font-medium">Overall Sentiment Score</span>
//                         <span className="text-sm font-medium">7.8/10</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div className="bg-green-500 h-2 rounded-full" style={{ width: '78%' }}></div>
//                       </div>
//                     </div>
//                     <div>
//                       <div className="flex justify-between mb-1">
//                         <span className="text-sm font-medium">Confidence Level</span>
//                         <span className="text-sm font-medium">92%</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Key Topics & Comments */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white rounded-xl shadow-md p-6">
//                 <h2 className="text-lg font-bold mb-4">Top Keywords</h2>
//                 <div className="flex flex-wrap gap-2">
//                   {["sustainability", "community", "progress", "transparency", "innovation", "accessibility", "inclusion", "future", "participation", "accountability", "development", "growth"].map((keyword, i) => (
//                     <span 
//                       key={i} 
//                       className="px-3 py-1 rounded-full text-sm" 
//                       style={{ 
//                         fontSize: `${1 + (Math.random() * 0.5)}rem`,
//                         backgroundColor: `hsl(${(i * 30) % 360}, 70%, 90%)`,
//                         color: `hsl(${(i * 30) % 360}, 70%, 30%)`
//                       }}
//                     >
//                       {keyword}
//                     </span>
//                   ))}
//                 </div>
//               </div>

//               <div className="bg-white rounded-xl shadow-md p-6">
//                 <h2 className="text-lg font-bold mb-4">Notable Comments</h2>
//                 <div className="space-y-4">
//                   {[
//                     "The new community center proposal addresses many of our neighborhood needs.",
//                     "I'm concerned about the environmental impact of the development plan.",
//                     "This is the most transparent process I've seen in our district elections."
//                   ].map((comment, i) => (
//                     <div key={i} className="border-l-4 border-indigo-500 pl-4 py-1">
//                       <p className="text-gray-600 italic">{comment}</p>
//                       <p className="text-sm text-gray-500 mt-1">- Anonymous Voter</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'geographic' && (
//           <div className="space-y-6">
//             {/* Geographic Heatmap (Mock) */}
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h2 className="text-lg font-bold mb-4">Geographic Participation Distribution</h2>
//               <div className="aspect-video bg-indigo-50 rounded-lg flex items-center justify-center">
//                 <div className="text-center text-gray-500">
//                   <FaMapMarkedAlt className="mx-auto text-6xl mb-4 text-indigo-300" />
//                   <p>Interactive map visualization would appear here</p>
//                   <p className="text-sm mt-2">Shows heat map of voter density and participation</p>
//                 </div>
//               </div>
//             </div>

//             {/* Regional Stats */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white rounded-xl shadow-md p-6">
//                 <h2 className="text-lg font-bold mb-4">Regional Participation Rate</h2>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <BarChart data={regionData}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                     <XAxis dataKey="region" />
//                     <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
//                     <Tooltip formatter={(value) => [`${value}%`, 'Participation']} />
//                     <Bar dataKey="participation" fill="#6366f1">
//                       {regionData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.participation > 75 ? '#4ade80' : entry.participation > 50 ? '#6366f1' : '#f87171'} />
//                       ))}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>

//               <div className="bg-white rounded-xl shadow-md p-6">
//                 <h2 className="text-lg font-bold mb-4">Regional Insights</h2>
//                 <div className="space-y-4">
//                   <div className="p-4 rounded-lg bg-green-50 border border-green-200">
//                     <h3 className="font-medium text-green-800">High Participation Areas</h3>
//                     <p className="mt-1 text-green-600">Central Region (90%) and East Region (84%) show exceptional engagement levels. Consider replicating community outreach tactics used here.</p>
//                   </div>
//                   <div className="p-4 rounded-lg bg-red-50 border border-red-200">
//                     <h3 className="font-medium text-red-800">Low Participation Areas</h3>
//                     <p className="mt-1 text-red-600">South Region (62%) shows lowest participation rate. Recommend targeted outreach and education campaigns in this area.</p>
//                   </div>
//                   <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
//                     <h3 className="font-medium text-blue-800">Notable Trends</h3>
//                     <p className="mt-1 text-blue-600">Participation rates have improved by an average of 12% compared to previous elections, with strongest growth in North Region.</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {activeTab === 'anomalies' && (
//           <div className="space-y-6">
//             {/* Anomalies Table */}
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h2 className="text-lg font-bold mb-4">Detected Anomalies</h2>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left">ID</th>
//                       <th className="px-6 py-3 text-left">Region</th>
//                       <th className="px-6 py-3 text-left">Type</th>
//                       <th className="px-6 py-3 text-left">Severity</th>
//                       <th className="px-6 py-3 text-left">Detected</th>
//                       <th className="px-6 py-3 text-left">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {anomalies.map((anomaly) => (
//                       <tr key={anomaly.id} className="border-b hover:bg-gray-50">
//                         <td className="px-6 py-4 whitespace-nowrap text-sm">
//                           #{anomaly.id}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {anomaly.region}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           {anomaly.type}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           <span className={`px-2 py-1 text-xs rounded-full ${
//                             anomaly.severity === 'High' ? 'bg-red-100 text-red-800' : 
//                             anomaly.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
//                             'bg-green-100 text-green-800'
//                           }`}>
//                             {anomaly.severity}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-500">
//                           {anomaly.time}
//                         </td>
//                         <td className="px-6 py-4 text-sm">
//                           <button className="text-indigo-600 hover:text-indigo-900 mr-2">Review</button>
//                           <button className="text-red-600 hover:text-red-900">Flag</button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Anomaly Analytics */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//               <div className="bg-white rounded-xl shadow-md p-6">
//                 <h2 className="text-lg font-bold mb-4">Anomaly Distribution by Type</h2>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={[
//                         { name: 'Unusual Voting Pattern', value: 45 },
//                         { name: 'Authentication Failures', value: 25 },
//                         { name: 'Geo-fencing Breach', value: 15 },
//                         { name: 'Duplicate Votes', value: 10 },
//                         { name: 'Other', value: 5 }
//                       ]}
//                       dataKey="value"
//                       nameKey="name"
//                       cx="50%"
//                       cy="50%"
//                       outerRadius={80}
//                       fill="#8884d8"
//                     >
//                       {[...Array(5)].map((_, index) => (
//                         <Cell key={`cell-${index}`} fill={`hsl(${index * 72}, 70%, 50%)`} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                     <Legend />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>

//               <div className="bg-white rounded-xl shadow-md p-6">
//                 <h2 className="text-lg font-bold mb-4">Anomaly Response Metrics</h2>
//                 <div className="space-y-4">
//                   <div>
//                     <div className="flex justify-between mb-1">
//                       <span className="text-sm font-medium">Average Detection Time</span>
//                       <span className="text-sm font-medium">1.2 minutes</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
//                     </div>
//                   </div>
//                   <div>
//                     <div className="flex justify-between mb-1">
//                       <span className="text-sm font-medium">Average Response Time</span>
//                       <span className="text-sm font-medium">4.7 minutes</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
//                     </div>
//                   </div>
//                   <div>
//                     <div className="flex justify-between mb-1">
//                       <span className="text-sm font-medium">Resolution Rate</span>
//                       <span className="text-sm font-medium">92%</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-6 p-4 rounded-lg bg-indigo-50 border border-indigo-200">
//                   <h3 className="font-medium text-indigo-800">AI-powered Monitoring</h3>
//                   <p className="mt-1 text-indigo-600">Our monitoring system has successfully prevented 24 attempted fraudulent votes and identified 3 suspicious patterns that are under investigation.</p>
//                 </div>
//               </div>
//             </div>

//             {/* Timeline of Recent Anomalies */}
//             <div className="bg-white rounded-xl shadow-md p-6">
//               <h2 className="text-lg font-bold mb-4">Timeline of Recent Anomalies</h2>
//               <div className="relative">
//                 {/* Timeline line */}
//                 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
//                 <div className="space-y-6">
//                   {[...Array(4)].map((_, i) => (
//                     <div key={i} className="relative pl-10">
//                       {/* Timeline dot */}
//                       <div className="absolute left-0 top-3 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
//                         {i === 0 && <FaExclamationTriangle className="text-indigo-600" />}
//                         {i === 1 && <FaRegClock className="text-yellow-600" />}
//                         {i === 2 && <FaThumbsUp className="text-green-600" />}
//                         {i === 3 && <FaExclamationTriangle className="text-red-600" />}
//                       </div>
//                       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <h3 className="font-medium">
//                               {['Unusual Voting Pattern', 'Authentication Attempts', 'Resolved Issue', 'New Anomaly Detected'][i]}
//                             </h3>
//                             <p className="text-sm text-gray-500 mt-1">
//                               {['West District', 'North Region', 'Central Ward', 'South Area'][i]}
//                             </p>
//                           </div>
//                           <span className={`text-xs px-2 py-1 rounded-full ${
//                             i === 0 ? 'bg-red-100 text-red-800' : 
//                             i === 1 ? 'bg-yellow-100 text-yellow-800' : 
//                             i === 2 ? 'bg-green-100 text-green-800' : 
//                             'bg-purple-100 text-purple-800'
//                           }`}>
//                             {['High', 'Medium', 'Resolved', 'New'][i]}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-600 mt-2">
//                           {[
//                             'Detected unusual voting pattern with 98% confidence',
//                             'Multiple failed authentication attempts from same device',
//                             'Issue resolved after administrator review',
//                             'New anomaly detected requiring review'
//                           ][i]}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-2">
//                           {new Date(Date.now() - (i * 45 * 60000)).toLocaleTimeString()}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AnalyticsDashboard;
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
    <div className="min-h-screen bg-gray-50 p-6">
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