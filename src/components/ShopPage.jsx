import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Grid,
  List,
  ChevronRight,
  ShoppingCart,
  X,
  Plus,
  Minus,
  Info,
  SlidersHorizontal,
  Trash2,
  Download,
  CheckCircle,
  ArrowRight,
  ChevronDown,
  Award,
  Wrench,
  Sliders,
  Cpu
} from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { sampleProducts } from '../data/sampleProducts';

// Brand logos with Cloudinary URLs and scale specifications (6 Authorized Partners Only)
const brandLogos = [
  { name: 'Ingersoll Rand', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278558/port/ctrjijbpcixvkfvv636m.png', scale: 1.35 },
  { name: 'Bosch Power Tools', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278517/port/svdnbsmz2mkirhr9oqes.png', scale: 1.25 },
  { name: 'Stanley Black & Decker', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278565/port/dfhdgyfgk2q4ddivq0rv.png', scale: 1.00 },
  { name: 'Eibenstock', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278519/port/wkn0oyaxl2jgzwklcupo.png', scale: 2.5 },
  { name: 'Cromwell Tools Industries', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278518/port/khritkvs9abfqepsxpa9.png', scale: 1.8 },
  { name: 'Atlas Protective Products', src: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278516/port/hym3rag4eal3xxn9bx6d.png', scale: 2.5 }
];

// Carousel items
const carouselSlides = [
  {
    title: 'High-Performance Pneumatics',
    subtitle: 'Industrial Grinding and Milling tools by Ingersoll Rand',
    image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278562/port/awouogqczxlfzf4fn9qf.jpg',
    tag: 'PNEUMATICS'
  },
  {
    title: 'Precision German Engineering',
    subtitle: 'Heavy duty drilling and core machines by Eibenstock & Bosch',
    image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png',
    tag: 'POWER TOOLS'
  },
  {
    title: 'HSE Safety Standard Gear',
    subtitle: 'Full protective equipment for hazardous work sites',
    image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278562/port/i57qdajixxllurowpkev.jpg',
    tag: 'SAFETY'
  }
];

export default function ShopPage() {
  const [config, setConfig] = useState(null);

  // Fetch portfolio settings config
  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiBaseUrl}/api/portfolio/config?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfig(data.data);
        }
      })
      .catch(err => console.error('Error fetching portfolio config:', err));
  }, []);

  // Products list from LocalStorage / Mock database
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cts_quote_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // login or signup
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [quoteSuccessData, setQuoteSuccessData] = useState(null);

  // Auth User Mock state
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cts_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSubType, setSelectedSubType] = useState('All');
  const [selectedModel, setSelectedModel] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc'); // name-asc, newest
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Checkout form state
  const [checkoutForm, setCheckoutForm] = useState({
    name: user?.username || '',
    company: '',
    email: user?.email || '',
    phone: '',
    message: ''
  });

  // References for scrolling
  const catalogRef = useRef(null);

  // Initialize products list (loading from backend API with localStorage caching fallback)
  useEffect(() => {
    const approvedBrands = [
      'Atlas Protective Products',
      'Bosch Power Tools',
      'Cromwell Tools Industries',
      'Eibenstock',
      'Ingersoll Rand',
      'Stanley Black & Decker'
    ];

    const loadLocalFallback = () => {
      const saved = localStorage.getItem('cts_products');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const filtered = parsed.filter(p => approvedBrands.includes(p.brand));
          if (filtered.length === 0) {
            localStorage.setItem('cts_products', JSON.stringify(sampleProducts));
            setProducts(sampleProducts);
          } else {
            setProducts(filtered);
          }
        } catch (e) {
          setProducts(sampleProducts);
        }
      } else {
        localStorage.setItem('cts_products', JSON.stringify(sampleProducts));
        setProducts(sampleProducts);
      }
    };

    const fetchProducts = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBaseUrl}/api/ecomm/products`);
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const filtered = result.data.filter(p => approvedBrands.includes(p.brand));
          if (filtered.length === 0) {
            loadLocalFallback();
          } else {
            setProducts(filtered);
            localStorage.setItem('cts_products', JSON.stringify(filtered));
          }
        } else {
          loadLocalFallback();
        }
      } catch (err) {
        console.warn('API connection failed, falling back to local products cache:', err);
        loadLocalFallback();
      }
    };

    fetchProducts();
  }, []);

  // Update localStorage quote cart whenever it changes
  useEffect(() => {
    localStorage.setItem('cts_quote_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync auth form with user state when user logs in/out
  useEffect(() => {
    if (user) {
      setCheckoutForm(prev => ({
        ...prev,
        name: user.username || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  // Carousel slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % carouselSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Compute unique filters based on current products list (Cascading)
  const filterOptions = useMemo(() => {
    const options = {
      categories: new Set(['All']),
      brands: new Set(['All']),
      types: new Set(['All']),
      subTypes: new Set(['All']),
      models: new Set(['All'])
    };

    // 1. Categories are computed from all products
    products.forEach(p => {
      if (p.category) options.categories.add(p.category);
    });

    // 2. Brands depend on Category selection
    const productsForBrand = products.filter(p => {
      return selectedCategory === 'All' || p.category === selectedCategory;
    });
    productsForBrand.forEach(p => {
      if (p.brand) options.brands.add(p.brand);
    });

    // 3. Types depend on Category and Brand selections
    const productsForType = productsForBrand.filter(p => {
      return selectedBrand === 'All' || p.brand === selectedBrand;
    });
    productsForType.forEach(p => {
      if (p.type) options.types.add(p.type);
    });

    // 4. Sub-Types depend on Category, Brand, and Type selections
    const productsForSubType = productsForType.filter(p => {
      return selectedType === 'All' || p.type === selectedType;
    });
    productsForSubType.forEach(p => {
      if (p.sub_type) options.subTypes.add(p.sub_type);
    });

    // 5. Models depend on Category, Brand, Type, and Sub-Type selections
    const productsForModel = productsForSubType.filter(p => {
      return selectedSubType === 'All' || p.sub_type === selectedSubType;
    });
    productsForModel.forEach(p => {
      if (p.model) options.models.add(p.model);
    });

    return {
      categories: Array.from(options.categories),
      brands: Array.from(options.brands),
      types: Array.from(options.types),
      subTypes: Array.from(options.subTypes),
      models: Array.from(options.models)
    };
  }, [products, selectedCategory, selectedBrand, selectedType, selectedSubType]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        p =>
          p.product_name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.model?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Brand filter
    if (selectedBrand !== 'All') {
      result = result.filter(p => p.brand === selectedBrand);
    }

    // Type filter
    if (selectedType !== 'All') {
      result = result.filter(p => p.type === selectedType);
    }

    // Sub-type filter
    if (selectedSubType !== 'All') {
      result = result.filter(p => p.sub_type === selectedSubType);
    }

    // Model filter
    if (selectedModel !== 'All') {
      result = result.filter(p => p.model === selectedModel);
    }

    // Sort
    if (sortBy === 'name-asc') {
      result.sort((a, b) => (a.product_name || '').localeCompare(b.product_name || ''));
    } else if (sortBy === 'newest') {
      // Simulate ordering by ID/SKU descending
      result.sort((a, b) => (b.product_id || '').localeCompare(a.product_id || ''));
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedType, selectedSubType, selectedModel, sortBy]);

  // Specifications parser helper
  const parseSpecifications = (specsString) => {
    if (!specsString) return [];
    return specsString.split('|').map(part => {
      const idx = part.indexOf(':');
      if (idx === -1) return { parameter: part.trim(), value: '' };
      return {
        parameter: part.substring(0, idx).trim(),
        value: part.substring(idx + 1).trim()
      };
    });
  };

  // Cart operations
  const addToQuote = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Open cart automatically to show feedback
    setIsCartOpen(true);
  };

  const updateCartQty = (productId, amount) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product_id === productId) {
          const newQty = item.quantity + amount;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const totalCartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  // Click triggers scrolling
  const scrollToCatalog = () => {
    setTimeout(() => {
      catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Reset all child filters to avoid impossible states
    setSelectedBrand('All');
    setSelectedType('All');
    setSelectedSubType('All');
    setSelectedModel('All');
    scrollToCatalog();
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    // Reset lower child filters
    setSelectedType('All');
    setSelectedSubType('All');
    setSelectedModel('All');
    scrollToCatalog();
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    // Reset lower child filters
    setSelectedSubType('All');
    setSelectedModel('All');
    scrollToCatalog();
  };

  const handleSubTypeSelect = (subType) => {
    setSelectedSubType(subType);
    // Reset lower child filters
    setSelectedModel('All');
    scrollToCatalog();
  };

  const handleModelSelect = (model) => {
    setSelectedModel(model);
    scrollToCatalog();
  };

  // Login/Signup Simulation
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const username = e.target.username?.value || email.split('@')[0];

    const mockUser = {
      email,
      username,
      role: 'User'
    };
    localStorage.setItem('cts_user', JSON.stringify(mockUser));
    localStorage.setItem('cts_token', 'mock_token_key');
    setUser(mockUser);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('cts_user');
    localStorage.removeItem('cts_token');
    setUser(null);
  };

  // Submit quote request simulation
  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      setAuthTab('login');
      setIsAuthOpen(true);
      return;
    }

    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const referenceId = `CTS-${year}-${random}`;

    const quoteObj = {
      referenceId,
      customerDetails: { ...checkoutForm },
      items: cart.map(item => ({
        product_id: item.product_id,
        sku: item.sku,
        product_name: item.product_name,
        brand: item.brand,
        model: item.model,
        quantity: item.quantity
      })),
      date: new Date().toISOString(),
      status: 'Pending',
      notes: []
    };

    // Save to global list in localStorage
    const savedQuotes = JSON.parse(localStorage.getItem('cts_quotes') || '[]');
    savedQuotes.push(quoteObj);
    localStorage.setItem('cts_quotes', JSON.stringify(savedQuotes));

    // Clear cart
    setCart([]);
    setIsCartOpen(false);
    setIsCheckingOut(false);
    setQuoteSuccessData(quoteObj);
  };

  // Simulate print/download details
  const downloadSummaryPdf = (refId) => {
    window.print();
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans text-slate-100">
      {/* Global Navbar */}
      <Navbar 
        isVisible={true} 
        isShop={true}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
      />

      {/* Floating Quote Cart Button */}
      <motion.button
        onClick={() => setIsCartOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-tr from-[#016A8A] to-[#2796a9] flex items-center justify-center shadow-[0_0_25px_rgba(39,150,169,0.5)] border border-white/20 hover:scale-105 active:scale-95 transition-transform"
        whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
      >
        <ShoppingCart className="text-white" size={24} />
        {totalCartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center border-2 border-slate-950">
            {totalCartCount}
          </span>
        )}
      </motion.button>

      {/* Main Page Layout Container: Sidebar on Left, Sections on Right */}
      <div className="flex flex-col lg:flex-row min-h-screen pt-24">
        
        {/* SIDEBAR FILTERS WRAPPER (Persistent throughout the eCommerce page, hover-expand on desktop) */}
        <div 
          className="relative w-full lg:w-20 shrink-0 z-30 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] flex flex-col"
          onMouseEnter={() => setIsSidebarHovered(true)}
          onMouseLeave={() => setIsSidebarHovered(false)}
        >
          <aside 
            className={`w-full lg:absolute lg:top-0 lg:left-0 lg:h-full border-b lg:border-r border-slate-800 bg-slate-900/90 backdrop-blur-md transition-all duration-300 ease-in-out z-30 flex flex-col ${
              isSidebarHovered 
                ? 'lg:w-80 p-6 lg:overflow-y-auto' 
                : 'lg:w-20 p-4 lg:items-center lg:overflow-visible'
            }`}
          >
            {/* Expanded Sidebar Header */}
            <div className={`flex items-center justify-between mb-6 pb-4 border-b border-slate-800 w-full ${!isSidebarHovered ? 'lg:hidden' : ''}`}>
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <SlidersHorizontal size={18} />
                Filters
              </h3>
              {(selectedCategory !== 'All' || selectedBrand !== 'All' || selectedType !== 'All' || selectedSubType !== 'All' || selectedModel !== 'All' || searchQuery !== '') && (
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedBrand('All');
                    setSelectedType('All');
                    setSelectedSubType('All');
                    setSelectedModel('All');
                    setSearchQuery('');
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Collapsed Sidebar Header (Desktop Only) */}
            <div className={`hidden lg:flex flex-col items-center gap-4 mb-6 pb-4 border-b border-slate-850 w-full ${isSidebarHovered ? 'lg:hidden' : ''}`}>
              <SlidersHorizontal size={20} className="text-[#2796a9] animate-pulse" />
              {(selectedCategory !== 'All' || selectedBrand !== 'All' || selectedType !== 'All' || selectedSubType !== 'All' || selectedModel !== 'All' || searchQuery !== '') && (
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-red-500/20" title="Active filters applied" />
              )}
            </div>

            {/* Expanded Filters Dropdowns */}
            <div className={`flex flex-col gap-6 w-full text-left ${!isSidebarHovered ? 'lg:hidden' : ''}`}>
              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold text-[#2796a9] tracking-wider uppercase block mb-2">Category</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-[#2796a9] cursor-pointer appearance-none"
                  >
                    {filterOptions.categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="text-xs font-bold text-[#2796a9] tracking-wider uppercase block mb-2">Brand</label>
                <div className="relative">
                  <select
                    value={selectedBrand}
                    onChange={(e) => handleBrandSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-[#2796a9] cursor-pointer appearance-none"
                  >
                    {filterOptions.brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-xs font-bold text-[#2796a9] tracking-wider uppercase block mb-2">Type</label>
                <div className="relative">
                  <select
                    value={selectedType}
                    onChange={(e) => handleTypeSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-[#2796a9] cursor-pointer appearance-none"
                  >
                    {filterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Sub-Type Filter */}
              <div>
                <label className="text-xs font-bold text-[#2796a9] tracking-wider uppercase block mb-2">Sub-Type</label>
                <div className="relative">
                  <select
                    value={selectedSubType}
                    onChange={(e) => handleSubTypeSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-[#2796a9] cursor-pointer appearance-none"
                  >
                    {filterOptions.subTypes.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Model Filter */}
              <div>
                <label className="text-xs font-bold text-[#2796a9] tracking-wider uppercase block mb-2">Model</label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => handleModelSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-[#2796a9] cursor-pointer appearance-none"
                  >
                    {filterOptions.models.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Collapsed Icons View (Desktop Only) */}
            <div className={`hidden lg:flex flex-col items-center gap-8 w-full mt-2 ${isSidebarHovered ? 'lg:hidden' : ''}`}>
              {/* Category Icon */}
              <div className="relative group flex flex-col items-center">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  selectedCategory !== 'All' 
                    ? 'bg-[#2796a9]/10 border-[#2796a9] text-[#2796a9] shadow-[0_0_10px_rgba(39,150,169,0.2)]' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}>
                  <Grid size={18} />
                </div>
                {selectedCategory !== 'All' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#2796a9] ring-2 ring-slate-900" />
                )}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-md">
                  Category: {selectedCategory}
                </div>
              </div>

              {/* Brand Icon */}
              <div className="relative group flex flex-col items-center">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  selectedBrand !== 'All' 
                    ? 'bg-[#2796a9]/10 border-[#2796a9] text-[#2796a9] shadow-[0_0_10px_rgba(39,150,169,0.2)]' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}>
                  <Award size={18} />
                </div>
                {selectedBrand !== 'All' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#2796a9] ring-2 ring-slate-900" />
                )}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-md">
                  Brand: {selectedBrand}
                </div>
              </div>

              {/* Type Icon */}
              <div className="relative group flex flex-col items-center">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  selectedType !== 'All' 
                    ? 'bg-[#2796a9]/10 border-[#2796a9] text-[#2796a9] shadow-[0_0_10px_rgba(39,150,169,0.2)]' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}>
                  <Wrench size={18} />
                </div>
                {selectedType !== 'All' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#2796a9] ring-2 ring-slate-900" />
                )}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-md">
                  Type: {selectedType}
                </div>
              </div>

              {/* Sub-Type Icon */}
              <div className="relative group flex flex-col items-center">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  selectedSubType !== 'All' 
                    ? 'bg-[#2796a9]/10 border-[#2796a9] text-[#2796a9] shadow-[0_0_10px_rgba(39,150,169,0.2)]' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}>
                  <Sliders size={18} />
                </div>
                {selectedSubType !== 'All' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#2796a9] ring-2 ring-slate-900" />
                )}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-md">
                  Sub-Type: {selectedSubType}
                </div>
              </div>

              {/* Model Icon */}
              <div className="relative group flex flex-col items-center">
                <div className={`p-2.5 rounded-xl border transition-all ${
                  selectedModel !== 'All' 
                    ? 'bg-[#2796a9]/10 border-[#2796a9] text-[#2796a9] shadow-[0_0_10px_rgba(39,150,169,0.2)]' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}>
                  <Cpu size={18} />
                </div>
                {selectedModel !== 'All' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#2796a9] ring-2 ring-slate-900" />
                )}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-900 border border-slate-800 text-[10px] text-white rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-md">
                  Model: {selectedModel}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Right Content Area (Hero, Categories, Brands, Catalog Grid) */}
        <main className="flex-grow min-w-0 flex flex-col relative z-10">

          {/* Layer 1: Slides over Sticky Spotlight (z-20, relative, bg-slate-950, shadow) */}
          <div className="relative z-20 shadow-[0_15px_30px_rgba(0,0,0,0.5)] bg-slate-950">
        {/* 1. HERO CAROUSEL */}
        <div className="relative pt-24 h-[65vh] w-full overflow-hidden">
          {carouselSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <motion.div
                key={idx}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 1.2, ease: 'easeInOut' }}
              >
                {/* Radial overlay */}
                <div className="absolute inset-0 bg-slate-950/80 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/30" />

                <div className="h-full flex flex-col justify-center px-8 md:px-20 lg:px-32 max-w-4xl relative z-10">
                  <span className="text-[#2796a9] text-xs font-bold tracking-[0.25em] mb-4 bg-[#2796a9]/10 px-3 py-1 rounded-full self-start">
                    {slide.tag}
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
                    {slide.title}
                  </h1>
                  <p className="text-slate-300 text-base md:text-lg mb-8 font-light max-w-xl">
                    {slide.subtitle}
                  </p>
                  <button
                    onClick={scrollToCatalog}
                    className="px-6 py-3 bg-[#04667b] hover:bg-[#2796a9] text-white font-semibold text-sm rounded shadow-lg transition-all self-start flex items-center gap-2"
                  >
                    Browse Catalog
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 2. BROWSE BY CATEGORY */}
        <section className="py-16 px-6 md:px-16 lg:px-28 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10 text-center md:text-left">
              <span className="text-[#2796a9] text-xs font-bold tracking-[0.2em] uppercase">Departments</span>
              <h2 className="text-3xl font-extrabold text-white mt-2">Browse by Category</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'Power Tools',
                  desc: 'Drilling, core-cutting, and dynamic high-performance motor tools.',
                  image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png'
                },
                {
                  name: 'Safety Equipment',
                  desc: 'Certified industrial helmets, cut-resistant gloves, and safety goggles.',
                  image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278562/port/i57qdajixxllurowpkev.jpg'
                },
                {
                  name: 'Industrial Cleaning',
                  desc: 'High-pressure washers, vacuums, and heavy emission filters.',
                  image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278569/port/uyvemispshvvtup3frea.jpg'
                },
                {
                  name: 'Accessories',
                  desc: 'Abrasive discs, sanding polyurethane blocks, and modular storage units.',
                  image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278522/port/zhzh2v9rozlz7q6askvl.jpg'
                }
              ].map((cat) => {
                const isSelected = selectedCategory === cat.name;
                return (
                  <div
                    key={cat.name}
                    onClick={() => handleCategorySelect(cat.name)}
                    className={`group relative h-64 rounded-2xl overflow-hidden cursor-pointer border transition-all duration-500 shadow-lg ${
                      isSelected
                        ? 'border-[#2796a9] shadow-[0_0_20px_rgba(39,150,169,0.3)] scale-[1.02]'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {/* Background Image */}
                    <div
                      className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url(${cat.image})` }}
                    />
                    {/* Overlays */}
                    <div className="absolute inset-0 bg-slate-950/80 group-hover:bg-slate-950/70 transition-colors" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                    {/* Content */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2 group-hover:text-[#2796a9] transition-colors">
                        {cat.name}
                        <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-5px] group-hover:translate-x-0 duration-300" />
                      </h3>
                      <p className="text-slate-400 text-xs font-light leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Layer 2: Brand Spotlight Sticky Parallax Background */}
      {(() => {
        const c1 = config?.partnersBgColor1 || '#112A4F';
        const c2 = config?.partnersBgColor2 || '#040C19';
        const c3 = config?.partnersBgColor3 || '#02060C';
        
        // Combine brandLogos into a single repeated scrolling marquee track
        const row = [...brandLogos, ...brandLogos, ...brandLogos];

        return (
          <div
            id="brand-spotlight"
            className="sticky top-0 z-10 w-full min-h-[100svh] flex flex-col justify-center overflow-hidden py-16 px-6 md:px-16 lg:px-28"
            style={{ background: `radial-gradient(ellipse at center, ${c1} 0%, ${c2} 65%, ${c3} 100%)` }}
          >
            <style>
              {`
                @keyframes marqueeLeft {
                  0% { transform: translateX(0%); }
                  100% { transform: translateX(-50%); }
                }
                .animate-marquee-left {
                  animation: marqueeLeft 45s linear infinite;
                }
                .pause-on-hover:hover {
                  animation-play-state: paused;
                }
                .logo-img {
                  transform: scale(var(--base-scale, 1));
                }
                .group:hover .logo-img {
                  transform: scale(calc(var(--base-scale, 1) * 1.05));
                }
              `}
            </style>

            <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-12">
              <div className="text-center">
                <span className="text-[#2796a9] text-xs font-bold tracking-[0.20em] uppercase">Partners</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1">Brand Spotlight</h3>
              </div>

              {/* Single Row Infinite Marquee Carousel */}
              <div className="w-full relative">
                <div
                  className="relative flex w-full overflow-hidden"
                  style={{
                    maskImage: 'linear-gradient(to right, transparent, white 8rem, white calc(100% - 8rem), transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, white 8rem, white calc(100% - 8rem), transparent)'
                  }}
                >
                  <div className="flex w-max animate-marquee-left pause-on-hover">
                    {/* Set 1 */}
                    <div className="flex gap-8 md:gap-16 items-center flex-shrink-0 px-8">
                      {row.map((brand, idx) => {
                        const isSelected = selectedBrand === brand.name;
                        return (
                          <div
                            key={`b-set1-${idx}`}
                            onClick={() => handleBrandSelect(brand.name)}
                            className={`group flex-shrink-0 w-32 md:w-48 h-16 md:h-24 flex items-center justify-center p-3 cursor-pointer transition-all duration-300 ${
                              isSelected 
                                ? 'border border-[#2796a9]/60 bg-slate-950/80 shadow-[0_0_20px_rgba(39,150,169,0.4)] rounded-2xl scale-105' 
                                : 'border border-transparent hover:border-slate-800/40 hover:bg-slate-950/20 hover:rounded-2xl'
                            }`}
                            title={`Click to filter by ${brand.name}`}
                          >
                            <img
                              src={brand.src}
                              alt={brand.name}
                              className={`max-w-full max-h-full object-contain transition-all duration-500 logo-img ${
                                isSelected 
                                  ? 'brightness-100 invert-0 opacity-100' 
                                  : 'brightness-0 invert opacity-60 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100'
                              }`}
                              style={{ '--base-scale': String(brand.scale || 1) }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Set 2 */}
                    <div className="flex gap-8 md:gap-16 items-center flex-shrink-0 px-8">
                      {row.map((brand, idx) => {
                        const isSelected = selectedBrand === brand.name;
                        return (
                          <div
                            key={`b-set2-${idx}`}
                            onClick={() => handleBrandSelect(brand.name)}
                            className={`group flex-shrink-0 w-32 md:w-48 h-16 md:h-24 flex items-center justify-center p-3 cursor-pointer transition-all duration-300 ${
                              isSelected 
                                ? 'border border-[#2796a9]/60 bg-slate-950/80 shadow-[0_0_20px_rgba(39,150,169,0.4)] rounded-2xl scale-105' 
                                : 'border border-transparent hover:border-slate-800/40 hover:bg-slate-950/20 hover:rounded-2xl'
                            }`}
                            title={`Click to filter by ${brand.name}`}
                          >
                            <img
                              src={brand.src}
                              alt={brand.name}
                              className={`max-w-full max-h-full object-contain transition-all duration-500 logo-img ${
                                isSelected 
                                  ? 'brightness-100 invert-0 opacity-100' 
                                  : 'brightness-0 invert opacity-60 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100'
                              }`}
                              style={{ '--base-scale': String(brand.scale || 1) }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Layer 3: Catalog & Footer (z-30, relative, bg-slate-950, shadow) */}
      <div className="relative z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] bg-slate-950">

      {/* 4. PRODUCT CATALOG */}
      <section ref={catalogRef} id="catalog-section" className="py-20 px-6 md:px-16 lg:px-28 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col w-full">

          {/* MAIN PRODUCT AREA */}
          <div className="w-full">
            {/* SEARCH AND CONTROLS */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-4 top-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search products by SKU, name, brand, model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-[#2796a9] text-white"
                />
              </div>

              {/* Layout and Sort */}
              <div className="flex items-center justify-end gap-4">
                {/* Sort */}
                <div className="relative flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-light">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#2796a9] cursor-pointer"
                  >
                    <option value="name-asc">Product Name (A-Z)</option>
                    <option value="newest">Newest Uploads</option>
                  </select>
                </div>

                {/* View toggles */}
                <div className="flex items-center border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-[#04667b] text-white' : 'text-slate-400 hover:text-white'}`}
                    aria-label="Grid View"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-[#04667b] text-white' : 'text-slate-400 hover:text-white'}`}
                    aria-label="List View"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* RESULTS COUNT & FILTER TAGS */}
            <div className="flex items-center justify-between mb-6 text-sm text-slate-400 font-light">
              <div>
                Showing <span className="text-white font-semibold">{filteredProducts.length}</span> industrial products
              </div>
            </div>

            {/* PRODUCT GRID/LIST VIEW */}
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
                <Info size={48} className="text-slate-600 mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">No Products Found</h4>
                <p className="text-slate-400 text-sm font-light text-center max-w-sm px-6">
                  We couldn't find matches for your search. Try resetting some filters in the sidebar.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <motion.div
                    key={p.product_id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden shadow-md flex flex-col h-full group"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Image Area */}
                    <div
                      className="h-48 w-full bg-slate-950 flex items-center justify-center p-6 cursor-pointer relative"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <img
                        src={p.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={p.product_name}
                        className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-300"
                      />
                      <span className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[10px] text-slate-400 font-medium px-2 py-0.5 rounded">
                        {p.brand}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-[11px] text-slate-500 font-light tracking-wide mb-1 block">
                        Model: {p.model} | SKU: {p.sku}
                      </div>
                      <h4
                        className="font-bold text-base text-white hover:text-[#2796a9] cursor-pointer mb-2 line-clamp-1"
                        onClick={() => setSelectedProduct(p)}
                      >
                        {p.product_name}
                      </h4>
                      <p className="text-slate-400 text-xs font-light leading-relaxed mb-6 line-clamp-2">
                        {p.description}
                      </p>

                      {/* Actions */}
                      <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="px-4 py-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Info size={14} />
                          Quick View
                        </button>
                        <button
                          onClick={() => addToQuote(p)}
                          className="px-4 py-2 bg-[#04667b] hover:bg-[#2796a9] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <ShoppingCart size={14} />
                          Add to Quote
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {filteredProducts.map((p) => (
                  <motion.div
                    key={p.product_id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden shadow-md p-6 flex flex-col sm:flex-row items-center gap-6 group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Image Area */}
                    <div
                      className="w-32 h-32 bg-slate-950 rounded-xl flex items-center justify-center p-3 cursor-pointer flex-shrink-0"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <img
                        src={p.images?.[0] || 'https://via.placeholder.com/150'}
                        alt={p.product_name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col h-full text-center sm:text-left">
                      <div className="text-[11px] text-slate-500 font-light tracking-wide mb-1 block">
                        Brand: <span className="text-slate-300 font-medium">{p.brand}</span> | Model: {p.model} | SKU: {p.sku}
                      </div>
                      <h4
                        className="font-bold text-lg text-white hover:text-[#2796a9] cursor-pointer mb-2"
                        onClick={() => setSelectedProduct(p)}
                      >
                        {p.product_name}
                      </h4>
                      <p className="text-slate-400 text-xs font-light leading-relaxed mb-4 line-clamp-2 max-w-2xl">
                        {p.description}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col items-stretch justify-center gap-2 flex-shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => setSelectedProduct(p)}
                        className="px-4 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Info size={14} />
                        Quick View
                      </button>
                      <button
                        onClick={() => addToQuote(p)}
                        className="px-4 py-2.5 bg-[#04667b] hover:bg-[#2796a9] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ShoppingCart size={14} />
                        Add to Quote
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
      </div>
      </main>
      </div>

      {/* ==================================== MODAL OVERLAYS ==================================== */}

      {/* A. PRODUCT DETAILS MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto z-10 shadow-2xl p-6 md:p-10"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                {/* Left side: Images */}
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-950 rounded-2xl p-8 flex items-center justify-center h-80 md:h-[400px]">
                    <img
                      src={selectedProduct.images?.[0] || 'https://via.placeholder.com/500x300'}
                      alt={selectedProduct.product_name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  {/* Thumbnails if available (we will list our list of images) */}
                  <div className="flex gap-2">
                    {selectedProduct.images?.map((img, i) => (
                      <div key={i} className="w-20 h-20 bg-slate-950 border-2 border-[#2796a9] rounded-xl flex items-center justify-center p-2 cursor-pointer">
                        <img src={img} alt="thumbnail" className="max-h-full max-w-full object-contain" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Information */}
                <div className="flex flex-col">
                  <span className="text-[#2796a9] text-xs font-bold tracking-widest uppercase mb-2 block">
                    {selectedProduct.brand} | {selectedProduct.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2 leading-snug">
                    {selectedProduct.product_name}
                  </h2>
                  <div className="text-xs text-slate-500 font-light mb-6 block">
                    Product ID: <span className="text-slate-300 font-medium">{selectedProduct.product_id}</span> | SKU: <span className="text-slate-300 font-medium">{selectedProduct.sku}</span> | Model: <span className="text-slate-300 font-medium">{selectedProduct.model}</span>
                  </div>

                  <div className="mb-8">
                    <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Technical Description</h5>
                    <p className="text-slate-300 text-sm leading-relaxed font-light">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Structured specs table */}
                  <div className="mb-8">
                    <h5 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Datasheet Specifications</h5>
                    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900 border-b border-slate-800 text-[#2796a9] font-bold">
                            <th className="p-3">Parameter</th>
                            <th className="p-3">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {parseSpecifications(selectedProduct.specifications).map((spec, index) => (
                            <tr key={index} className="hover:bg-slate-900/30">
                              <td className="p-3 font-semibold text-slate-400 w-1/3">{spec.parameter}</td>
                              <td className="p-3">{spec.value || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-6 border-t border-slate-800 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                    <button
                      onClick={() => {
                        addToQuote(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="flex-1 py-3 px-6 bg-[#04667b] hover:bg-[#2796a9] text-white rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-md transition-all cursor-pointer"
                    >
                      <ShoppingCart size={18} />
                      Add to Quote Cart
                    </button>
                  </div>
                </div>
              </div>

              {/* Related Products Section */}
              <div className="mt-12 pt-8 border-t border-slate-800">
                <h4 className="text-lg font-bold text-white mb-6">Related Products</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {products
                    .filter(p => p.category === selectedProduct.category && p.product_id !== selectedProduct.product_id)
                    .slice(0, 3)
                    .map(rel => (
                      <div
                        key={rel.product_id}
                        onClick={() => {
                          setSelectedProduct(rel);
                        }}
                        className="bg-slate-950/60 border border-slate-800 hover:border-slate-700 p-4 rounded-xl flex items-center gap-4 cursor-pointer group"
                      >
                        <div className="w-16 h-16 bg-slate-950 flex items-center justify-center p-2 rounded-lg flex-shrink-0">
                          <img src={rel.images?.[0]} alt={rel.product_name} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-bold text-sm text-slate-200 group-hover:text-[#2796a9] truncate mb-1">{rel.product_name}</h5>
                          <span className="text-[10px] text-slate-500">{rel.brand} | {rel.model}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* B. QUOTE CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckingOut(false);
              }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col z-10 p-6 md:p-8"
            >
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="text-[#2796a9]" size={20} />
                  Quote Cart
                  {totalCartCount > 0 && (
                    <span className="text-xs bg-[#2796a9]/10 text-[#2796a9] border border-[#2796a9]/20 px-2 py-0.5 rounded-full font-bold">
                      {totalCartCount} items
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckingOut(false);
                  }}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* CART CONTENT */}
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <ShoppingCart size={48} className="text-slate-700 mb-4" />
                  <h4 className="text-lg font-bold text-white mb-2">Your Quote Cart is Empty</h4>
                  <p className="text-slate-400 text-xs font-light max-w-xs mb-8">
                    Browse our high-performance tool catalog and add products to request a quotation.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-3 bg-[#04667b] hover:bg-[#2796a9] text-white rounded-lg text-sm font-semibold transition-all cursor-pointer"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : !isCheckingOut ? (
                /* CART LIST VIEW */
                <>
                  <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4">
                    {cart.map((item) => (
                      <div key={item.product_id} className="flex gap-4 p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl relative group">
                        {/* Image */}
                        <div className="w-16 h-16 bg-slate-950 rounded-lg flex items-center justify-center p-2 flex-shrink-0">
                          <img src={item.images?.[0]} alt={item.product_name} className="max-h-full max-w-full object-contain" />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0 pr-6">
                          <h4 className="font-bold text-sm text-slate-100 truncate mb-1">{item.product_name}</h4>
                          <div className="text-[10px] text-slate-500 mb-2 truncate">Model: {item.model} | Brand: {item.brand}</div>
                          {/* Qty edit */}
                          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg w-fit px-2 py-0.5">
                            <button
                              onClick={() => updateCartQty(item.product_id, -1)}
                              className="text-slate-400 hover:text-white p-1"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold text-white px-2">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQty(item.product_id, 1)}
                              className="text-slate-400 hover:text-white p-1"
                              aria-label="Increase quantity"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        {/* Remove */}
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="absolute top-4 right-4 p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-800 mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400 font-light">Quote Cart Total Items:</span>
                      <span className="font-bold text-white">{totalCartCount}</span>
                    </div>
                    {user ? (
                      <button
                        onClick={() => setIsCheckingOut(true)}
                        className="w-full py-3.5 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                      >
                        Request Quote
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            setAuthTab('login');
                            setIsAuthOpen(true);
                          }}
                          className="w-full py-3 bg-[#04667b] hover:bg-[#2796a9] text-white rounded-xl text-xs font-semibold text-center cursor-pointer transition-all"
                        >
                          Login / Sign Up to Submit Request
                        </button>
                        <p className="text-[10px] text-slate-500 font-light text-center">
                          A customer account is required to generate and process procurement quotations.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* CHECKOUT SUBMISSION FORM */
                <form onSubmit={handleQuoteSubmit} className="flex-1 flex flex-col h-full justify-between">
                  <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-5 pr-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">Submit Quote Request</h4>
                      <button
                        type="button"
                        onClick={() => setIsCheckingOut(false)}
                        className="text-xs text-[#2796a9] font-medium"
                      >
                        Back to Items List
                      </button>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400">Requestor Name *</label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.name}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#2796a9]"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400">Company Name *</label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.company}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, company: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#2796a9]"
                        placeholder="Industrial Solutions Ltd"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={checkoutForm.email}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#2796a9]"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={checkoutForm.phone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#2796a9]"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-semibold text-slate-400">Project / Inquiry Notes</label>
                      <textarea
                        value={checkoutForm.message}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, message: e.target.value })}
                        rows={4}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#2796a9] resize-none"
                        placeholder="Specify any special logistics, deadline details, or bulk requests here..."
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800 mt-auto flex flex-col gap-3">
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                    >
                      Submit Quote Request
                    </button>
                    <p className="text-[10px] text-slate-500 font-light text-center leading-relaxed">
                      By submitting, you agree to our MRO procurement workflow. A representative will contact you with a pricing worksheet.
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* C. AUTH MODAL (MOCK) */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden z-10 shadow-2xl p-8"
            >
              <button
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              <div className="flex border-b border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all ${
                    authTab === 'login' ? 'border-[#2796a9] text-[#2796a9]' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthTab('signup')}
                  className={`flex-1 pb-3 text-center text-sm font-bold border-b-2 transition-all ${
                    authTab === 'signup' ? 'border-[#2796a9] text-[#2796a9]' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4 text-left">
                {authTab === 'signup' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-400">Username</label>
                    <input
                      type="text"
                      name="username"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#2796a9]"
                      placeholder="john_doe"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#2796a9]"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-400">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-[#2796a9]"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all mt-2"
                >
                  {authTab === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D. QUOTE SUCCESS RECEIPT PAGE (MODAL OVERLAY FOR FULL FOCUS) */}
      <AnimatePresence>
        {quoteSuccessData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden z-10 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 md:p-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-500" size={32} />
                  <div>
                    <h3 className="text-xl font-bold text-white">Quote Submitted Successfully</h3>
                    <span className="text-xs text-[#2796a9] font-medium tracking-wide">
                      Reference ID: {quoteSuccessData.referenceId}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setQuoteSuccessData(null)}
                  className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Receipt Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6 text-left">
                {/* Intro message */}
                <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                  <p className="text-slate-300 text-sm font-light leading-relaxed">
                    Thank you for choosing **Concept Tools and Services (CTS)**. Our sales and engineering team will review your worksheet specifications, check available lead times, and contact you with a formal quotation shortly.
                  </p>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="text-xs font-bold text-[#2796a9] tracking-wider uppercase mb-3">Customer Information</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/30 p-4 border border-slate-800/80 rounded-xl text-sm">
                    <div>
                      <span className="text-slate-500 font-light block text-xs">Requestor:</span>
                      <span className="text-slate-200 font-semibold">{quoteSuccessData.customerDetails.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-light block text-xs">Company:</span>
                      <span className="text-slate-200 font-semibold">{quoteSuccessData.customerDetails.company}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-light block text-xs">Email Address:</span>
                      <span className="text-slate-200 font-semibold">{quoteSuccessData.customerDetails.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-light block text-xs">Phone Number:</span>
                      <span className="text-slate-200 font-semibold">{quoteSuccessData.customerDetails.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Items Summary */}
                <div>
                  <h4 className="text-xs font-bold text-[#2796a9] tracking-wider uppercase mb-3">Requested Products Summary</h4>
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                          <th className="p-3">Product details</th>
                          <th className="p-3 text-center">SKU</th>
                          <th className="p-3 text-center">Model</th>
                          <th className="p-3 text-center">Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {quoteSuccessData.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/30">
                            <td className="p-3">
                              <span className="font-semibold text-slate-100 block">{item.product_name}</span>
                              <span className="text-[10px] text-slate-500">{item.brand}</span>
                            </td>
                            <td className="p-3 text-center text-slate-400 font-mono">{item.sku}</td>
                            <td className="p-3 text-center text-slate-400">{item.model}</td>
                            <td className="p-3 text-center font-bold text-white">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="p-6 md:p-8 border-t border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => downloadSummaryPdf(quoteSuccessData.referenceId)}
                  className="px-5 py-2.5 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={16} />
                  Print/Download Sheet
                </button>
                <button
                  onClick={() => setQuoteSuccessData(null)}
                  className="px-5 py-2.5 bg-[#04667b] hover:bg-[#2796a9] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  Return to Shop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
