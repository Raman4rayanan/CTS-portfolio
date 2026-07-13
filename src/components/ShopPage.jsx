import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Grid,
  List,
  ChevronRight,
  ChevronLeft,
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
  Cpu,
  ArrowUp
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

// Carousel items placeholder (will be replaced by state on mount)

export default function ShopPage() {
  const location = useLocation();
  const [config, setConfig] = useState(null);
  const [brandsList, setBrandsList] = useState([]);
  const [carouselSlides, setCarouselSlides] = useState([
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
  ]);

  const currentBrandsList = (brandsList.length > 0 ? brandsList : brandLogos).map(b => {
    const nameLower = b.name.toLowerCase();
    let fallbackLogo = '';
    if (nameLower.includes('bosch')) {
      fallbackLogo = 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278517/port/svdnbsmz2mkirhr9oqes.png';
    } else if (nameLower.includes('atlas')) {
      fallbackLogo = 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278516/port/hym3rag4eal3xxn9bx6d.png';
    } else if (nameLower.includes('eibenstock')) {
      fallbackLogo = 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782278519/port/wkn0oyaxl2jgzwklcupo.png';
    } else {
      fallbackLogo = 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png';
    }

    const matchingPortfolioPartner = config?.partners?.find(
      p => p.name.toLowerCase().replace(/[\s_-]+/g, '') === b.name.toLowerCase().replace(/[\s_-]+/g, '')
    );

    const rawSrc = matchingPortfolioPartner?.src || b.logoUrl || b.src;
    const hasValidSrc = rawSrc && !rawSrc.includes('placeholder.png') && rawSrc.trim() !== '';

    return {
      name: b.name,
      src: hasValidSrc ? rawSrc : fallbackLogo,
      scale: matchingPortfolioPartner?.scale || b.scale || 1
    };
  });

  // Fetch portfolio settings config
  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiBaseUrl}/api/portfolio/config?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setConfig(data.data);
          if (data.data.ecommSlides && data.data.ecommSlides.length > 0) {
            setCarouselSlides(data.data.ecommSlides);
          }
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
  const [currentView, setCurrentView] = useState('home');
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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedSubTypes, setSelectedSubTypes] = useState([]);
  const [selectedModels, setSelectedModels] = useState([]);
  const [typeSearch, setTypeSearch] = useState('');
  const [subTypeSearch, setSubTypeSearch] = useState('');
  const [modelSearch, setModelSearch] = useState('');
  const [displayLimit, setDisplayLimit] = useState(12);
  const [sortBy, setSortBy] = useState('name-asc'); // name-asc, newest
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  const [ecommConfig, setEcommConfig] = useState({
    showBrandSpotlight: true,
    brandSpotlightTag: 'Partners',
    brandSpotlightTitle: 'Brand Spotlight',
    showNewlyAdded: true,
    newlyAddedTag: 'Latest Arrivals',
    newlyAddedTitle: 'Newly Added Products',
    newlyAddedSubtitle: 'Explore the latest cutting-edge industrial equipment and tools recently added to our catalog.',
    newlyAddedLimit: 8
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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

  // Initialize products and brands list from backend API
  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const loadProducts = async (approvedBrands) => {
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

      try {
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

    const fetchBrandsAndProducts = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/ecomm/brands`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setBrandsList(data.data);
          const names = data.data.map(b => b.name);
          loadProducts(names);
        } else {
          const defaultNames = brandLogos.map(b => b.name);
          loadProducts(defaultNames);
        }
      } catch (e) {
        console.error(e);
        const defaultNames = brandLogos.map(b => b.name);
        loadProducts(defaultNames);
      }
    };

    const fetchConfig = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/ecomm/config`);
        const data = await res.json();
        if (data.success && data.data) {
          setEcommConfig({
            showBrandSpotlight: data.data.showBrandSpotlight ?? true,
            brandSpotlightTag: data.data.brandSpotlightTag || 'Partners',
            brandSpotlightTitle: data.data.brandSpotlightTitle || 'Brand Spotlight',
            showNewlyAdded: data.data.showNewlyAdded ?? true,
            newlyAddedTag: data.data.newlyAddedTag || 'Latest Arrivals',
            newlyAddedTitle: data.data.newlyAddedTitle || 'Newly Added Products',
            newlyAddedSubtitle: data.data.newlyAddedSubtitle || 'Explore the latest cutting-edge industrial equipment and tools recently added to our catalog.',
            newlyAddedLimit: data.data.newlyAddedLimit ?? 8
          });
        }
      } catch (e) {
        console.error('Failed to fetch ecomm config:', e);
      }
    };

    fetchBrandsAndProducts();
    fetchConfig();
  }, []);

  // Route State Handling
  useEffect(() => {
    if (location.state && location.state.category) {
      if (Array.isArray(location.state.category)) {
        setSelectedCategories(location.state.category);
      } else {
        setSelectedCategories([location.state.category]);
      }
      setCurrentView('products');
      setTimeout(() => {
        window.scrollTo({ top: 500, behavior: 'smooth' });
      }, 300);
      
      // Clear the state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    const selectedCategory = selectedCategories[0] || 'All';
    const productsForBrand = products.filter(p => {
      return selectedCategory === 'All' || p.category === selectedCategory;
    });
    productsForBrand.forEach(p => {
      if (p.brand) options.brands.add(p.brand);
    });

    // 3. Types depend on Category and Brand selections
    const selectedBrand = selectedBrands[0] || 'All';
    const productsForType = productsForBrand.filter(p => {
      return selectedBrand === 'All' || p.brand === selectedBrand;
    });
    productsForType.forEach(p => {
      if (p.type) options.types.add(p.type);
    });

    // 4. Sub-Types depend on Category, Brand, and Type selections
    const selectedType = selectedTypes[0] || 'All';
    const productsForSubType = productsForType.filter(p => {
      return selectedType === 'All' || p.type === selectedType;
    });
    productsForSubType.forEach(p => {
      if (p.sub_type) options.subTypes.add(p.sub_type);
    });

    // 5. Models depend on Category, Brand, Type, and Sub-Type selections
    const selectedSubType = selectedSubTypes[0] || 'All';
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
  }, [products, selectedCategories, selectedBrands, selectedTypes, selectedSubTypes]);

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
    if (selectedCategories.length > 0 && !selectedCategories.includes('All')) {
      result = result.filter(p => p.category && selectedCategories.includes(p.category));
    }

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes('All')) {
      result = result.filter(p => p.brand && selectedBrands.includes(p.brand));
    }

    // Type filter
    if (selectedTypes.length > 0 && !selectedTypes.includes('All')) {
      result = result.filter(p => p.type && selectedTypes.includes(p.type));
    }

    // Sub-type filter
    if (selectedSubTypes.length > 0 && !selectedSubTypes.includes('All')) {
      result = result.filter(p => p.sub_type && selectedSubTypes.includes(p.sub_type));
    }

    // Model filter
    if (selectedModels.length > 0 && !selectedModels.includes('All')) {
      result = result.filter(p => p.model && selectedModels.includes(p.model));
    }

    // Sort
    if (sortBy === 'name-asc') {
      result.sort((a, b) => (a.product_name || '').localeCompare(b.product_name || ''));
    } else if (sortBy === 'newest') {
      // Simulate ordering by ID/SKU descending
      result.sort((a, b) => (b.product_id || '').localeCompare(a.product_id || ''));
    }

    return result;
  }, [products, searchQuery, selectedCategories, selectedBrands, selectedTypes, selectedSubTypes, selectedModels, sortBy]);

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

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, displayLimit);
  }, [filteredProducts, displayLimit]);

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
    showToast(`"${product.product_name}" is now added to the cart`);
    setIsCartOpen(true);
  };

  const updateCartQty = (productId, amount) => {
    setCart(prev => {
      const itemIndex = prev.findIndex(item => item.product_id === productId);
      if (itemIndex === -1) return prev;
      
      const newQty = prev[itemIndex].quantity + amount;
      if (newQty < 1) {
        const remaining = prev.filter(item => item.product_id !== productId);
        if (remaining.length === 0) {
          showToast("Cart is empty");
        } else {
          showToast(`"${prev[itemIndex].product_name}" removed from cart`);
        }
        return remaining;
      }
      
      return prev.map(item =>
        item.product_id === productId
          ? { ...item, quantity: newQty }
          : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const itemIndex = prev.findIndex(item => item.product_id === productId);
      if (itemIndex === -1) return prev;
      
      const remaining = prev.filter(item => item.product_id !== productId);
      if (remaining.length === 0) {
        showToast("Cart is empty");
      } else {
        showToast(`"${prev[itemIndex].product_name}" removed from cart`);
      }
      return remaining;
    });
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (category) => {
    setSelectedCategories([category]);
    // Reset all child filters to avoid impossible states
    setSelectedBrands([]);
    setSelectedTypes([]);
    setSelectedSubTypes([]);
    setSelectedModels([]);
    setCurrentView('products');
    scrollToCatalog();
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrands([brand]);
    // Reset lower child filters
    setSelectedTypes([]);
    setSelectedSubTypes([]);
    setSelectedModels([]);
    setCurrentView('products');
    scrollToCatalog();
  };

  const handleTypeSelect = (type) => {
    setSelectedTypes([type]);
    // Reset lower child filters
    setSelectedSubTypes([]);
    setSelectedModels([]);
    setCurrentView('products');
    scrollToCatalog();
  };

  const handleSubTypeSelect = (subType) => {
    setSelectedSubTypes([subType]);
    // Reset lower child filters
    setSelectedModels([]);
    setCurrentView('products');
    scrollToCatalog();
  };

  const handleModelSelect = (model) => {
    setSelectedModels([model]);
    setCurrentView('products');
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

  // Submit quote request to backend DB
  const handleQuoteSubmit = async (e) => {
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
        quantity: item.quantity,
        unitPrice: 0
      })),
      date: new Date().toISOString(),
      status: 'Pending'
    };

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBaseUrl}/api/ecomm/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quoteObj)
      });
      const data = await res.json();
      if (data.success) {
        const savedQuotes = JSON.parse(localStorage.getItem('cts_quotes') || '[]');
        savedQuotes.push(data.data);
        localStorage.setItem('cts_quotes', JSON.stringify(savedQuotes));

        setCart([]);
        setIsCartOpen(false);
        setIsCheckingOut(false);
        setQuoteSuccessData(data.data);
      } else {
        alert(data.error || 'Failed to submit quote request.');
      }
    } catch (err) {
      console.error(err);
      const savedQuotes = JSON.parse(localStorage.getItem('cts_quotes') || '[]');
      savedQuotes.push(quoteObj);
      localStorage.setItem('cts_quotes', JSON.stringify(savedQuotes));

      setCart([]);
      setIsCartOpen(false);
      setIsCheckingOut(false);
      setQuoteSuccessData(quoteObj);
    }
  };

  // Simulate print/download details
  const downloadSummaryPdf = (refId) => {
    window.print();
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Global Navbar */}
      <Navbar 
        isVisible={true} 
        isShop={true}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
        currentEcommView={currentView}
        onNavigateEcomm={(view) => setCurrentView(view)}
        products={products}
      />

      {/* Main Page Layout Container: Sidebar on Left, Sections on Right */}
      <div className={`flex flex-col lg:flex-row min-h-screen ${currentView === 'products' ? 'pt-24' : ''}`}>
        
        {/* SIDEBAR FILTERS WRAPPER (Persistent throughout the eCommerce page, expanded on desktop) */}
        {currentView === 'products' && (
        <div 
          className="relative w-full lg:w-80 shrink-0 z-30 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)] flex flex-col"
        >
          <aside 
            className="w-full lg:absolute lg:top-0 lg:left-0 lg:h-full border-b lg:border-r border-slate-800 bg-slate-900/90 backdrop-blur-md z-30 flex flex-col lg:w-80 p-6 lg:overflow-y-auto"
          >
            {/* Expanded Sidebar Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 w-full">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <SlidersHorizontal size={18} />
                Filters
              </h3>
              {(selectedCategories.length > 0 || selectedBrands.length > 0 || selectedTypes.length > 0 || selectedSubTypes.length > 0 || selectedModels.length > 0 || searchQuery !== '') && (
                <button
                  onClick={() => {
                    setSelectedCategories([]);
                    setSelectedBrands([]);
                    setSelectedTypes([]);
                    setSelectedSubTypes([]);
                    setSelectedModels([]);
                    setSearchQuery('');
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Expanded Filters Checkboxes */}
            <div className="flex flex-col gap-6 w-full text-left">
              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold text-[#2796a9] tracking-wider uppercase block mb-3">Category</label>
                <div className="flex flex-col gap-2 pr-2">
                  {filterOptions.categories.map(c => (
                    <label key={c} className="flex items-center gap-3 cursor-pointer text-sm text-slate-300 hover:text-white transition-colors group">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(c)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedCategories([...selectedCategories, c]);
                            else setSelectedCategories(selectedCategories.filter(x => x !== c));
                            setCurrentView('products');
                            scrollToCatalog();
                          }}
                          className="peer appearance-none w-4 h-4 border border-slate-700 rounded bg-slate-950 checked:bg-[#2796a9] checked:border-[#2796a9] transition-all cursor-pointer"
                        />
                        <CheckCircle size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                      </div>
                      <span className="group-hover:text-white">{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="text-xs font-bold text-[#2796a9] tracking-wider uppercase block mb-3">Brand</label>
                <div className="flex flex-col gap-2 pr-2">
                  {filterOptions.brands.map(b => (
                    <label key={b} className="flex items-center gap-3 cursor-pointer text-sm text-slate-300 hover:text-white transition-colors group">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(b)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedBrands([...selectedBrands, b]);
                            else setSelectedBrands(selectedBrands.filter(x => x !== b));
                            setCurrentView('products');
                            scrollToCatalog();
                          }}
                          className="peer appearance-none w-4 h-4 border border-slate-700 rounded bg-slate-950 checked:bg-[#2796a9] checked:border-[#2796a9] transition-all cursor-pointer"
                        />
                        <CheckCircle size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                      </div>
                      <span className="group-hover:text-white">{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
                <div>
                  <label className="text-xs font-bold text-[#2796a9] tracking-wider uppercase block mb-3">Type</label>
                  <input
                    type="text"
                    placeholder="Search type..."
                    value={typeSearch}
                    onChange={e => setTypeSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#2796a9] outline-none mb-3 placeholder:text-slate-600"
                  />
                  <div className="flex flex-col gap-2">
                    {filterOptions.types
                      .filter(t => t.toLowerCase().includes(typeSearch.toLowerCase()))
                      .slice(0, 4)
                      .map(t => (
                      <label key={t} className="flex items-center gap-3 cursor-pointer text-sm text-slate-300 hover:text-white transition-colors group">
                        <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedTypes.includes(t)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedTypes([...selectedTypes, t]);
                              else setSelectedTypes(selectedTypes.filter(x => x !== t));
                              setCurrentView('products');
                              scrollToCatalog();
                            }}
                            className="peer appearance-none w-4 h-4 border border-slate-700 rounded bg-slate-950 checked:bg-[#2796a9] checked:border-[#2796a9] transition-all cursor-pointer"
                          />
                          <CheckCircle size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                        </div>
                        <span className="group-hover:text-white truncate">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Type Filter */}
              {selectedTypes.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-[#2796a9] tracking-wider uppercase block mb-3">Sub-Type</label>
                  <input
                    type="text"
                    placeholder="Search sub-type..."
                    value={subTypeSearch}
                    onChange={e => setSubTypeSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#2796a9] outline-none mb-3 placeholder:text-slate-600"
                  />
                  <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {filterOptions.subTypes
                      .filter(st => st.toLowerCase().includes(subTypeSearch.toLowerCase()))
                      .map(st => (
                      <label key={st} className="flex items-center gap-3 cursor-pointer text-sm text-slate-300 hover:text-white transition-colors group">
                        <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedSubTypes.includes(st)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedSubTypes([...selectedSubTypes, st]);
                              else setSelectedSubTypes(selectedSubTypes.filter(x => x !== st));
                              setCurrentView('products');
                              scrollToCatalog();
                            }}
                            className="peer appearance-none w-4 h-4 border border-slate-700 rounded bg-slate-950 checked:bg-[#2796a9] checked:border-[#2796a9] transition-all cursor-pointer"
                          />
                          <CheckCircle size={12} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                        </div>
                        <span className="group-hover:text-white truncate">{st}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
        )}

        {/* Right Content Area (Hero, Categories, Brands, Catalog Grid) */}
        <main className="flex-grow min-w-0 flex flex-col relative z-10">

          {/* Layer 1: Slides over Sticky Spotlight (z-20, relative, bg-slate-950, shadow) */}
          {currentView === 'home' && (
          <>
            {/* 1. HERO CAROUSEL (Sticky) */}
            <div className="sticky top-0 z-0 h-[100svh] w-full overflow-hidden bg-slate-950">
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
                    <div className="absolute inset-0 mix-blend-multiply" style={{ backgroundColor: '#016A8A', opacity: 0.7 }} />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(18, 41, 44, 1), rgba(0, 0, 0, 0.4), transparent)' }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

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
                        onClick={() => setCurrentView('products')}
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

            {/* 2. BROWSE BY CATEGORY (Slides over Sticky Hero) */}
            <div className="relative z-20 shadow-[0_-15px_30px_rgba(0,0,0,0.5)] bg-slate-950 min-h-[40vh]">
              <section className="py-16 px-6 md:px-16 lg:px-28 bg-slate-950">
                <div className="max-w-7xl mx-auto">
                  <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="text-center md:text-left">
                      <span className="text-[#2796a9] text-xs font-bold tracking-[0.2em] uppercase">Departments</span>
                      <h2 className="text-3xl font-extrabold text-white mt-2">Browse by Category</h2>
                    </div>
                    
                    {/* Carousel Navigation Arrows */}
                    {!showAllCategories && Array.from(filterOptions.categories).filter(c => c !== 'All').length > 3 && (
                      <div className="flex gap-4 justify-center md:justify-end">
                        <button
                          onClick={() => setCategoryIndex(prev => Math.max(0, prev - 1))}
                          disabled={categoryIndex === 0}
                          className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2796a9] hover:border-[#2796a9] transition-colors"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={() => setCategoryIndex(prev => Math.min(Array.from(filterOptions.categories).filter(c => c !== 'All').length - 3, prev + 1))}
                          disabled={categoryIndex >= Array.from(filterOptions.categories).filter(c => c !== 'All').length - 3}
                          className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2796a9] hover:border-[#2796a9] transition-colors"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    <AnimatePresence mode="popLayout">
                      {Array.from(filterOptions.categories)
                        .filter(catName => catName !== 'All')
                        .slice(showAllCategories ? 0 : categoryIndex, showAllCategories ? undefined : categoryIndex + 3)
                        .map((catName, index) => {
                          const isSelected = selectedCategories.includes(catName);
                          const repProduct = products.find(p => p.category === catName);
                          const image = repProduct?.images?.[0] || 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png';

                          const handleCardMove = (e) => {
                            const c = e.currentTarget;
                            const rect = c.getBoundingClientRect();
                            c.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                            c.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                          };

                          return (
                            <motion.article
                              key={catName}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1], delay: (index % 3) * 0.1 }}
                              onMouseMove={handleCardMove}
                              onClick={() => handleCategorySelect(catName)}
                              className={`group relative w-full h-[420px] rounded-3xl overflow-hidden shadow-xl cursor-pointer ${
                                isSelected
                                  ? 'border-2 border-[#2796a9] shadow-[0_0_30px_rgba(39,150,169,0.3)] scale-[1.02]'
                                  : 'border border-slate-800'
                              }`}
                              style={{ '--spotlight-color': 'rgba(39,150,169,0.25)' }}
                            >
                              {/* Spotlight effect on hover */}
                              <div
                                className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-20 opacity-0 group-hover:opacity-100 mix-blend-overlay"
                                style={{
                                  background: 'radial-gradient(circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 70%)'
                                }}
                              />

                              {/* Background Image */}
                              <div className="absolute inset-0 z-0 bg-slate-900">
                                <img
                                  src={image}
                                  alt={catName}
                                  loading="lazy"
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 pointer-events-none opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
                              </div>

                              {/* Text Overlay */}
                              <div className="relative z-10 w-full h-full flex flex-col justify-end p-7 text-white">
                                <h3 className="text-2xl font-bold mb-2 drop-shadow-md group-hover:text-[#2796a9] transition-colors flex items-center gap-2">
                                  {catName}
                                  <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-5px] group-hover:translate-x-0 duration-300" />
                                </h3>
                                <p className="text-sm text-slate-300 leading-relaxed font-light line-clamp-3 drop-shadow-sm">
                                  Explore our premium range of {catName.toLowerCase()} equipment and tools.
                                </p>
                              </div>
                            </motion.article>
                          );
                        })}
                    </AnimatePresence>
                  </div>
                  
                  {/* View More / Show Less Button */}
                  {Array.from(filterOptions.categories).filter(c => c !== 'All').length > 3 && (
                    <div className="flex justify-center mt-12">
                      <button
                        onClick={() => {
                          setShowAllCategories(prev => !prev);
                          setCategoryIndex(0); // Reset index when toggling
                        }}
                        className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-[#2796a9] text-[#2796a9] font-semibold text-sm tracking-wide overflow-hidden transition-all duration-300 hover:text-white"
                      >
                        <span className="absolute inset-0 bg-[#2796a9] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
                        <span className="relative z-10">
                          {showAllCategories 
                            ? 'Show Less' 
                            : `View More (${Array.from(filterOptions.categories).filter(c => c !== 'All').length - 3} more)`}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
      {/* Layer 2: Brand Spotlight Sticky Parallax Background */}
      {ecommConfig.showBrandSpotlight && (() => {
        const c1 = config?.partnersBgColor1 || '#016A8A';
        const c2 = config?.partnersBgColor2 || '#0C3B4A';
        const c3 = config?.partnersBgColor3 || '#02060C';
        
        // Combine currentBrandsList into a single repeated scrolling marquee track
        const row = [...currentBrandsList, ...currentBrandsList, ...currentBrandsList];

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
                <span className="text-[#2796a9] text-xs font-bold tracking-[0.20em] uppercase">{ecommConfig.brandSpotlightTag}</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1">{ecommConfig.brandSpotlightTitle}</h3>
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
                        return (
                          <div
                            key={`b-set1-${idx}`}
                            onClick={() => handleBrandSelect(brand.name)}
                            className="group flex-shrink-0 w-32 md:w-48 h-16 md:h-24 flex items-center justify-center p-3 cursor-pointer transition-all duration-300 border border-transparent hover:border-slate-800/40 hover:bg-slate-950/20 hover:rounded-2xl"
                            title={`Click to filter by ${brand.name}`}
                          >
                            <img
                              src={brand.src}
                              alt={brand.name}
                              className="max-w-full max-h-full object-contain transition-all duration-500 logo-img brightness-0 invert opacity-60 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100"
                              style={{ '--base-scale': String(brand.scale || 1) }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {/* Set 2 */}
                    <div className="flex gap-8 md:gap-16 items-center flex-shrink-0 px-8">
                      {row.map((brand, idx) => {
                        return (
                          <div
                            key={`b-set2-${idx}`}
                            onClick={() => handleBrandSelect(brand.name)}
                            className="group flex-shrink-0 w-32 md:w-48 h-16 md:h-24 flex items-center justify-center p-3 cursor-pointer transition-all duration-300 border border-transparent hover:border-slate-800/40 hover:bg-slate-950/20 hover:rounded-2xl"
                            title={`Click to filter by ${brand.name}`}
                          >
                            <img
                              src={brand.src}
                              alt={brand.name}
                              className="max-w-full max-h-full object-contain transition-all duration-500 logo-img brightness-0 invert opacity-60 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100"
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

      {/* NEWLY ADDED SECTION */}
      {ecommConfig.showNewlyAdded && (
        <section className="relative z-20 py-24 px-6 md:px-16 lg:px-28 bg-slate-900 border-t border-b border-white/5 shadow-2xl">
          <div className="max-w-7xl mx-auto w-full flex flex-col gap-12">
            <div className="text-center">
              <span className="text-[#2796a9] text-xs font-bold tracking-[0.20em] uppercase">{ecommConfig.newlyAddedTag}</span>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-2">{ecommConfig.newlyAddedTitle}</h3>
              <p className="text-slate-400 text-sm font-light mt-3 max-w-xl mx-auto">
                {ecommConfig.newlyAddedSubtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products
                .slice()
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, ecommConfig.newlyAddedLimit)
                .map((product, idx) => (
                  <motion.div
                    key={`new-${product._id || product.product_id}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="group flex flex-col bg-[#121A2D] border border-slate-800 rounded-2xl overflow-hidden hover:border-[#2796a9]/50 hover:shadow-[0_10px_30px_rgba(39,150,169,0.15)] transition-all duration-300"
                  >
                    <div className="relative h-56 bg-white flex items-center justify-center p-6 overflow-hidden">
                      <img 
                        src={product.images?.[0] || 'https://res.cloudinary.com/dzfuhxr2z/image/upload/v1782367880/ecomm/placeholder.png'} 
                        alt={product.product_name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* NEW Badge */}
                      <div className="absolute top-3 left-3 bg-[#2796a9] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded shadow-md">
                        NEW
                      </div>
                    </div>
                    
                    <div className="flex-1 p-5 flex flex-col gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex flex-col">
                          <span className="text-[#2796a9] text-xs font-bold uppercase tracking-wider">{product.brand}</span>
                          <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 mt-1 group-hover:text-[#2796a9] transition-colors">{product.product_name}</h4>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-4 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                          className="flex-1 py-2.5 bg-gradient-to-r from-[#04667b] to-[#2796a9] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-md shadow-[#2796a9]/20"
                        >
                          <ShoppingCart size={14} /> Add to Quote
                        </button>
                      </div>
                    </div>
                  </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

          </>
          )}

      {/* Layer 3: Catalog & Footer (z-30, relative, bg-slate-950, shadow) */}
      {currentView === 'products' && (
      <div className="relative z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] bg-slate-950">

      {/* 4. PRODUCT CATALOG */}
      <section ref={catalogRef} id="catalog-section" className="py-20 px-6 md:px-16 lg:px-28 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col w-full">

          {/* MAIN PRODUCT AREA */}
          <div className="w-full">
            {/* SEARCH AND CONTROLS REMOVED AESTHETICALLY */}

            {/* RESULTS COUNT & FILTER TAGS */}
            <div className="flex items-center justify-between mb-6 text-sm text-slate-400 font-light">
              <div>
                Showing <span className="text-white font-semibold">{Math.min(displayedProducts.length, filteredProducts.length)}</span> of <span className="text-white font-semibold">{filteredProducts.length}</span> industrial products
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
                {displayedProducts.map((p) => (
                  <motion.div
                    key={p.product_id}
                    className="bg-[#121A2D] border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden shadow-md flex flex-col h-full group"
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Image Area */}
                    <div
                      className="h-56 w-full bg-slate-950 flex items-center justify-center p-6 cursor-pointer relative overflow-hidden"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <img
                        src={p.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={p.product_name}
                        className="max-h-full max-w-full object-contain group-hover:scale-102 transition-transform duration-300"
                      />
                      {p.tag && (
                        <span className="absolute top-4 left-4 bg-[#d85c18] text-white text-[10px] font-bold px-2 py-0.5 rounded z-10">
                          {p.tag}
                        </span>
                      )}

                      {/* Hover Tech Spec Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-[#1A2238] opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out z-20 border-t-2 border-[#D86B2B]">
                        <div className="p-4">
                          <h5 className="text-xs font-bold text-white tracking-wider uppercase mb-3">TECH SPEC</h5>
                          <div className="flex flex-col gap-2">
                            {parseSpecifications(p.specifications).slice(0, 3).map((spec, i) => (
                              <div key={i} className="flex justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0">
                                <span className="text-slate-400 text-xs font-light">{spec.parameter}</span>
                                <span className="text-white text-xs font-medium">{spec.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-[11px] text-slate-500 font-light tracking-wide mb-1 block">
                        Brand: <span className="text-slate-300 font-medium">{p.brand}</span>
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
                {displayedProducts.map((p) => (
                  <motion.div
                    key={p.product_id}
                    className="bg-[#121A2D] border border-slate-800 hover:border-slate-600 rounded-2xl overflow-hidden shadow-md p-6 flex flex-col sm:flex-row items-center gap-6 group"
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
                        Brand: <span className="text-slate-300 font-medium">{p.brand}</span>
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

            {/* Pagination / Show More */}
            {filteredProducts.length > displayLimit && (
              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setDisplayLimit(prev => prev + 12)}
                  className="px-6 py-2.5 bg-[#04667b] hover:bg-[#2796a9] text-white text-sm font-semibold tracking-[0.3px] normal-case antialiased rounded-lg transition-all duration-300 shadow-[0_0_10px_rgba(6,53,67,0.4)] hover:shadow-[0_0_20px_rgba(6,53,67,0.8)]"
                >
                  Show More
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      </div>
      )}

      {/* FOOTER */}
      <div className="relative z-30 bg-slate-950 w-full">
        <Footer />
      </div>
      </main>
      </div>

      {/* Scroll to Top FAB */}
      <AnimatePresence>
        {showScrollTop && currentView === 'products' && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-50 p-4 bg-[#04667b] hover:bg-[#2796a9] text-white rounded-full shadow-[0_0_20px_rgba(4,102,123,0.5)] transition-colors"
            title="Scroll to Top"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

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

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-6 right-6 z-[60] bg-slate-900 border border-slate-700 shadow-[0_5px_15px_rgba(0,0,0,0.5)] px-4 py-3 rounded-xl flex items-center gap-3 text-sm text-slate-100"
          >
            <CheckCircle size={18} className="text-[#2796a9]" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
