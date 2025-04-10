// import React, { useEffect, useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { ChevronDown } from 'lucide-react';


// const useScramble = (text, isActive = true, duration = 1000) => {
//   const [displayText, setDisplayText] = useState(text);
  
//   useEffect(() => {
//     if (!isActive) return;
    
//     const characters = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()';
//     const steps = 11;
//     const stepDuration = duration / steps;
//     let currentStep = 0;
//     let timeoutId;
    
//     const scramble = () => {
//       if (currentStep >= steps) {
//         setDisplayText(text);
//         return;
//       }
      
//       const scrambled = text
//         .split('')
//         .map((char, index) => {
//           if (char === ' ') return ' ';
//           if (currentStep / steps > index / text.length) return char;
//           return characters[Math.floor(Math.random() * characters.length)];
//         })
//         .join('');
      
//       setDisplayText(scrambled);
//       currentStep++;
//       timeoutId = setTimeout(scramble, stepDuration);
//     };
    
//     scramble();
//     return () => {
//       clearTimeout(timeoutId);
//       setDisplayText(text);
//     };
//   }, [text, isActive, duration]);
  
//   return displayText;
// };

// const DropdownNavItem = ({ label, items, isHovered, onHoverStart, onHoverEnd }) => {
//   const scrambledText = useScramble(label, isHovered, 500);
  
//   return (
//     <motion.div
//       onHoverStart={onHoverStart}
//       onHoverEnd={onHoverEnd}
//       className="relative group"
//     >
//       <div className="flex items-center gap-2 px-3 py-3 text-emerald-800 hover:text-emerald-700 transition-colors duration-300 cursor-pointer">
//         <span className="text-lg font-subheading font-bold whitespace-nowrap" style={{ display: 'inline-block', minWidth: `${label.length}ch` }}>
//           {scrambledText}
//         </span>
//         <ChevronDown className="w-5 h-5 transition-transform group-hover:rotate-180" />
//       </div>
      
//       <AnimatePresence>
//         {isHovered && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.2 }}
//             className="absolute top-14 mt-2 right-0 w-52 py-2 bg-white/60 backdrop-blur-md shadow-sm rounded-md border border-gray-100"
//           >
//             {items.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className="block px-4 py-2.5 text-base text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-blue-50/20 hover:text-blue-700 hover:backdrop-blur-md transition-colors duration-200"
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// const NavItem = ({ label, path, isHovered, onHoverStart, onHoverEnd }) => {
//   const scrambledText = useScramble(label, isHovered, 500);
//   const isActive = location.pathname === path;
  
//   return (
//     <motion.div
//       onHoverStart={onHoverStart}
//       onHoverEnd={onHoverEnd}
//       className="relative flex items-center h-10"
//     >
//       <Link
//         to={path}
//         className="text-emerald-800 hover:text-emerald-700 transition-colors duration-300 px-3"
//       >
//         <span className="text-lg font-subheading font-bold whitespace-nowrap" style={{ display: 'inline-block', minWidth: `${label.length}ch` }}>
//           {scrambledText}
//         </span>
//         {isActive && (
//           <motion.span
//             className="absolute bottom-0 left-1 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500"
//             layoutId="underline"
//             style={{ width: '80%' }}
//           />
//         )}
//       </Link>
//     </motion.div>
//   );
// };

// const Header = () => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [hoveredItem, setHoveredItem] = useState(null);



//   const navItems = useMemo(() => [
//     // { label: 'Home', path: '/home' },
//     // { label: 'Election', path: '/dashboard' },
//     // {
//     //   label: 'Voice-Assitant',path: '/voiceassitantpage'},
   
//     // { label: 'Contact', path: '/contact' },
//     // { label: 'Gallery', path: '/gallery' },

//   ], []);

//   const navbarVariants = {
//     hidden: {
//       y: -100,
//       opacity: 0
//     },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         duration: 0.8,
//         ease: "easeOut"
//       }
//     }
//   };

//   return (
//     <AnimatePresence>
//       {!isVisible && (
//         <motion.nav
//           initial="hidden"
//           animate="visible"
//           variants={navbarVariants}
//           className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md shadow-sm"
//           style={{ height: '70px' }}
//         >
//           <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
//           <span className="font-bold text-3xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
//   SecureVote
// </span>

//             <div className="hidden md:flex items-center space-x-8">
//               {navItems.map((item) => (
//                 item.type === 'dropdown' ? (
//                   <DropdownNavItem
//                     key={item.label}
//                     label={item.label}
//                     items={item.items}
//                     isHovered={hoveredItem === item.label}
//                     onHoverStart={() => setHoveredItem(item.label)}
//                     onHoverEnd={() => setHoveredItem(null)}
//                   />
//                 ) : (
//                   <NavItem
//                     key={item.label}
//                     label={item.label}
//                     path={item.path}
//                     isHovered={hoveredItem === item.label}
//                     onHoverStart={() => setHoveredItem(item.label)}
//                     onHoverEnd={() => setHoveredItem(null)}
//                   />
//                 )
//               ))}
//             </div>
//             <button >LogOut</button>
//           </div>
//         </motion.nav>
//       )}
//     </AnimatePresence>
//   );
// };

// export default Header;

// import React, { useEffect, useState, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { ChevronDown } from 'lucide-react';


// const useScramble = (text, isActive = true, duration = 1000) => {
//   const [displayText, setDisplayText] = useState(text);
  
//   useEffect(() => {
//     if (!isActive) return;
    
//     const characters = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()';
//     const steps = 11;
//     const stepDuration = duration / steps;
//     let currentStep = 0;
//     let timeoutId;
    
//     const scramble = () => {
//       if (currentStep >= steps) {
//         setDisplayText(text);
//         return;
//       }
      
//       const scrambled = text
//         .split('')
//         .map((char, index) => {
//           if (char === ' ') return ' ';
//           if (currentStep / steps > index / text.length) return char;
//           return characters[Math.floor(Math.random() * characters.length)];
//         })
//         .join('');
      
//       setDisplayText(scrambled);
//       currentStep++;
//       timeoutId = setTimeout(scramble, stepDuration);
//     };
    
//     scramble();
//     return () => {
//       clearTimeout(timeoutId);
//       setDisplayText(text);
//     };
//   }, [text, isActive, duration]);
  
//   return displayText;
// };

// const DropdownNavItem = ({ label, items, isHovered, onHoverStart, onHoverEnd }) => {
//   const scrambledText = useScramble(label, isHovered, 500);
  
//   return (
//     <motion.div
//       onHoverStart={onHoverStart}
//       onHoverEnd={onHoverEnd}
//       className="relative group"
//     >
//       <div className="flex items-center gap-2 px-3 py-3 text-emerald-800 hover:text-emerald-700 transition-colors duration-300 cursor-pointer">
//         <span className="text-lg font-subheading font-bold whitespace-nowrap" style={{ display: 'inline-block', minWidth: `${label.length}ch` }}>
//           {scrambledText}
//         </span>
//         <ChevronDown className="w-5 h-5 transition-transform group-hover:rotate-180" />
//       </div>
      
//       <AnimatePresence>
//         {isHovered && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: -10 }}
//             transition={{ duration: 0.2 }}
//             className="absolute top-14 mt-2 right-0 w-52 py-2 bg-white/60 backdrop-blur-md shadow-sm rounded-md border border-gray-100"
//           >
//             {items.map((item) => (
//               <Link
//                 key={item.path}
//                 to={item.path}
//                 className="block px-4 py-2.5 text-base text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-blue-50/20 hover:text-blue-700 hover:backdrop-blur-md transition-colors duration-200"
//               >
//                 {item.label}
//               </Link>
//             ))}
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </motion.div>
//   );
// };

// const NavItem = ({ label, path, isHovered, onHoverStart, onHoverEnd }) => {
//   const scrambledText = useScramble(label, isHovered, 500);
//   const isActive = location.pathname === path;
  
//   return (
//     <motion.div
//       onHoverStart={onHoverStart}
//       onHoverEnd={onHoverEnd}
//       className="relative flex items-center h-10"
//     >
//       <Link
//         to={path}
//         className="text-emerald-800 hover:text-emerald-700 transition-colors duration-300 px-3"
//       >
//         <span className="text-lg font-subheading font-bold whitespace-nowrap" style={{ display: 'inline-block', minWidth: `${label.length}ch` }}>
//           {scrambledText}
//         </span>
//         {isActive && (
//           <motion.span
//             className="absolute bottom-0 left-1 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500"
//             layoutId="underline"
//             style={{ width: '80%' }}
//           />
//         )}
//       </Link>
//     </motion.div>
//   );
// };

// const Header = () => {
//   const [isVisible, setIsVisible] = useState(false);
//   const [hoveredItem, setHoveredItem] = useState(null);



//   const navItems = useMemo(() => [
//     // { label: 'Home', path: '/home' },
//     // { label: 'Election', path: '/dashboard' },
//     // {
//     //   label: 'Voice-Assitant',path: '/voiceassitantpage'},
   
//     // { label: 'Contact', path: '/contact' },
//     // { label: 'Gallery', path: '/gallery' },

//   ], []);

//   const navbarVariants = {
//     hidden: {
//       y: -100,
//       opacity: 0
//     },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         duration: 0.8,
//         ease: "easeOut"
//       }
//     }
//   };

//   return (
//     <AnimatePresence>
//       {!isVisible && (
//         <motion.nav
//           initial="hidden"
//           animate="visible"
//           variants={navbarVariants}
//           className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md shadow-sm"
//           style={{ height: '70px' }}
//         >
//           <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
//           <span className="font-bold text-3xl bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
//   SecureVote
// </span>

//             <div className="hidden md:flex items-center space-x-8">
//               {navItems.map((item) => (
//                 item.type === 'dropdown' ? (
//                   <DropdownNavItem
//                     key={item.label}
//                     label={item.label}
//                     items={item.items}
//                     isHovered={hoveredItem === item.label}
//                     onHoverStart={() => setHoveredItem(item.label)}
//                     onHoverEnd={() => setHoveredItem(null)}
//                   />
//                 ) : (
//                   <NavItem
//                     key={item.label}
//                     label={item.label}
//                     path={item.path}
//                     isHovered={hoveredItem === item.label}
//                     onHoverStart={() => setHoveredItem(item.label)}
//                     onHoverEnd={() => setHoveredItem(null)}
//                   />
//                 )
//               ))}
//             </div>
//             <button >LogOut</button>
//           </div>
//         </motion.nav>
//       )}
//     </AnimatePresence>
//   );
// };

// export default Header;


import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import LanguageIcon from '@mui/icons-material/Language';


const useScramble = (text, isActive = true, duration = 1000) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!isActive) return;
    const characters = 'abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()';
    const steps = 11;
    const stepDuration = duration / steps;
    let currentStep = 0;
    let timeoutId;

    const scramble = () => {
      if (currentStep >= steps) {
        setDisplayText(text);
        return;
      }
      const scrambled = text
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' ';
          if (currentStep / steps > index / text.length) return char;
          return characters[Math.floor(Math.random() * characters.length)];
        })
        .join('');
      setDisplayText(scrambled);
      currentStep++;
      timeoutId = setTimeout(scramble, stepDuration);
    };

    scramble();
    return () => {
      clearTimeout(timeoutId);
      setDisplayText(text);
    };
  }, [text, isActive, duration]);

  return displayText;
};

const DropdownNavItem = ({ label, items, isHovered, onHoverStart, onHoverEnd }) => {
  const scrambledText = useScramble(label, isHovered, 500);

  return (
    <motion.div
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className="relative group"
    >
      <div className="flex items-center gap-2 px-3 py-3 text-emerald-800 hover:text-emerald-700 transition-colors duration-300 cursor-pointer">
        <span className="text-lg font-subheading font-bold whitespace-nowrap" style={{ display: 'inline-block', minWidth: `${label.length}ch` }}>
          {scrambledText}
        </span>
        <ChevronDown className="w-5 h-5 transition-transform group-hover:rotate-180" />
      </div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 mt-2 right-0 w-52 py-2 bg-white/90 backdrop-blur-md shadow-sm rounded-md border border-gray-100"
          >
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-4 py-2.5 text-base text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-blue-50/20 hover:text-blue-700 hover:backdrop-blur-md transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NavItem = ({ label, path, isHovered, onHoverStart, onHoverEnd }) => {
  const scrambledText = useScramble(label, isHovered, 500);
  const isActive = location.pathname === path;

  return (
    <motion.div
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      className="relative flex items-center h-10"
    >
      <Link
        to={path}
        className="text-emerald-800 hover:text-emerald-700 transition-colors duration-300 px-3"
      >
        <span className="text-lg font-subheading font-bold whitespace-nowrap" style={{ display: 'inline-block', minWidth: `${label.length}ch` }}>
          {scrambledText}
        </span>
        {isActive && (
          <motion.span
            className="absolute bottom-0 left-1 h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500"
            layoutId="underline"
            style={{ width: '80%' }}
          />
        )}
      </Link>
    </motion.div>
  );
};

const Header = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const navigate = useNavigate();

  const navItems = useMemo(() => [], []);

  const handleLogout = () => {
    // 🔐 Add logout logic here: remove token, clear session, etc.
    // For now just navigate to login
    navigate('/login');
  };

  const navbarVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  };

  return (
    <AnimatePresence>
      {!isVisible && (
        <motion.nav
          initial="hidden"
          animate="visible"
          variants={navbarVariants}
          className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md shadow-sm"
          style={{ height: '70px' }}
        >
          <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <Link to="/home">
              <span className="font-bold text-3xl bg-gradient-to-r from-[#99BC85] to-[#7FA56D] bg-clip-text text-transparent cursor-pointer">
              Nishpaksh
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                item.type === 'dropdown' ? (
                  <DropdownNavItem
                    key={item.label}
                    label={item.label}
                    items={item.items}
                    isHovered={hoveredItem === item.label}
                    onHoverStart={() => setHoveredItem(item.label)}
                    onHoverEnd={() => setHoveredItem(null)}
                  />
                ) : (
                  <NavItem
                    key={item.label}
                    label={item.label}
                    path={item.path}
                    isHovered={hoveredItem === item.label}
                    onHoverStart={() => setHoveredItem(item.label)}
                    onHoverEnd={() => setHoveredItem(null)}
                  />
                )
              ))}
            </div>
            <div>

         
            <Link to="/analytics">
            <button
               
              className="px-4 py-2 text-sm font-semibold text-white bg-[#7FA56D] hover:bg-[#99BC85] rounded-md shadow-sm transition-colors duration-200"
            >
             Profile
              
            </button>
            </Link>
            {/* <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#7FA56D] hover:bg-[#99BC85] rounded-md shadow-sm transition-colors duration-200"
            >
              Log Out
            </button> */}
            <button className="p-2 pl-5 text-[#7FA56D] hover:text-[#99BC85] transition-colors duration-200">
    <LanguageIcon style={{ fontSize: 28 }} />
  </button>
  </div>

          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default Header;



// export default Header;

// import React from 'react';
// import { 
//   SosOutlined as SOSIcon, 
//   AccountCircleOutlined as ProfileIcon 
// } from '@mui/icons-material';

// function Header({ selectedSection }) {
//   return (
//     <header className="sticky top-0 w-full bg-black text-white flex justify-between items-center p-4 z-10">
//       <div className="flex items-center space-x-4">
//         <SOSIcon className="text-red-500 cursor-pointer" />
//         <ProfileIcon className="text-mine-green cursor-pointer" />
//       </div>
      
//       <h2 className="text-2xl font-bold text-mine-green">{selectedSection}</h2>
      
//       <div>{/* Placeholder for right-side elements if needed */}</div>
//     </header>
//   );
// }

// export default Header;

