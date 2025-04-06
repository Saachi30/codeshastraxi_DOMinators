import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';


const HomePage = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);

  // Initialize Vanta.js effect
 

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const NEWS_API_KEY = '294c5ddf4b274ea98ddc8a21d8233a2f';
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=blockchain%20voting&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
        );

        if (!response.ok) throw new Error('Failed to fetch news');

        const data = await response.json();
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
    <div className="flex flex-col min-h-screen pt-22 bg-[#FDFAF6]">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section 
          ref={vantaRef}
          className="relative py-16 md:py-24 text-gray-800 overflow-hidden"
          style={{ height: '600px' }}
        >
          <div className="absolute inset-0 bg-[#FAF1E6]/50 backdrop-blur-sm"></div>
          <div className="container mx-auto px-4 relative z-10 h-full flex items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#2C3E50]">Secure, Anonymous Voting for the Digital Age</h1>
              <p className="text-xl mb-6 text-[#34495E]">Leveraging blockchain technology and zero-knowledge proofs to ensure election integrity and voter privacy.</p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link 
                  to="/dashboard" 
                  className="bg-[#99BC85] hover:bg-[#7FA56D] text-white font-bold py-3 px-6 rounded-lg text-center transition-colors"
                >
                  View Active Elections
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="bg-white hover:bg-[#E4EFE7] text-[#2C3E50] font-bold py-3 px-6 rounded-lg text-center border border-[#99BC85] transition-colors"
                >
                  Learn How It Works
                </Link>
              </div>
              
            </div>
            <div className="md:w-1/2 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#99BC85] to-[#7FA56D] rounded-lg shadow-xl transform rotate-8 opacity-30"></div>
                  <img 
                    src="/vote.png" 
                    alt="Secure voting illustration" 
                    className="relative rounded-lg  border-2  transform -rotate-1  border-green-900/50 shadow-lg"
                  />
                </div>
              </div>
  
          </div>
        </section>

        {/* News Section */}
        <section className="py-16 bg-[#E4EFE7]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#2C3E50]">Latest Blockchain Voting News</h2>
            
            {newsError && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-yellow-700">{newsError}</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center">
                <div className="w-16 h-16 border-4 border-[#99BC85] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {news.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:transform hover:scale-105 hover:shadow-lg"
                  >
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.src = '/api/placeholder/400/200';
                      }}
                    />
                    <div className="p-6">
                      <p className="text-sm text-[#99BC85] mb-2">{item.date}</p>
                      <h3 className="text-xl font-bold mb-2 text-[#2C3E50]">{item.title}</h3>
                      <p className="text-gray-700 mb-4">{item.description}</p>
                      <a 
                        href={item.url || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#99BC85] font-medium hover:text-[#7FA56D] flex items-center transition-colors"
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
        <section className="py-16 bg-[#FDFAF6]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#2C3E50]">Blockchain Voting Platform Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#E4EFE7] hover:border-[#99BC85] transition-colors">
                <div className="bg-[#E4EFE7] p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#2C3E50]">Zero-Knowledge Proofs</h3>
                <p className="text-gray-700">Vote with complete privacy. Our system uses ZKPs to verify votes without revealing your choices to anyone.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#E4EFE7] hover:border-[#99BC85] transition-colors">
                <div className="bg-[#E4EFE7] p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#2C3E50]">Enhanced Authentication</h3>
                <p className="text-gray-700">Multi-factor authentication ensures that only verified individuals can cast votes, preventing fraud.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md border border-[#E4EFE7] hover:border-[#99BC85] transition-colors">
                <div className="bg-[#E4EFE7] p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#2C3E50]">Smart Contract Dispute Resolution</h3>
                <p className="text-gray-700">Automated smart contracts detect anomalies and trigger resolution processes without human bias.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#99BC85] to-[#7FA56D] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Voting?</h2>
            <p className="text-xl md:w-2/3 mx-auto mb-8">Join the blockchain voting revolution and experience secure, transparent, and accessible elections.</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                to="/register" 
                className="bg-white text-[#2C3E50] hover:bg-[#FDFAF6] font-bold py-3 px-8 rounded-lg text-center transition-colors"
              >
                Create an Account
              </Link>
              <Link 
                to="/demo" 
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#2C3E50] text-white font-bold py-3 px-8 rounded-lg transition-colors duration-300 text-center"
              >
                Try Demo Election
              </Link>
            </div>
          </div>
        </section>

        {/* NFT Certificate Section */}
        <section className="py-16 bg-[#FDFAF6]">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 flex justify-center">
                <img 
                  src="/nft.png" 
                  alt="NFT Voting Certificate" 
                  className="rounded-lg shadow-lg max-w-md"
                />
              </div>
              <div className="md:w-1/2 md:pl-12">
                <h2 className="text-3xl font-bold mb-4 text-[#2C3E50]">Commemorative Voting NFT Certificates</h2>
                <p className="text-xl mb-6 text-gray-700">Each vote is accompanied by a unique, collectible NFT certificate that proves your participation while maintaining your anonymity.</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start text-gray-700">
                    <svg className="h-6 w-6 text-[#99BC85] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unique digital artwork for each election</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="h-6 w-6 text-[#99BC85] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Verifiable on-chain proof of participation</span>
                  </li>
                  <li className="flex items-start text-gray-700">
                    <svg className="h-6 w-6 text-[#99BC85] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Privacy-preserving design</span>
                  </li>
                </ul>
                <Link 
                  to="/nft-gallery" 
                  className="inline-block bg-[#99BC85] hover:bg-[#7FA56D] text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  View NFT Gallery
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 bg-[#E4EFE7]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#2C3E50]">What Clients Are Saying</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-[#E4EFE7] flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C3E50]">Sarah Johnson</h3>
                    <p className="text-sm text-gray-600">City Council Member</p>
                  </div>
                </div>
                <p className="text-gray-700">"This platform transformed our local elections. Voter participation increased by 24% and the results were available instantly with complete transparency."</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-[#E4EFE7] flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C3E50]">Michael Chang</h3>
                    <p className="text-sm text-gray-600">Community Organization Leader</p>
                  </div>
                </div>
                <p className="text-gray-700">"The zero-knowledge proofs feature gave our members confidence that their votes were truly anonymous, leading to more honest feedback in our decision-making process."</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-[#E4EFE7] flex items-center justify-center mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#99BC85]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C3E50]">Emily Rodriguez</h3>
                    <p className="text-sm text-gray-600">University Student Body President</p>
                  </div>
                </div>
                <p className="text-gray-700">"Our student government elections saw record turnout after implementing this platform. The NFT certificates were an unexpected hit with our tech-savvy student body."</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-[#FDFAF6]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-[#2C3E50]">Frequently Asked Questions</h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="border border-[#E4EFE7] rounded-lg p-6 bg-white">
                <h3 className="font-bold text-xl mb-2 text-[#2C3E50]">How does blockchain ensure vote security?</h3>
                <p className="text-gray-700">Our platform leverages immutable blockchain records and cryptographic proofs to ensure that once cast, votes cannot be altered or tampered with, while maintaining complete voter privacy.</p>
              </div>
              
              <div className="border border-[#E4EFE7] rounded-lg p-6 bg-white">
                <h3 className="font-bold text-xl mb-2 text-[#2C3E50]">What is a zero-knowledge proof?</h3>
                <p className="text-gray-700">Zero-knowledge proofs allow verification that a vote was legitimately cast without revealing any information about the voter's identity or their specific choices, ensuring both integrity and privacy.</p>
              </div>
              
              <div className="border border-[#E4EFE7] rounded-lg p-6 bg-white">
                <h3 className="font-bold text-xl mb-2 text-[#2C3E50]">Can I vote from anywhere?</h3>
                <p className="text-gray-700">Depending on the election settings, geo-fencing may be enabled to ensure voters are physically located within relevant jurisdictions, but the platform itself is accessible from any device with internet access.</p>
              </div>
              
              <div className="border border-[#E4EFE7] rounded-lg p-6 bg-white">
                <h3 className="font-bold text-xl mb-2 text-[#2C3E50]">What happens if there's a technical issue?</h3>
                <p className="text-gray-700">Our smart contract dispute resolution system automatically detects anomalies and initiates resolution processes. Additionally, our 24/7 support team is available to address any concerns promptly.</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Link 
                to="/faq" 
                className="text-[#99BC85] font-medium hover:text-[#7FA56D] flex items-center justify-center transition-colors"
              >
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