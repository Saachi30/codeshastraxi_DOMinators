// pages/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const HomePage = () => {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

//   useEffect(() => {
//     // Simulating a news API fetch
//     // In a real application, replace this with your actual API call
//     setTimeout(() => {
//       setNews([
//         {
//           id: 1,
//           title: "Zero-Knowledge Proofs Revolutionizing Voting Systems",
//           description: "New research shows how ZKPs are making blockchain voting more secure and private than ever before.",
//           date: "April 3, 2025",
//           image: "/api/placeholder/400/200"
//         },
//         {
//           id: 2,
//           title: "Major City Adopts Blockchain for Local Elections",
//           description: "A major metropolitan area announces plans to test blockchain voting for upcoming local elections.",
//           date: "April 1, 2025",
//           image: "/api/placeholder/400/200"
//         },
//         {
//           id: 3,
//           title: "New Security Features Added to SecureVote Platform",
//           description: "The latest platform update includes enhanced biometric authentication and improved smart contract dispute resolution.",
//           date: "March 28, 2025",
//           image: "/api/placeholder/400/200"
//         }
//       ]);
//       setIsLoading(false);
//     }, 1000);
//   }, []);


useEffect(() => {
    const fetchNews = async () => {
      try {
        // Replace with your actual News API key
        const NEWS_API_KEY = '294c5ddf4b274ea98ddc8a21d8233a2f';
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=blockchain%20voting&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        // Format news data to match your existing structure
        const formattedNews = data.articles.slice(0, 3).map((article, index) => ({
            id: index + 1,
            title: article.title,
            description: article.description,
            date: new Date(article.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            image: article.urlToImage || '/api/placeholder/400/200',
            url: article.url
          }));
  
          setNews(formattedNews);
        } catch (error) {
          console.error('Error fetching news:', error);
          setNewsError('Failed to load latest news. Using sample data instead.');
        // Fallback to sample data if API fails
        setNews([
            {
              id: 1,
              title: "Zero-Knowledge Proofs Revolutionizing Voting Systems",
              description: "New research shows how ZKPs are making blockchain voting more secure and private than ever before.",
              date: "April 3, 2025",
              image: "/api/placeholder/400/200"
            },
            {
              id: 2,
              title: "Major City Adopts Blockchain for Local Elections",
              description: "A major metropolitan area announces plans to test blockchain voting for upcoming local elections.",
              date: "April 1, 2025",
              image: "/api/placeholder/400/200"
            },
            {
              id: 3,
              title: "New Security Features Added to SecureVote Platform",
              description: "The latest platform update includes enhanced biometric authentication and improved smart contract dispute resolution.",
              date: "March 28, 2025",
              image: "/api/placeholder/400/200"
            }
          ]);
        } finally {
            setIsLoading(false);
          }
        };
    
        fetchNews();
      }, []);
      
      
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-200 to-indigo-200 text-gray-800 py-16 md:py-40 ">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">Secure, Anonymous Voting for the Digital Age</h1>
                <p className="text-xl mb-6">Leveraging blockchain technology and zero-knowledge proofs to ensure election integrity and voter privacy.</p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Link to="/elections" className="bg-blue-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg text-center">
                    View Active Elections
                  </Link>
                  <Link to="/how-it-works" className="bg-white hover:bg-gray-100 text-indigo-700 font-bold py-3 px-6 rounded-lg text-center">
                    Learn How It Works
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-xl transform rotate-8 opacity-30"></div>
                  <img 
                    src="/vote.png" 
                    alt="Secure voting illustration" 
                    className="relative rounded-lg  border-2  transform -rotate-1  border-blue-900/50 shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
       
        
        {/* News Section */}
        {/* <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Latest Blockchain Voting News</h2>
            
            {isLoading ? (
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {news.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:transform hover:scale-105">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <p className="text-sm text-indigo-500 mb-2">{item.date}</p>
                      <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                      <p className="text-gray-700 mb-4">{item.description}</p>
                      <Link to={`/news/${item.id}`} className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center">
                        Read more
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section> */}

        {/* News Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="font-bold text-3xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent text-center mb-12">Latest Blockchain Voting News</h2>
            
            {newsError && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-yellow-700">{newsError}</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) :(
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {news.map((item) => (
                    <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:transform hover:scale-105">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/400/200';
                        }}
                      />
                      <div className="p-6">
                        <p className="text-sm text-indigo-500 mb-2">{item.date}</p>
                        <h3 className="text-xl font-bold mb-2 text-black">{item.title}</h3>
                        <p className="text-gray-700 mb-4">{item.description}</p>
                        <a 
                          href={item.url || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center"
                        >
                          Read more
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

         
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Blockchain Voting Platform Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md">
                <div className="bg-indigo-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-indigo-400">Zero-Knowledge Proofs</h3>
                <p className="text-gray-700">Vote with complete privacy. Our system uses ZKPs to verify votes without revealing your choices to anyone.</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md">
                <div className="bg-indigo-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2  text-indigo-400">Enhanced Authentication</h3>
                <p className="text-gray-700">Multi-factor authentication ensures that only verified individuals can cast votes, preventing fraud.</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md">
                <div className="bg-indigo-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2  text-indigo-400">Smart Contract Dispute Resolution</h3>
                <p className="text-gray-700">Automated smart contracts detect anomalies and trigger resolution processes without human bias.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md">
                <div className="bg-indigo-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2  text-indigo-400">Geo-Fenced Voting Access</h3>
                <p className="text-gray-700">Location-based restrictions ensure only eligible voters within defined geographic boundaries can participate in relevant elections.</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md">
                <div className="bg-indigo-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2  text-indigo-400">Real-Time Analytics Dashboard</h3>
                <p className="text-gray-700">Monitor voting patterns, community sentiment, and engagement levels with our comprehensive real-time dashboard.</p>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-indigo-200 to-blue-200 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Voting?</h2>
            <p className="text-xl md:w-2/3 mx-auto mb-8 text-black">Join the blockchain voting revolution and experience secure, transparent, and accessible elections.</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/register" className="bg-white text-indigo-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-center">
                Create an Account
              </Link>
              <Link to="/demo" className="bg-transparent border-2 border-white hover:bg-white hover:text-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 text-center">
                Try Demo Election
              </Link>
            </div>
          </div>
        </section>
        
        {/* NFT Certificate Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-center">
              <div className="mr-40 mb-8 md:mb-0 ">
                <img 
                  src="/nft.png" 
                  alt="NFT Voting Certificate" 
                  className="rounded-lg shadow-lg w-64 h-72"
                />
              </div>
              <div className="md:w-1/2 md:pl-12 text-black">
                <h2 className="text-3xl font-bold mb-4">Commemorative Voting NFT Certificates</h2>
                <p className="text-xl mb-6">Each vote is accompanied by a unique, collectible NFT certificate that proves your participation while maintaining your anonymity.</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unique digital artwork for each election</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Verifiable on-chain proof of participation</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Privacy-preserving design</span>
                  </li>
                </ul>
                <Link to="/nft-gallery" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg">
                  View NFT Gallery
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="font-bold text-3xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-bold text-center mb-12">What Clients Are Saying</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold">Sarah Johnson</h3>
                    <p className="text-sm text-gray-600">City Council Member</p>
                  </div>
                </div>
                <p className="text-gray-700">"This platform transformed our local elections. Voter participation increased by 24% and the results were available instantly with complete transparency."</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold">Michael Chang</h3>
                    <p className="text-sm text-gray-600">Community Organization Leader</p>
                  </div>
                </div>
                <p className="text-gray-700">"The zero-knowledge proofs feature gave our members confidence that their votes were truly anonymous, leading to more honest feedback in our decision-making process."</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold">Emily Rodriguez</h3>
                    <p className="text-sm text-gray-600">University Student Body President</p>
                  </div>
                </div>
                <p className="text-gray-700">"Our student government elections saw record turnout after implementing this platform. The NFT certificates were an unexpected hit with our tech-savvy student body."</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-xl mb-2">How does blockchain ensure vote security?</h3>
                <p className="text-gray-700">Our platform leverages immutable blockchain records and cryptographic proofs to ensure that once cast, votes cannot be altered or tampered with, while maintaining complete voter privacy.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-xl mb-2">What is a zero-knowledge proof?</h3>
                <p className="text-gray-700">Zero-knowledge proofs allow verification that a vote was legitimately cast without revealing any information about the voter's identity or their specific choices, ensuring both integrity and privacy.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-xl mb-2">Can I vote from anywhere?</h3>
                <p className="text-gray-700">Depending on the election settings, geo-fencing may be enabled to ensure voters are physically located within relevant jurisdictions, but the platform itself is accessible from any device with internet access.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-bold text-xl mb-2">What happens if there's a technical issue?</h3>
                <p className="text-gray-700">Our smart contract dispute resolution system automatically detects anomalies and initiates resolution processes. Additionally, our 24/7 support team is available to address any concerns promptly.</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Link to="/faq" className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center justify-center">
                View all FAQs
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;