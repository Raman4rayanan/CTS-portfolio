import { optimizeCloudinaryUrl } from '../utils/imageOptimizer';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sampleProducts } from '../data/sampleProducts';
import { 
  LayoutDashboard, 
  Inbox, 
  Sparkles, 
  Hammer, 
  ArrowLeft, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Eye as ViewIcon, 
  FileText,
  Settings,
  PenTool,
  Wrench,
  Archive,
  ArrowUpSquare,
  HardHat,
  Leaf,
  Cog,
  ShieldCheck,
  Cpu,
  ThumbsUp,
  ShoppingCart,
  Search,
  SlidersHorizontal,
  Download,
  Upload,
  Users,
  Menu,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import SeoHead from './SeoHead';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Map icon strings to Lucide elements for preview
const iconMap = {
  Settings,
  PenTool,
  Wrench,
  Archive,
  ArrowUpSquare,
  HardHat,
  Leaf,
  Cog
};

const defaultGradients = [
  'linear-gradient(135deg, #0F4C81, #0B1F3A)',
  'linear-gradient(135deg, #198e9d, #0B1F3A)',
  'linear-gradient(135deg, #016A8A, #053b4d)',
  'linear-gradient(135deg, #1a3a5c, #0B1F3A)',
  'linear-gradient(135deg, #0e5c6e, #0B1F3A)',
  'linear-gradient(135deg, #0a4a7a, #0B1F3A)'
];

// EcommExportModal Component
function EcommExportModal({ products, brands, setActiveModal }) {
  const [exportBrand, setExportBrand] = useState('All');
  const [exportCategory, setExportCategory] = useState('All');

  useEffect(() => {
    setExportCategory('All');
  }, [exportBrand]);

  const handleExportCSV = () => {
    let filtered = products;
    if (exportBrand !== 'All') filtered = filtered.filter(p => p.brand === exportBrand);
    if (exportCategory !== 'All') {
      filtered = filtered.filter(p => p.category && p.category.toLowerCase() === exportCategory.toLowerCase());
    }

    if (!filtered || filtered.length === 0) return alert('No products match these filters');

    const headers = ['Product ID', 'SKU', 'Name', 'Brand', 'Category', 'Type', 'Model', 'Description'];
    let csvContent = headers.join(',') + '\n';

    filtered.forEach(p => {
      const row = [
        p.product_id || '',
        p.sku || '',
        `"${(p.product_name || '').replace(/"/g, '""')}"`,
        `"${p.brand || ''}"`,
        `"${p.category || ''}"`,
        `"${p.type || ''}"`,
        `"${p.model || ''}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    let filename = 'cts_catalog';
    if (exportBrand !== 'All') filename += `_${exportBrand.replace(/\s+/g, '')}`;
    if (exportCategory !== 'All') filename += `_${exportCategory.replace(/\s+/g, '')}`;
    filename += '.csv';
    
    link.setAttribute('download', filename.toLowerCase());
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setActiveModal(null);
  };

  const filteredForCategories = exportBrand === 'All' ? products : products.filter(p => p.brand === exportBrand);
  const rawCategories = [...new Set(filteredForCategories.map(p => p.category ? p.category.toLowerCase() : ''))].filter(Boolean);
  const toTitleCase = (str) => str.replace(/\b\w/g, c => c.toUpperCase());
  const categories = rawCategories.map(c => toTitleCase(c)).sort();

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Filter by Brand</label>
          <select
            value={exportBrand}
            onChange={(e) => setExportBrand(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0F4C81] outline-none"
          >
            <option value="All">All Brands</option>
            {brands.map(b => (
              <option key={b.name} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 mb-1 block">Filter by Category</label>
          <select
            value={exportCategory}
            onChange={(e) => setExportCategory(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0F4C81] outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setActiveModal(null)}
          className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 border border-transparent hover:bg-slate-50 transition-all text-xs font-semibold cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-[#0F4C81] hover:bg-[#0B1F3A] text-white rounded-xl text-xs font-bold hover:brightness-110 cursor-pointer"
        >
          Export CSV
        </button>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cts_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Data states
  const [stats, setStats] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [activities, setActivities] = useState([]);
  const [services, setServices] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [config, setConfig] = useState(null);
  const [customizeForm, setCustomizeForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    aboutText: '',
    aboutHeaderLight: '',
    aboutHeaderBold: '',
    partnersBgColor1: '',
    partnersBgColor2: '',
    partnersBgColor3: '',
    journey: [],
    reasons: [],
    partners: [],
    customers: [],
    cloudinaryCloudName: '',
    cloudinaryUploadPreset: '',
    ecommBannerText: '',
    companyEmail: '',
    ecommSlides: [],
    metaTitle: '',
    metaDescription: '',
    metaImage: ''
  });
  const [ecommCustomizeForm, setEcommCustomizeForm] = useState({
    showBrandSpotlight: true,
    brandSpotlightTag: 'Partners',
    brandSpotlightTitle: 'Brand Spotlight',
    showNewlyAdded: true,
    newlyAddedTag: 'Latest Arrivals',
    newlyAddedTitle: 'Newly Added Products',
    newlyAddedSubtitle: 'Explore the latest cutting-edge industrial equipment and tools recently added to our catalog.',
    newlyAddedLimit: 8,
    newlyAddedProductIDs: []
  });
  const [ecommBrandsLocal, setEcommBrandsLocal] = useState([]);
  
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [newsletterForm, setNewsletterForm] = useState({ subject: '', htmlContent: '', bannerBase64: '', bannerName: '' });
  const [quoteReplyModalOpen, setQuoteReplyModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quoteReplyMessage, setQuoteReplyMessage] = useState('');
  
  const [saveSuccess, setSaveSuccess] = useState('');
  
  // UI Loading/Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // CRUD Modals state
  const [activeModal, setActiveModal] = useState(null); // 'create_activity', 'edit_activity', 'create_service', 'edit_service'
  const [deleteConfirmData, setDeleteConfirmData] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewingInquiry, setViewingInquiry] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [highlightSearchTerm, setHighlightSearchTerm] = useState('');

  // Form states
  const [activityForm, setActivityForm] = useState({ title: '', subtitle: '', image: '/port/image1.png', gradient: defaultGradients[0] });
  const [serviceForm, setServiceForm] = useState({ title: '', icon: 'Settings', image: '/port/pneumatic.png', desc: '' });

  // E-commerce state variables
  const [ecommProducts, setEcommProducts] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [quoteSearchQuery, setQuoteSearchQuery] = useState('');
  const [quoteFilterStatus, setQuoteFilterStatus] = useState('All');
  const [newInternalNote, setNewInternalNote] = useState('');
  const [csvText, setCsvText] = useState('');
  const [ecommProductForm, setEcommProductForm] = useState({
    product_id: '',
    sku: '',
    brand: '',
    category: '',
    type: '',
    sub_type: '',
    model: '',
    product_name: '',
    description: '',
    specifications: '',
    image: '',
    images: []
  });
  
  // Customers List
  const [storeCustomers, setStoreCustomers] = useState([]);

  // Cloudinary Upload tracking & handler
  const [uploadingField, setUploadingField] = useState(null);

  const handleCloudinaryUpload = async (file, folder, callback, trackingKey) => {
    if (!customizeForm.cloudinaryCloudName || !customizeForm.cloudinaryUploadPreset) {
      alert('Please configure your Cloudinary Cloud Name and Upload Preset in the settings first!');
      return;
    }
    
    setUploadingField(trackingKey);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', customizeForm.cloudinaryUploadPreset);
    formData.append('folder', folder);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${customizeForm.cloudinaryCloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data.secure_url) {
        callback(data.secure_url);
      } else {
        alert(data.error?.message || 'Failed to upload image to Cloudinary.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error uploading image to Cloudinary.');
    } finally {
      setUploadingField(null);
    }
  };

  // Journey Mutations
  const handleAddJourney = () => {
    setCustomizeForm(prev => ({
      ...prev,
      journey: [...prev.journey, { year: '', event: '' }]
    }));
  };

  const handleUpdateJourney = (index, field, value) => {
    setCustomizeForm(prev => {
      const newJourney = [...prev.journey];
      newJourney[index] = { ...newJourney[index], [field]: value };
      return { ...prev, journey: newJourney };
    });
  };

  const handleRemoveJourney = (index) => {
    setCustomizeForm(prev => ({
      ...prev,
      journey: prev.journey.filter((_, i) => i !== index)
    }));
  };

  // Reasons Mutations
  const handleAddReason = () => {
    setCustomizeForm(prev => ({
      ...prev,
      reasons: [...prev.reasons, { title: '', icon: 'ShieldCheck', desc: '' }]
    }));
  };

  const handleUpdateReason = (index, field, value) => {
    setCustomizeForm(prev => {
      const newReasons = [...prev.reasons];
      newReasons[index] = { ...newReasons[index], [field]: value };
      return { ...prev, reasons: newReasons };
    });
  };

  const handleRemoveReason = (index) => {
    setCustomizeForm(prev => ({
      ...prev,
      reasons: prev.reasons.filter((_, i) => i !== index)
    }));
  };

  // Partners Mutations
  const handleAddPartner = () => {
    setCustomizeForm(prev => ({
      ...prev,
      partners: [...prev.partners, { name: '', src: '/boach-Photoroom.png', scale: 1.0 }]
    }));
  };

  const handleUpdatePartner = (index, field, value) => {
    setCustomizeForm(prev => {
      const newPartners = [...prev.partners];
      newPartners[index] = { ...newPartners[index], [field]: value };
      return { ...prev, partners: newPartners };
    });
  };

  const handleRemovePartner = (index) => {
    setCustomizeForm(prev => ({
      ...prev,
      partners: prev.partners.filter((_, i) => i !== index)
    }));
  };

  // Customers Mutations
  const handleAddCustomer = () => {
    setCustomizeForm(prev => ({
      ...prev,
      customers: [...prev.customers, { name: '', src: '/nordex-Photoroom.png', scale: 1.0 }]
    }));
  };

  const handleUpdateCustomer = (index, field, value) => {
    setCustomizeForm(prev => {
      const newCustomers = [...prev.customers];
      newCustomers[index] = { ...newCustomers[index], [field]: value };
      return { ...prev, customers: newCustomers };
    });
  };

  const handleRemoveCustomer = (index) => {
    setCustomizeForm(prev => ({
      ...prev,
      customers: prev.customers.filter((_, i) => i !== index)
    }));
  };

  // E-commerce Slider Slide Mutations
  const handleUpdateEcommSlide = (idx, field, value) => {
    setCustomizeForm(prev => {
      const updated = [...(prev.ecommSlides || [])];
      if (!updated[idx]) return prev;
      updated[idx] = { ...updated[idx], [field]: value };
      return { ...prev, ecommSlides: updated };
    });
  };

  const handleAddEcommSlide = () => {
    setCustomizeForm(prev => ({
      ...prev,
      ecommSlides: [
        ...(prev.ecommSlides || []),
        {
          title: 'New Slider Title',
          subtitle: 'New slider description text',
          image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png',
          tag: 'TAG'
        }
      ]
    }));
  };

  const handleRemoveEcommSlide = (idx) => {
    setCustomizeForm(prev => ({
      ...prev,
      ecommSlides: (prev.ecommSlides || []).filter((_, i) => i !== idx)
    }));
  };

  // E-commerce Brands Mutations
  const handleAddEcommBrand = () => {
    setEcommBrandsLocal(prev => [
      { name: 'New Brand', src: '', scale: 1.0 },
      ...prev
    ]);
  };

  const handleUpdateEcommBrand = (index, field, value) => {
    setEcommBrandsLocal(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveEcommBrand = (index) => {
    setEcommBrandsLocal(prev => prev.filter((_, i) => i !== index));
  };

  // Fetch all data helper
  const fetchData = async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('cts_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // Stats
      const statsRes = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers });
      const statsData = await statsRes.json();

      // Inquiries
      const inquiriesRes = await fetch(`${API_BASE_URL}/api/admin/inquiries`, { headers });
      const inquiriesData = await inquiriesRes.json();

      // Activities
      const activitiesRes = await fetch(`${API_BASE_URL}/api/portfolio/activities`);
      const activitiesData = await activitiesRes.json();

      // Services
      const servicesRes = await fetch(`${API_BASE_URL}/api/portfolio/services`);
      const servicesData = await servicesRes.json();

      // Portfolio Config
      const configRes = await fetch(`${API_BASE_URL}/api/portfolio/config?t=${Date.now()}`);
      const configData = await configRes.json();

      if (statsRes.status === 401 || inquiriesRes.status === 401) {
        console.warn('Session expired or invalid token. Redirecting.');
        localStorage.removeItem('cts_user');
        localStorage.removeItem('cts_token');
        setUser(null);
        navigate('/');
        return;
      }

      if (statsData.success && inquiriesData.success && activitiesData.success && servicesData.success && configData.success) {
        setStats(statsData.data);
        setInquiries(inquiriesData.data);
        setActivities(activitiesData.data);
        setServices(servicesData.data);
        setConfig(configData.data);
        setCustomizeForm({
          heroTitle: configData.data.heroTitle || '',
          heroSubtitle: configData.data.heroSubtitle || '',
          aboutText: configData.data.aboutText || '',
          aboutHeaderLight: configData.data.aboutHeaderLight || '',
          aboutHeaderBold: configData.data.aboutHeaderBold || '',
          partnersBgColor1: configData.data.partnersBgColor1 || '#112A4F',
          partnersBgColor2: configData.data.partnersBgColor2 || '#040C19',
          partnersBgColor3: configData.data.partnersBgColor3 || '#02060C',
          journey: configData.data.journey || [],
          reasons: configData.data.reasons || [],
          partners: configData.data.partners || [],
          customers: configData.data.customers || [],
          cloudinaryCloudName: configData.data.cloudinaryCloudName || '',
          cloudinaryUploadPreset: configData.data.cloudinaryUploadPreset || '',
          ecommBannerText: configData.data.ecommBannerText || '',
          companyEmail: configData.data.companyEmail || '',
          showEcommBanner: configData.data.showEcommBanner ?? true,
          ecommSlides: configData.data.ecommSlides || [],
          metaTitle: configData.data.metaTitle || '',
          metaDescription: configData.data.metaDescription || '',
          metaImage: configData.data.metaImage || ''
        });

        // E-commerce items loading from backend API
        try {
          const ecommRes = await fetch(`${API_BASE_URL}/api/ecomm/products`);
          const ecommData = await ecommRes.json();
          if (ecommData.success) {
            setEcommProducts(ecommData.data);
            localStorage.setItem('cts_products', JSON.stringify(ecommData.data));
          } else {
            const savedProducts = localStorage.getItem('cts_products');
            setEcommProducts(savedProducts ? JSON.parse(savedProducts) : sampleProducts);
          }
        } catch (ecommErr) {
          console.error('Error fetching catalog products:', ecommErr);
          const savedProducts = localStorage.getItem('cts_products');
          setEcommProducts(savedProducts ? JSON.parse(savedProducts) : sampleProducts);
        }

        // Fetch brands list from backend
        try {
          const brandsRes = await fetch(`${API_BASE_URL}/api/ecomm/brands`);
          const brandsData = await brandsRes.json();
          if (brandsData.success) {
            setBrandsList(brandsData.data);
            setEcommBrandsLocal(brandsData.data);
          }
        } catch (brandsErr) {
          console.error('Error fetching partner brands:', brandsErr);
        }

        // Fetch ecomm config
        try {
          const ecommConfigRes = await fetch(`${API_BASE_URL}/api/ecomm/config`);
          const ecommConfigData = await ecommConfigRes.json();
          if (ecommConfigData.success && ecommConfigData.data) {
            setEcommCustomizeForm(prev => ({
              ...prev,
              showBrandSpotlight: ecommConfigData.data.showBrandSpotlight ?? true,
              brandSpotlightTag: ecommConfigData.data.brandSpotlightTag || 'Partners',
              brandSpotlightTitle: ecommConfigData.data.brandSpotlightTitle || 'Brand Spotlight',
              showNewlyAdded: ecommConfigData.data.showNewlyAdded ?? true,
              newlyAddedTag: ecommConfigData.data.newlyAddedTag || 'Latest Arrivals',
              newlyAddedTitle: ecommConfigData.data.newlyAddedTitle || 'Newly Added Products',
              newlyAddedSubtitle: ecommConfigData.data.newlyAddedSubtitle || 'Explore the latest cutting-edge industrial equipment and tools recently added to our catalog.',
              newlyAddedLimit: ecommConfigData.data.newlyAddedLimit ?? 8,
              newlyAddedProductIDs: ecommConfigData.data.newlyAddedProductIDs || []
            }));
          }
        } catch (e) {
          console.error('Error fetching ecomm config:', e);
        }

        // Fetch orders/RFQs from backend
        try {
          const ordersRes = await fetch(`${API_BASE_URL}/api/ecomm/orders`, { headers });
          const ordersData = await ordersRes.json();
          if (ordersData.success) {
            setOrdersList(ordersData.data);
          } else {
            const savedQuotes = localStorage.getItem('cts_quotes');
            setOrdersList(savedQuotes ? JSON.parse(savedQuotes) : []);
          }
        } catch (ordersErr) {
          console.error('Error fetching RFQ orders:', ordersErr);
          const savedQuotes = localStorage.getItem('cts_quotes');
          setOrdersList(savedQuotes ? JSON.parse(savedQuotes) : []);
        }

        // Fetch customers
        try {
          const customersRes = await fetch(`${API_BASE_URL}/api/admin/customers`, { headers });
          const customersData = await customersRes.json();
          if (customersData.success) {
            setStoreCustomers(customersData.data);
          }
        } catch (customersErr) {
          console.error('Error fetching customers:', customersErr);
        }

      } else {
        setError('Error retrieving data from one or more services.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure. Could not reach server.');
    } finally {
      setLoading(false);
    }
  };

  // Save Config handler
  const handleUpdateConfig = async (e) => {
    if (e) e.preventDefault();
    setSaveSuccess('');
    setError('');
    const token = localStorage.getItem('cts_token');
    
    // Parse scales to numbers before sending to API
    const parsedForm = {
      ...customizeForm,
      partners: (customizeForm.partners || []).map(p => ({
        ...p,
        scale: p.scale === '' || isNaN(parseFloat(p.scale)) ? 1.0 : parseFloat(p.scale)
      })),
      customers: (customizeForm.customers || []).map(c => ({
        ...c,
        scale: c.scale === '' || isNaN(parseFloat(c.scale)) ? 1.0 : parseFloat(c.scale)
      }))
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(parsedForm)
      });
      
      const ecommConfigRes = await fetch(`${API_BASE_URL}/api/ecomm/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ecommCustomizeForm)
      });

      const ecommBrandsRes = await fetch(`${API_BASE_URL}/api/ecomm/brands/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ brands: ecommBrandsLocal })
      });

      const data = await res.json();
      const ecommConfigData = await ecommConfigRes.json();
      const ecommBrandsData = await ecommBrandsRes.json();

      if (data.success && ecommConfigData.success && ecommBrandsData.success) {
        setConfig(data.data);
        setSaveSuccess('All changes saved successfully! The updates are now live.');
        if (ecommBrandsData.data) {
          setEcommBrandsLocal(ecommBrandsData.data);
          setBrandsList(ecommBrandsData.data);
        }
        setTimeout(() => setSaveSuccess(''), 5000);
      } else {
        setError(data.error || ecommConfigData.error || ecommBrandsData.error || 'Failed to update configuration.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure. Could not save settings.');
    }
  };

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Auth Functions for inline login page
  const handleInlineLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success && data.user.role === 'Admin') {
        localStorage.setItem('cts_user', JSON.stringify(data.user));
        localStorage.setItem('cts_token', data.token);
        setUser(data.user);
      } else {
        setError(data.error || 'Access denied. Administrator account required.');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Connection error. Is the server running?');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('cts_token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/admin/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('cts_user');
    localStorage.removeItem('cts_token');
    setUser(null);
    navigate('/');
  };

  // Inquiry actions
  const handleToggleInquiryRead = async (id, currentReadStatus) => {
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/inquiries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ read: !currentReadStatus })
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(prev => prev.map(item => item._id === id ? data.data : item));
        // Refresh stats
        fetchStatsOnly();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReplyToInquiry = async () => {
    if (!replyMessage.trim()) return alert('Please enter a reply message.');
    
    setSubmittingReply(true);
    try {
      const token = localStorage.getItem('cts_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/inquiries/${viewingInquiry._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ replyMessage })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Reply sent successfully and inquiry marked as read.');
        setReplyMessage('');
        // Update local state to mark as read
        setInquiries(inquiries.map(i => i._id === viewingInquiry._id ? { ...i, read: true } : i));
        setViewingInquiry({ ...viewingInquiry, read: true });
      } else {
        alert(data.error || 'Failed to send reply.');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteInquiry = (id) => {
    setDeleteConfirmData({
      title: 'Delete Inquiry',
      message: 'Are you sure you want to delete this inquiry? This action is permanent and cannot be undone.',
      onConfirm: async () => {
        const token = localStorage.getItem('cts_token');
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/inquiries/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setInquiries(prev => prev.filter(item => item._id !== id));
            if (viewingInquiry && viewingInquiry._id === id) {
              setViewingInquiry(null);
            }
            fetchStatsOnly();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const fetchStatsOnly = async () => {
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Activities CRUD
  const handleCreateActivitySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityForm)
      });
      const data = await res.json();
      if (data.success) {
        setActivities(prev => [data.data, ...prev]);
        setActiveModal(null);
        setActivityForm({ title: '', subtitle: '', image: '/port/image1.png', gradient: defaultGradients[0] });
        fetchStatsOnly();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditActivitySubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio/activities/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activityForm)
      });
      const data = await res.json();
      if (data.success) {
        setActivities(prev => prev.map(item => item._id === selectedItem._id ? data.data : item));
        setActiveModal(null);
        setSelectedItem(null);
        setActivityForm({ title: '', subtitle: '', image: '/port/image1.png', gradient: defaultGradients[0] });
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActivity = (id) => {
    setDeleteConfirmData({
      title: 'Delete Portfolio Activity',
      message: 'Are you sure you want to delete this activity? This action is permanent and cannot be undone.',
      onConfirm: async () => {
        const token = localStorage.getItem('cts_token');
        try {
          const res = await fetch(`${API_BASE_URL}/api/portfolio/activities/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setActivities(prev => prev.filter(item => item._id !== id));
            fetchStatsOnly();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleDeleteCustomer = (id) => {
    setDeleteConfirmData({
      title: 'Delete Customer Account',
      message: 'Are you sure you want to delete this customer account? This will permanently erase their data and immediately revoke their active sessions.',
      onConfirm: async () => {
        const token = localStorage.getItem('cts_token');
        try {
          const res = await fetch(`${API_BASE_URL}/api/admin/customers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setStoreCustomers(prev => prev.filter(item => item._id !== id));
            fetchStatsOnly();
          } else {
            alert(data.error);
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleViewHistory = async (email) => {
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/customers/${email}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSelectedUserHistory({ email, ...data.data });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newsletterForm)
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setIsNewsletterOpen(false);
        setNewsletterForm({ subject: '', htmlContent: '', bannerBase64: '', bannerName: '' });
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send newsletter');
    }
  };

  const handleQuoteReply = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${selectedQuote._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: selectedQuote.items,
          message: quoteReplyMessage
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrdersList(prev => prev.map(o => o._id === selectedQuote._id ? data.data : o));
        setQuoteReplyModalOpen(false);
        alert('Quote sent successfully to the customer!');
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send quote');
    }
  };

  // Services CRUD
  const handleCreateServiceSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceForm)
      });
      const data = await res.json();
      if (data.success) {
        setServices(prev => [data.data, ...prev]);
        setActiveModal(null);
        setServiceForm({ title: '', icon: 'Settings', image: '/port/pneumatic.png', desc: '' });
        fetchStatsOnly();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditServiceSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio/services/${selectedItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serviceForm)
      });
      const data = await res.json();
      if (data.success) {
        setServices(prev => prev.map(item => item._id === selectedItem._id ? data.data : item));
        setActiveModal(null);
        setSelectedItem(null);
        setServiceForm({ title: '', icon: 'Settings', image: '/port/pneumatic.png', desc: '' });
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = (id) => {
    setDeleteConfirmData({
      title: 'Delete Product/Service Capability',
      message: 'Are you sure you want to delete this capability? This action is permanent and cannot be undone.',
      onConfirm: async () => {
        const token = localStorage.getItem('cts_token');
        try {
          const res = await fetch(`${API_BASE_URL}/api/portfolio/services/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setServices(prev => prev.filter(item => item._id !== id));
            fetchStatsOnly();
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  // Login view if not logged in
  if (!user || user.role !== 'Admin') {
    return <AdminLogin onSubmit={handleInlineLogin} error={error} loading={loading} />;
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FA] text-slate-800 relative">
      <SeoHead 
        title="Admin Portal"
        description="CTS Secure Admin Portal"
        robots="noindex, nofollow"
      />
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <aside className={`w-64 bg-white/60 backdrop-blur-md border-r border-slate-200 flex flex-col shrink-0 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 h-screen overflow-y-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-24 px-6 flex items-center justify-between border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2 text-[#0F4C81] font-bold text-lg hover:brightness-110 transition-all">
            <ArrowLeft size={16} />
            <span>Go to Site</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-800/35 px-4 mb-2">
            Main
          </div>
          <SidebarLink 
            label="Dashboard" 
            icon={<LayoutDashboard size={18} />} 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarLink 
            label="Users" 
            icon={<Users size={18} />} 
            active={activeTab === 'users'} 
            onClick={() => setActiveTab('users')} 
          />
          <SidebarLink 
            label="Inquiries" 
            icon={<Inbox size={18} />} 
            badge={inquiries.filter(i => !i.read).length}
            active={activeTab === 'inquiries'} 
            onClick={() => setActiveTab('inquiries')} 
          />

          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-800/35 px-4 mt-6 mb-2">
            Portfolio
          </div>
          <SidebarLink 
            label="Activities" 
            icon={<Sparkles size={18} />} 
            active={activeTab === 'activities'} 
            onClick={() => setActiveTab('activities')} 
          />
          <SidebarLink 
            label="Product Service" 
            icon={<Hammer size={18} />} 
            active={activeTab === 'services'} 
            onClick={() => setActiveTab('services')} 
          />
          <SidebarLink 
            label="Customize Site" 
            icon={<Settings size={18} />} 
            active={activeTab === 'customize'} 
            onClick={() => setActiveTab('customize')} 
          />

          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-800/35 px-4 mt-6 mb-2">
            E-commerce
          </div>
          <SidebarLink 
            label="Catalog Manager" 
            icon={<ShoppingCart size={18} />} 
            active={activeTab === 'ecomm'} 
            onClick={() => setActiveTab('ecomm')} 
          />
          <SidebarLink 
            label="Quotes & Orders" 
            icon={<FileText size={18} />} 
            badge={ordersList.filter(o => o.status === 'Pending').length} 
            active={activeTab === 'orders'} 
            onClick={() => setActiveTab('orders')} 
          />
          <SidebarLink 
            label="Customize Store" 
            icon={<Settings size={18} />} 
            active={activeTab === 'ecommCustomize'} 
            onClick={() => setActiveTab('ecommCustomize')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-200 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#0F4C81] flex items-center justify-center font-bold text-sm">
              {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user.username}</span>
              <span className="text-xs text-slate-500 truncate">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full text-left py-2 px-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center gap-2 cursor-pointer mt-2"
          >
            <XCircle size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-24 border-b border-slate-200 px-4 md:px-8 flex items-center justify-between bg-white shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg text-[#0F4C81] transition-colors"
            >
              <Menu size={24} />
            </button>
            {activeTab !== 'dashboard' && (
              <button onClick={() => setActiveTab('dashboard')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600 hover:text-slate-800 cursor-pointer" title="Back to Dashboard">
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-lg md:text-2xl font-bold tracking-wide capitalize">
              {activeTab === 'services' ? 'Products & Service' : activeTab === 'customize' ? 'Customization Management' : activeTab === 'ecomm' ? 'E-commerce Catalog' : `${activeTab} Management`}
            </h2>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-64 w-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#0F4C81] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 font-medium">
              {error}
            </div>
          ) : (
            <>
              {/* DASHBOARD TAB */}
              {activeTab === 'dashboard' && stats && (
                <div className="flex flex-col gap-8">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <DashboardCard 
                      title="Total Inquiries" 
                      value={stats.portfolio.inquiries} 
                      icon={<Inbox className="text-blue-400" />} 
                      color="from-blue-500/10 to-blue-500/5 border-blue-500/10"
                      onClick={() => setActiveTab('inquiries')}
                    />
                    <DashboardCard 
                      title="Unread Inquiries" 
                      value={stats.portfolio.unreadInquiries} 
                      icon={<Inbox className="text-orange-400" />} 
                      color="from-orange-500/10 to-orange-500/5 border-orange-500/10"
                      onClick={() => setActiveTab('inquiries')}
                    />
                    <DashboardCard 
                      title="Read Inquiries" 
                      value={stats.portfolio.readInquiries} 
                      icon={<CheckCircle className="text-green-600" />} 
                      color="from-green-600/10 to-green-600/5 border-green-600/10"
                      onClick={() => setActiveTab('inquiries')}
                    />
                    <DashboardCard 
                      title="Total Activities" 
                      value={stats.portfolio.activities} 
                      icon={<Sparkles className="text-indigo-400" />} 
                      color="from-indigo-500/10 to-indigo-500/5 border-indigo-500/10"
                      onClick={() => setActiveTab('activities')}
                    />
                    <DashboardCard 
                      title="Products & Service" 
                      value={stats.portfolio.services} 
                      icon={<Hammer className="text-teal-400" />} 
                      color="from-teal-500/10 to-teal-500/5 border-teal-500/10"
                      onClick={() => setActiveTab('services')}
                    />
                    <DashboardCard 
                      title="E-comm Products" 
                      value={stats.ecommerce?.products || 0} 
                      icon={<ShoppingCart className="text-pink-400" />} 
                      color="from-pink-500/10 to-pink-500/5 border-pink-500/10"
                      onClick={() => setActiveTab('ecomm')}
                    />
                    <DashboardCard 
                      title="Partner Brands" 
                      value={stats.ecommerce?.brands || 0} 
                      icon={<SlidersHorizontal className="text-[#0F4C81]" />} 
                      color="from-[#0F4C81]/10 to-[#0F4C81]/5 border-[#0F4C81]/10"
                      onClick={() => setActiveTab('ecommCustomize')}
                    />
                    <DashboardCard 
                      title="Quote Requests" 
                      value={stats.ecommerce?.orders || 0} 
                      icon={<FileText className="text-green-600" />} 
                      color="from-green-600/10 to-green-600/5 border-green-600/10"
                      onClick={() => setActiveTab('orders')}
                    />
                  </div>

                  {/* Activity Trends and Top Products Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Activity Trends Chart */}
                    <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
                      <h3 className="font-bold text-lg text-slate-800">Activity Trends (Last 30 Days)</h3>
                      <div className="h-64 w-full">
                        {stats.trends?.activityTrends ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.trends.activityTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                              <YAxis stroke="#64748b" fontSize={10} />
                              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                              <Line type="monotone" dataKey="orders" name="Quotation Requests" stroke="#0ae7f0" strokeWidth={2} dot={false} />
                              <Line type="monotone" dataKey="inquiries" name="General Inquiries" stroke="#f59e0b" strokeWidth={2} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-500 text-sm">No trend data available</div>
                        )}
                      </div>
                    </div>

                    {/* Top Products Chart */}
                    <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
                      <h3 className="font-bold text-lg text-slate-800">Most Requested Products</h3>
                      <div className="h-64 w-full">
                        {stats.trends?.topProducts?.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.trends.topProducts} margin={{ top: 10, right: 10, left: 10, bottom: 0 }} layout="vertical">
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                              <XAxis type="number" stroke="#64748b" fontSize={10} />
                              <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} width={140} tick={{fill: '#334155'}} tickFormatter={(value) => value.length > 22 ? value.substring(0, 22) + '...' : value} />
                              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                              <Bar dataKey="quantity" name="Quantity Requested" fill="#0F4C81" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-slate-500 text-sm">No product data available</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Activity Lists / Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Inquiries Panel */}
                    <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Unread Inquiries Inbox</h3>
                        <button onClick={() => setActiveTab('inquiries')} className="text-xs text-[#0F4C81] hover:underline">View All</button>
                      </div>
                      
                      <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                        {inquiries.filter(i => !i.read).slice(0, 5).map(inq => (
                          <div key={inq._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center gap-4">
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-semibold text-sm truncate">{inq.name}</span>
                              <span className="text-xs text-slate-500 truncate mb-1">{inq.email || inq.phone}</span>
                              <p className="text-xs text-slate-600 truncate">{inq.message}</p>
                            </div>
                            <button 
                              onClick={() => {
                                setViewingInquiry(inq);
                                setActiveTab('inquiries');
                              }}
                              className="px-3 py-1.5 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                            >
                              Open
                            </button>
                          </div>
                        ))}
                        {inquiries.filter(i => !i.read).length === 0 && (
                          <div className="text-center py-8 text-slate-500 text-sm">
                            No unread inquiries. All caught up!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fast Stats verification */}
                    <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-6">
                      <h3 className="font-bold text-lg">System & Database Status</h3>
                      <div className="flex flex-col gap-4 text-sm font-light text-slate-600">
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span>Segregated Databases Connectors</span>
                          <span className="text-green-600 font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" /> Active
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span>Admin DB Connection (cts_admin)</span>
                          <span className="font-semibold text-slate-800">Connected</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span>Portfolio DB Connection (cts_portfolio)</span>
                          <span className="font-semibold text-slate-800">Connected</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span>E-commerce DB Connection (cts_ecomm)</span>
                          <span className="font-semibold text-slate-800">Connected</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-200 pb-2">
                          <span>Registered Admin Users</span>
                          <span className="font-semibold text-slate-800">{stats.admin.users}</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span>Total DB Entities Managed</span>
                          <span className="font-semibold text-[#0F4C81]">
                            {stats.portfolio.inquiries + 
                             stats.portfolio.activities + 
                             stats.portfolio.services + 
                             (stats.ecommerce?.products || 0) + 
                             (stats.ecommerce?.brands || 0) + 
                             (stats.ecommerce?.orders || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* B2B Procurement & Quotations Insights Panel */}
                  <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="font-bold text-lg text-[#0F4C81]">B2B RFQ Sales Pipeline Insights</h3>
                        <p className="text-xs text-slate-500 font-light mt-0.5">Overview of live customer RFQ requests, status distribution, and sales worksheets.</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('orders')} 
                        className="px-4 py-2 bg-[#0F4C81]/10 hover:bg-[#0F4C81] text-[#0F4C81] hover:text-white rounded-xl text-xs font-bold transition-all border border-[#0F4C81]/20 cursor-pointer"
                      >
                        View All Quotes ({ordersList.length})
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                      {/* Pipeline breakdown */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">RFQ Status Pipeline</span>
                        <div className="flex flex-col gap-2 mt-3">
                          {[
                            { name: 'Pending Review', status: 'Pending', color: 'bg-yellow-500' },
                            { name: 'Approved / Priced', status: 'Approved', color: 'bg-green-600' },
                            { name: 'Processing', status: 'Processing', color: 'bg-blue-400' },
                            { name: 'Completed', status: 'Completed', color: 'bg-[#0F4C81]' },
                            { name: 'Cancelled', status: 'Cancelled', color: 'bg-slate-200' }
                          ].map(st => {
                            const count = ordersList.filter(o => o.status === st.status).length;
                            return (
                              <div key={st.status} className="flex justify-between items-center text-xs">
                                <div className="flex items-center gap-2">
                                  <span className={`w-2.5 h-2.5 rounded-full ${st.color}`} />
                                  <span>{st.name}</span>
                                </div>
                                <span className="font-bold font-mono">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Financial statistics */}
                      {(() => {
                        const currentMonthOrders = ordersList.filter(o => {
                          if (!o.createdAt) return false;
                          const d = new Date(o.createdAt);
                          const now = new Date();
                          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                        });
                        return (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Estimated pipeline value (This Month)</span>
                            <div className="flex flex-col gap-3 mt-3">
                              <div className="flex justify-between items-center text-xs">
                                <span>Pending Quote Requests:</span>
                                <span className="font-bold font-mono text-yellow-700">
                                  {currentMonthOrders.filter(o => o.status === 'Pending').length} requests
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
                                <span>Total Priced & Approved Quotes:</span>
                                <span className="font-bold font-mono text-green-600">
                                  {currentMonthOrders.filter(o => o.status === 'Approved').length} requests
                                </span>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] text-slate-500">TOTAL PIPELINE CONTRACT VALUE</span>
                                <span className="text-2xl font-bold font-mono text-slate-800 mt-1">
                                  ₹{currentMonthOrders.reduce((acc, order) => {
                                    const subtotal = (order.items || []).reduce((sum, it) => sum + (it.quantity * (it.unitPrice || 0)), 0);
                                    const taxAmount = (subtotal * (order.taxRate || 0)) / 100;
                                    return acc + subtotal + taxAmount + (order.shippingCost || 0);
                                  }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Recent quote list */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Latest B2B RFQs</span>
                        <div className="flex flex-col gap-2 mt-2 max-h-[160px] overflow-y-auto pr-1">
                          {ordersList.filter(o => !o.adminComments && o.status !== 'Approved').slice(0, 3).map(order => (
                            <div key={order._id} className="p-2 bg-white shadow-sm rounded border border-slate-200 flex justify-between items-center gap-3 text-[11px]">
                              <div className="flex flex-col truncate">
                                <span className="font-bold font-mono text-slate-800">{order.referenceId}</span>
                                <span className="text-slate-500 truncate">{order.customerDetails?.name} • {order.customerDetails?.company || 'No Company'}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedItem(order);
                                  setActiveModal('edit_order_ecomm');
                                }}
                                className="px-2.5 py-1 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                              >
                                View RFQ
                              </button>
                            </div>
                          ))}
                          {ordersList.length === 0 && (
                            <div className="text-center py-6 text-slate-600 text-xs">
                              No quote inquiries received yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* USERS TAB */}
              {activeTab === 'users' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                        <Users size={24} className="text-[#04667b]" />
                        Storefront Customers
                      </h3>
                      <p className="text-slate-600 text-sm">Manage registered eCommerce customer accounts.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="px-4 py-2.5 bg-[#F5F7FA] border border-slate-200 rounded-full text-sm text-slate-800 focus:border-[#0F4C81] outline-none w-64 pr-10"
                        />
                        <Search size={16} className="absolute right-3 top-3 text-slate-600" />
                      </div>
                      <button onClick={() => setIsNewsletterOpen(true)} className="px-4 py-2 bg-[#0F4C81] hover:bg-[#0B1F3A] text-white text-sm font-bold rounded-full shadow-lg transition-colors">
                        Send Newsletter
                      </button>
                      <div className="text-sm font-semibold text-[#04667b] bg-[#04667b]/10 px-4 py-2 rounded-full border border-[#04667b]/20 flex items-center">
                        Total: {storeCustomers.length}
                      </div>
                    </div>
                  </div>

                  {storeCustomers.length === 0 ? (
                    <div className="text-center py-16 bg-white shadow-sm rounded-xl border border-dashed border-slate-200">
                      <Users size={48} className="mx-auto text-slate-700 mb-4" />
                      <h4 className="text-slate-800 font-bold mb-2">No Customers Found</h4>
                      <p className="text-slate-500 text-sm">No users have signed up on the storefront yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 bg-white shadow-sm">
                            <th className="p-4 font-bold">Username</th>
                            <th className="p-4 font-bold">Email</th>
                            <th className="p-4 font-bold">Company</th>
                            <th className="p-4 font-bold">Phone</th>
                            <th className="p-4 font-bold text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/50">
                          {storeCustomers
                            .filter(c => 
                              (c.username || '').toLowerCase().includes(userSearch.toLowerCase()) || 
                              (c.email || '').toLowerCase().includes(userSearch.toLowerCase()) || 
                              (c.companyName || '').toLowerCase().includes(userSearch.toLowerCase())
                            )
                            .map((user) => (
                            <tr key={user._id} className="hover:bg-white shadow-lg/20 transition-colors cursor-pointer" onClick={() => handleViewHistory(user.email)}>
                              <td className="p-4">
                                <div className="font-bold text-slate-800">{user.username}</div>
                                <div className="text-[10px] text-slate-500 mt-1">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                              </td>
                              <td className="p-4 font-medium text-slate-700">{user.email}</td>
                              <td className="p-4 text-slate-600">{user.companyName || '-'}</td>
                              <td className="p-4 text-slate-600">{user.phone || '-'}</td>
                              <td className="p-4">
                                <div className="flex items-center justify-center">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(user._id); }}
                                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Delete Customer"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* INQUIRIES TAB */}
              {activeTab === 'inquiries' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Inquiry List */}
                  <div className="lg:col-span-2 bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
                    <h3 className="font-bold text-lg mb-2">Received Inquiries Inbox</h3>
                    
                    <div className="flex flex-col gap-3">
                      {inquiries.map(inq => (
                        <div 
                          key={inq._id} 
                          onClick={() => setViewingInquiry(inq)}
                          className={`p-4 rounded-xl border transition-all duration-300 flex justify-between items-center gap-4 cursor-pointer hover:border-[#0F4C81]/30 ${
                            viewingInquiry?._id === inq._id 
                              ? 'bg-[#0F4C81]/10 border-[#0F4C81]/50' 
                              : inq.read 
                                ? 'bg-slate-50 border-slate-200 opacity-70' 
                                : 'bg-slate-100 border-slate-200 shadow-[0_0_10px_rgba(39,150,169,0.05)]'
                          }`}
                        >
                          <div className="flex flex-col overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate">{inq.name}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                inq.read ? 'bg-green-600/10 text-green-600' : 'bg-orange-500/10 text-orange-400'
                              }`}>
                                {inq.read ? 'Read' : 'Unread'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500 truncate mt-0.5">{inq.email || inq.phone}</span>
                            <p className="text-xs text-slate-600 truncate mt-2">{inq.message}</p>
                          </div>
                          <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleInquiryRead(inq._id, inq.read)}
                              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                inq.read 
                                  ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-slate-800' 
                                  : 'bg-green-600/10 border-green-600/20 text-green-600 hover:bg-green-600 hover:text-slate-800'
                              }`}
                              title={inq.read ? 'Mark as Unread' : 'Mark as Read'}
                            >
                              {inq.read ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteInquiry(inq._id)}
                              className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                              title="Delete Inquiry"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {inquiries.length === 0 && (
                        <div className="text-center py-12 text-slate-600 text-sm">
                          No inquiries received yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inquiry Detail Panel */}
                  <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 sticky top-8">
                    <h3 className="font-bold text-lg border-b border-slate-200 pb-4">Inquiry Details</h3>
                    {viewingInquiry ? (
                      <div className="flex flex-col gap-4 text-sm">
                        <div>
                          <span className="text-xs text-slate-500 block mb-1">Name:</span>
                          <span className="font-semibold text-slate-800 text-base">{viewingInquiry.name}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-slate-500 block mb-1">Email:</span>
                            <span className="font-medium text-slate-800 truncate block">{viewingInquiry.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block mb-1">Phone:</span>
                            <span className="font-medium text-slate-800 block">{viewingInquiry.phone}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block mb-1">Received Date:</span>
                          <span className="font-light text-slate-700">{new Date(viewingInquiry.createdAt).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-500 block mb-1">Message:</span>
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 leading-relaxed font-light min-h-[120px] whitespace-pre-line">
                            {viewingInquiry.message}
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col gap-2">
                          <label className="text-xs text-slate-500 font-semibold uppercase">Send Reply</label>
                          <textarea
                            value={replyMessage}
                            onChange={e => setReplyMessage(e.target.value)}
                            placeholder="Type your reply here... (Will be emailed to the user and CC'd to company)"
                            rows={4}
                            className="w-full bg-white shadow-lg border border-slate-200 rounded-xl p-3 text-sm text-slate-800 focus:border-[#0F4C81] outline-none resize-none"
                          />
                          <button
                            onClick={handleReplyToInquiry}
                            disabled={submittingReply || !replyMessage.trim()}
                            className="self-end px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-green-600 border border-green-600/30 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                          >
                            {submittingReply ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                        
                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() => handleToggleInquiryRead(viewingInquiry._id, viewingInquiry.read)}
                            className="flex-1 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {viewingInquiry.read ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            {viewingInquiry.read ? 'Mark Unread' : 'Mark Read'}
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(viewingInquiry._id)}
                            className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-800 border border-red-500/20 hover:border-red-500 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-slate-600 text-sm flex flex-col items-center gap-2">
                        <FileText size={32} className="opacity-50" />
                        <span>Select an inquiry from the left to read details</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ACTIVITIES TAB */}
              {activeTab === 'activities' && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Portfolio Activities List</h3>
                    <button
                      onClick={() => {
                        setActivityForm({ title: '', subtitle: '', image: '/port/image1.png', gradient: defaultGradients[0] });
                        setActiveModal('create_activity');
                      }}
                      className="px-4 py-2 bg-[#0F4C81] hover:bg-[#0B1F3A] hover:brightness-110 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-md transition-all cursor-pointer text-white"
                    >
                      <Plus size={16} />
                      <span>Add Activity</span>
                    </button>
                  </div>

                  <div className="bg-white shadow-md border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="p-4">Image & Preview</th>
                          <th className="p-4">Title</th>
                          <th className="p-4">Subtitle</th>
                          <th className="p-4">Created At</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map(act => (
                          <tr key={act._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                            <td className="p-4">
                              <div className="w-24 h-14 rounded-lg overflow-hidden relative border border-slate-200 flex items-center justify-center" style={{ background: act.gradient }}>
                                <img src={act.image} alt={act.title} className="w-full h-full object-cover opacity-60" onError={(e) => {e.target.style.display='none';}} />
                              </div>
                            </td>
                            <td className="p-4 font-bold text-slate-800 max-w-[200px] truncate">{act.title}</td>
                            <td className="p-4 font-light text-slate-600 max-w-[350px] truncate">{act.subtitle}</td>
                            <td className="p-4 text-xs font-light text-slate-500">{new Date(act.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setSelectedItem(act);
                                    setActivityForm({
                                      title: act.title,
                                      subtitle: act.subtitle,
                                      image: act.image,
                                      gradient: act.gradient || defaultGradients[0]
                                    });
                                    setActiveModal('edit_activity');
                                  }}
                                  className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteActivity(act._id)}
                                  className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {activities.length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center py-12 text-slate-600 text-sm">
                              No activities found. Please add one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SERVICES TAB */}
              {activeTab === 'services' && (
                <div className="flex flex-col gap-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Product Service Capability List</h3>
                    <button
                      onClick={() => {
                        setServiceForm({ title: '', icon: 'Settings', image: '/pneumatic.png', desc: '' });
                        setActiveModal('create_service');
                      }}
                      className="px-4 py-2 bg-[#0F4C81] hover:bg-[#0B1F3A] hover:brightness-110 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-md transition-all cursor-pointer text-white"
                    >
                      <Plus size={16} />
                      <span>Add Capability</span>
                    </button>
                  </div>

                  <div className="bg-white shadow-md border border-slate-200 rounded-2xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                          <th className="p-4">Icon & Preview</th>
                          <th className="p-4">Title</th>
                          <th className="p-4">Description</th>
                          <th className="p-4">Created At</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map(srv => {
                          const IconComponent = iconMap[srv.icon] || Settings;
                          return (
                            <tr key={srv._id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#0F4C81]">
                                    <IconComponent size={20} />
                                  </div>
                                  <div className="w-14 h-10 rounded overflow-hidden border border-slate-200 bg-[#F5F7FA]">
                                    <img src={srv.image} alt={srv.title} className="w-full h-full object-cover" onError={(e) => {e.target.style.display='none';}} />
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-bold text-slate-800 max-w-[200px] truncate">{srv.title}</td>
                              <td className="p-4 font-light text-slate-600 max-w-[400px] truncate">{srv.desc}</td>
                              <td className="p-4 text-xs font-light text-slate-500">{new Date(srv.createdAt).toLocaleDateString()}</td>
                              <td className="p-4 text-right">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => {
                                      setSelectedItem(srv);
                                      setServiceForm({
                                        title: srv.title,
                                        icon: srv.icon,
                                        image: srv.image,
                                        desc: srv.desc
                                      });
                                      setActiveModal('edit_service');
                                    }}
                                    className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteService(srv._id)}
                                    className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {services.length === 0 && (
                          <tr>
                            <td colSpan="5" className="text-center py-12 text-slate-600 text-sm">
                              No products or capabilities found. Please add one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CUSTOMIZE TAB */}
              {activeTab === 'customize' && (
                <form onSubmit={handleUpdateConfig} className="flex flex-col gap-8">
                  {/* Status Notification Alerts */}
                  {saveSuccess && (
                    <div className="bg-green-600/10 border border-green-600/20 text-green-600 p-4 rounded-xl text-sm font-semibold animate-pulse">
                      {saveSuccess}
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold">
                      {error}
                    </div>
                  )}

                  {/* Actions Header Bar */}
                  <div className="flex justify-between items-center bg-slate-200 p-4 rounded-2xl border border-slate-200 backdrop-blur-sm">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-lg">Site Settings & Landing Page Copy</h3>
                      <p className="text-xs text-slate-500 font-light mt-0.5">Customize copy and branding assets in real-time. Make sure to click save to push updates live.</p>
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0F4C81] hover:bg-[#0B1F3A] hover:brightness-110 active:scale-[0.98] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#04667b]/20 transition-all cursor-pointer text-white"
                    >
                      <CheckCircle size={16} />
                      <span>Save All Changes</span>
                    </button>
                  </div>

                  {/* Grid 1: General Copy & Journey Milestones */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* General Copy Card */}
                    <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="border-b border-slate-200 pb-3">
                        <h4 className="font-bold text-base text-[#0F4C81]">General Section Copy</h4>
                        <p className="text-xs text-slate-500 font-light mt-0.5">Edit main titles and descriptions shown on landing page.</p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Hero Headline Title</label>
                        <input
                          type="text"
                          value={customizeForm.heroTitle}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, heroTitle: e.target.value }))}
                          placeholder="Precision & Reliability"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-medium"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Hero Subtitle</label>
                        <textarea
                          value={customizeForm.heroSubtitle}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                          placeholder="Hero section subtitle description copy..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none min-h-[100px] text-slate-800 transition-all font-light resize-none leading-relaxed"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">About Core Description</label>
                        <textarea
                          value={customizeForm.aboutText}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, aboutText: e.target.value }))}
                          placeholder="About section core summary/description copy..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none min-h-[110px] text-slate-800 transition-all font-light resize-none leading-relaxed"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">About Title Header (Light text)</label>
                        <input
                          type="text"
                          value={customizeForm.aboutHeaderLight}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, aboutHeaderLight: e.target.value }))}
                          placeholder="Powering Industries with"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-medium"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">About Title Header (Bold text)</label>
                        <input
                          type="text"
                          value={customizeForm.aboutHeaderBold}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, aboutHeaderBold: e.target.value }))}
                          placeholder="Precision & Reliability"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Timeline Journey Milestones Card */}
                    <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-base text-[#0F4C81]">Our Journey Milestones</h4>
                          <p className="text-xs text-slate-500 font-light mt-0.5">Add, edit, or remove milestones in the company history timeline.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddJourney}
                          className="px-3 py-1.5 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Add Row</span>
                        </button>
                      </div>

                      <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                        {customizeForm.journey.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <input
                              type="text"
                              value={item.year}
                              onChange={e => handleUpdateJourney(idx, 'year', e.target.value)}
                              placeholder="Year (e.g. 2021)"
                              className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:border-[#0F4C81] outline-none text-slate-800 transition-all font-bold text-center"
                              required
                            />
                            <input
                              type="text"
                              value={item.event}
                              onChange={e => handleUpdateJourney(idx, 'event', e.target.value)}
                              placeholder="Describe milestone event..."
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#0F4C81] outline-none text-slate-800 transition-all"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveJourney(idx)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-slate-800 text-red-400 border border-red-500/10 hover:border-red-500 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Delete Row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {customizeForm.journey.length === 0 && (
                          <div className="text-center py-12 text-slate-600 text-xs">
                            No journey milestones added yet. Click Add Row.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SEO / Meta Tags Settings Card */}
                  <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="border-b border-slate-200 pb-3">
                      <h4 className="font-bold text-base text-[#0F4C81]">SEO / Meta Tags Settings</h4>
                      <p className="text-xs text-slate-500 font-light mt-0.5">Edit the website's Title, Meta Description, and Social Media preview images to improve Google ranking.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Meta Title</label>
                        <input
                          type="text"
                          value={customizeForm.metaTitle || ''}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                          placeholder="Concept Tools and Service | Industrial Supply & MRO"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-light"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Meta Description</label>
                        <textarea
                          value={customizeForm.metaDescription || ''}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                          placeholder="Providing reliable industrial tools..."
                          rows={2}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-light resize-y"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Social Preview Image URL (Open Graph)</label>
                        <input
                          type="text"
                          value={customizeForm.metaImage || ''}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, metaImage: e.target.value }))}
                          placeholder="https://yourwebsite.com/preview.jpg"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-light"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Search Engine Integrations Card */}
                  <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="border-b border-slate-200 pb-3">
                      <h4 className="font-bold text-base text-[#0F4C81]">Search Engine & Tracking Integrations</h4>
                      <p className="text-xs text-slate-500 font-light mt-0.5">Configure your Google Analytics, Tag Manager, and Search Console verification IDs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Google Analytics 4 (GA4) ID</label>
                        <input
                          type="text"
                          value={customizeForm.ga4Id || ''}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, ga4Id: e.target.value }))}
                          placeholder="G-XXXXXXXXXX"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-light"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Google Tag Manager (GTM) ID</label>
                        <input
                          type="text"
                          value={customizeForm.gtmId || ''}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, gtmId: e.target.value }))}
                          placeholder="GTM-XXXXXXX"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-light"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Google Site Verification Code</label>
                        <input
                          type="text"
                          value={customizeForm.googleSiteVerification || ''}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, googleSiteVerification: e.target.value }))}
                          placeholder="paste content from meta tag..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-light"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Bing Site Verification Code</label>
                        <input
                          type="text"
                          value={customizeForm.bingSiteVerification || ''}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, bingSiteVerification: e.target.value }))}
                          placeholder="paste content from meta tag..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-light"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cloudinary Settings Card */}
                  <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="border-b border-slate-200 pb-3">
                      <h4 className="font-bold text-base text-[#0F4C81]">Cloudinary Settings</h4>
                      <p className="text-xs text-slate-500 font-light mt-0.5">Configure your Cloudinary credentials to enable direct image uploads from this admin panel. Files will be organized under portfolio/e-commerce folders.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Cloudinary Cloud Name</label>
                        <input
                          type="text"
                          value={customizeForm.cloudinaryCloudName || ''}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, cloudinaryCloudName: e.target.value }))}
                          placeholder="e.g., dxxabcde"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-light"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Unsigned Upload Preset</label>
                        <input
                          type="text"
                          value={customizeForm.cloudinaryUploadPreset || ''}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, cloudinaryUploadPreset: e.target.value }))}
                          placeholder="e.g., unsigned_preset_name"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all font-light"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Why Choose Us Values Card */}
                  <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-base text-[#0F4C81]">Why Choose Us (Core Value Cards)</h4>
                        <p className="text-xs text-slate-500 font-light mt-0.5">Customize the value proposition boxes displayed in the About section.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddReason}
                        className="px-3 py-1.5 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Value Card</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customizeForm.reasons.map((reason, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 relative items-start group">
                          {/* Remove Card button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveReason(idx)}
                            className="absolute top-2 right-2 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-800 border border-red-500/10 hover:border-red-500 rounded-lg transition-all opacity-40 group-hover:opacity-100 cursor-pointer"
                            title="Remove Reason Card"
                          >
                            <Trash2 size={12} />
                          </button>

                          {/* Left Column: Icon Select */}
                          <div className="flex flex-col gap-2 shrink-0 items-center">
                            <label className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Icon</label>
                            <select
                              value={reason.icon}
                              onChange={e => handleUpdateReason(idx, 'icon', e.target.value)}
                              className="bg-white shadow-lg border border-slate-200 rounded-lg p-1.5 text-xs text-slate-800 outline-none focus:border-[#0F4C81] w-24 text-center"
                            >
                              <option value="ShieldCheck">Shield</option>
                              <option value="Cpu">CPU</option>
                              <option value="ThumbsUp">ThumbsUp</option>
                              <option value="HardHat">Safety</option>
                            </select>
                            <div className="w-10 h-10 rounded-full bg-white shadow-lg/80 border border-slate-200 flex items-center justify-center text-[#0F4C81] mt-1">
                              {reason.icon === 'ShieldCheck' && <ShieldCheck size={18} />}
                              {reason.icon === 'Cpu' && <Cpu size={18} />}
                              {reason.icon === 'ThumbsUp' && <ThumbsUp size={18} />}
                              {reason.icon === 'HardHat' && <HardHat size={18} />}
                            </div>
                          </div>

                          {/* Right Column: Inputs */}
                          <div className="flex-1 flex flex-col gap-2.5 pt-1">
                            <input
                              type="text"
                              value={reason.title}
                              onChange={e => handleUpdateReason(idx, 'title', e.target.value)}
                              placeholder="Title (e.g. HSE Compliance)"
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:border-[#0F4C81] outline-none text-slate-800 font-bold transition-all w-full"
                              required
                            />
                            <textarea
                              value={reason.desc}
                              onChange={e => handleUpdateReason(idx, 'desc', e.target.value)}
                              placeholder="Description copy detailing why this choice matter..."
                              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:border-[#0F4C81] outline-none text-slate-800 font-light transition-all w-full min-h-[48px] resize-none leading-relaxed"
                              required
                            />
                          </div>
                        </div>
                      ))}
                      {customizeForm.reasons.length === 0 && (
                        <div className="col-span-2 text-center py-12 text-slate-600 text-xs">
                          No value cards configured. Click Add Value Card to get started.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Partners & Customers Brand Logo Lists */}
                  <div className="grid grid-cols-1 gap-8">
                    {/* Partners & Customers Section Background Card */}
                    <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="border-b border-slate-200 pb-3">
                        <h4 className="font-bold text-base text-[#0F4C81]">Partners & Customers Section Background Gradient</h4>
                        <p className="text-xs text-slate-500 font-light mt-0.5">Customize the radial gradient background of the Partners and Customers sections. You can pick colors visually or type standard Hex/RGB color codes.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Color 1 */}
                        <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Center Color (0%)</label>
                          <div className="flex gap-3 items-center">
                            <input 
                              type="color" 
                              value={customizeForm.partnersBgColor1 && customizeForm.partnersBgColor1.startsWith('#') && customizeForm.partnersBgColor1.length === 7 ? customizeForm.partnersBgColor1 : '#112A4F'} 
                              onChange={e => setCustomizeForm(prev => ({ ...prev, partnersBgColor1: e.target.value }))}
                              className="w-10 h-10 border-0 bg-transparent rounded cursor-pointer shrink-0" 
                            />
                            <input 
                              type="text" 
                              value={customizeForm.partnersBgColor1} 
                              onChange={e => setCustomizeForm(prev => ({ ...prev, partnersBgColor1: e.target.value }))}
                              placeholder="#112A4F" 
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#0F4C81] outline-none text-slate-800 font-mono"
                              required
                            />
                          </div>
                        </div>

                        {/* Color 2 */}
                        <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Middle Color (65%)</label>
                          <div className="flex gap-3 items-center">
                            <input 
                              type="color" 
                              value={customizeForm.partnersBgColor2 && customizeForm.partnersBgColor2.startsWith('#') && customizeForm.partnersBgColor2.length === 7 ? customizeForm.partnersBgColor2 : '#040C19'} 
                              onChange={e => setCustomizeForm(prev => ({ ...prev, partnersBgColor2: e.target.value }))}
                              className="w-10 h-10 border-0 bg-transparent rounded cursor-pointer shrink-0" 
                            />
                            <input 
                              type="text" 
                              value={customizeForm.partnersBgColor2} 
                              onChange={e => setCustomizeForm(prev => ({ ...prev, partnersBgColor2: e.target.value }))}
                              placeholder="#040C19" 
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#0F4C81] outline-none text-slate-800 font-mono"
                              required
                            />
                          </div>
                        </div>

                        {/* Color 3 */}
                        <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Outer Color (100%)</label>
                          <div className="flex gap-3 items-center">
                            <input 
                              type="color" 
                              value={customizeForm.partnersBgColor3 && customizeForm.partnersBgColor3.startsWith('#') && customizeForm.partnersBgColor3.length === 7 ? customizeForm.partnersBgColor3 : '#02060C'} 
                              onChange={e => setCustomizeForm(prev => ({ ...prev, partnersBgColor3: e.target.value }))}
                              className="w-10 h-10 border-0 bg-transparent rounded cursor-pointer shrink-0" 
                            />
                            <input 
                              type="text" 
                              value={customizeForm.partnersBgColor3} 
                              onChange={e => setCustomizeForm(prev => ({ ...prev, partnersBgColor3: e.target.value }))}
                              placeholder="#02060C" 
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#0F4C81] outline-none text-slate-800 font-mono"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Live Gradient Preview inside admin */}
                      <div className="flex flex-col gap-2 mt-2">
                        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Gradient Preview</label>
                        <div 
                          className="h-20 w-full rounded-xl border border-slate-200 shadow-inner flex items-center justify-center font-bold text-xs tracking-wider text-slate-600"
                          style={{
                            background: `radial-gradient(ellipse at center, ${customizeForm.partnersBgColor1 || '#112A4F'} 0%, ${customizeForm.partnersBgColor2 || '#040C19'} 65%, ${customizeForm.partnersBgColor3 || '#02060C'} 100%)`
                          }}
                        >
                          Live Background Preview
                        </div>
                      </div>
                    </div>

                    {/* Partners List */}
                    <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-base text-[#0F4C81]">Brand Partner Logos</h4>
                          <p className="text-xs text-slate-500 font-light mt-0.5">Manage companies we partner with logo slider.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddPartner}
                          className="px-3 py-1.5 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Add Partner Logo</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customizeForm.partners.map((partner, idx) => (
                          <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 relative items-center group">
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemovePartner(idx)}
                              className="absolute top-2 right-2 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-800 border border-red-500/10 hover:border-red-500 rounded-lg transition-all opacity-40 group-hover:opacity-100 cursor-pointer"
                              title="Delete Logo Card"
                            >
                              <Trash2 size={12} />
                            </button>

                            {/* Logo Preview */}
                            <div className="w-16 h-16 rounded-xl bg-[#F5F7FA] border border-slate-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative">
                              <img
                                src={partner.src}
                                alt={partner.name}
                                className="max-w-full max-h-full object-contain opacity-70"
                                style={{ transform: `scale(${parseFloat(partner.scale) || 1})` }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>

                            {/* Logo Fields */}
                            <div className="flex-1 flex flex-col gap-2 pt-1">
                              <input
                                type="text"
                                value={partner.name}
                                onChange={e => handleUpdatePartner(idx, 'name', e.target.value)}
                                placeholder="Company Name"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:border-[#0F4C81] outline-none text-slate-800 font-semibold transition-all w-full"
                                required
                              />
                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={partner.src}
                                  onChange={e => handleUpdatePartner(idx, 'src', e.target.value)}
                                  placeholder="Image Path (e.g. /port/atlas.png)"
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] focus:border-[#0F4C81] outline-none text-slate-700 transition-all font-light"
                                  required
                                />
                                <label className="shrink-0 px-2 py-1 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors relative flex items-center justify-center">
                                  {uploadingField === `partner-${idx}` ? 'Uploading...' : 'Upload'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingField !== null}
                                    onChange={e => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleCloudinaryUpload(
                                          e.target.files[0],
                                          'port',
                                          (url) => handleUpdatePartner(idx, 'src', url),
                                          `partner-${idx}`
                                        );
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Scale:</span>
                                <input
                                  type="number"
                                  step="0.05"
                                  min="0.1"
                                  max="5.0"
                                  value={partner.scale ?? ''}
                                  onChange={e => handleUpdatePartner(idx, 'scale', e.target.value)}
                                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-xs focus:border-[#0F4C81] outline-none text-slate-800 text-center font-mono"
                                  required
                                />
                                <span className="text-[10px] text-slate-600">(e.g. 1.35)</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {customizeForm.partners.length === 0 && (
                          <div className="col-span-3 text-center py-12 text-slate-600 text-xs">
                            No brand partners configured. Click Add Partner Logo.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customers List */}
                    <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-base text-[#0F4C81]">Brand Customer Logos</h4>
                          <p className="text-xs text-slate-500 font-light mt-0.5">Manage prestigious customers logo marquee.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomer}
                          className="px-3 py-1.5 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Add Customer Logo</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customizeForm.customers.map((customer, idx) => (
                          <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 relative items-center group">
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomer(idx)}
                              className="absolute top-2 right-2 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-800 border border-red-500/10 hover:border-red-500 rounded-lg transition-all opacity-40 group-hover:opacity-100 cursor-pointer"
                              title="Delete Logo Card"
                            >
                              <Trash2 size={12} />
                            </button>

                            {/* Logo Preview */}
                            <div className="w-16 h-16 rounded-xl bg-[#F5F7FA] border border-slate-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative">
                              <img
                                src={customer.src}
                                alt={customer.name}
                                className="max-w-full max-h-full object-contain opacity-70"
                                style={{ transform: `scale(${parseFloat(customer.scale) || 1})` }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>

                            {/* Logo Fields */}
                            <div className="flex-1 flex flex-col gap-2 pt-1">
                              <input
                                type="text"
                                value={customer.name}
                                onChange={e => handleUpdateCustomer(idx, 'name', e.target.value)}
                                placeholder="Company Name"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:border-[#0F4C81] outline-none text-slate-800 font-semibold transition-all w-full"
                                required
                              />
                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={customer.src}
                                  onChange={e => handleUpdateCustomer(idx, 'src', e.target.value)}
                                  placeholder="Image Path (e.g. /port/suzlon.png)"
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] focus:border-[#0F4C81] outline-none text-slate-700 transition-all font-light"
                                  required
                                />
                                <label className="shrink-0 px-2 py-1 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors relative flex items-center justify-center">
                                  {uploadingField === `customer-${idx}` ? 'Uploading...' : 'Upload'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingField !== null}
                                    onChange={e => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleCloudinaryUpload(
                                          e.target.files[0],
                                          'port',
                                          (url) => handleUpdateCustomer(idx, 'src', url),
                                          `customer-${idx}`
                                        );
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Scale:</span>
                                <input
                                  type="number"
                                  step="0.05"
                                  min="0.1"
                                  max="5.0"
                                  value={customer.scale ?? ''}
                                  onChange={e => handleUpdateCustomer(idx, 'scale', e.target.value)}
                                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-xs focus:border-[#0F4C81] outline-none text-slate-800 text-center font-mono"
                                  required
                                />
                                <span className="text-[10px] text-slate-600">(e.g. 1.35)</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {customizeForm.customers.length === 0 && (
                          <div className="col-span-3 text-center py-12 text-slate-600 text-xs">
                            No brand customers configured. Click Add Customer Logo.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </form>
              )}

              {/* E-COMMERCE CUSTOMIZE TAB */}
              {activeTab === 'ecommCustomize' && (
                <form onSubmit={handleUpdateConfig} className="flex flex-col gap-8">
                  {/* Status Notification Alerts */}
                  {saveSuccess && (
                    <div className="bg-green-600/10 border border-green-600/20 text-green-600 p-4 rounded-xl text-sm font-semibold animate-pulse">
                      {saveSuccess}
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold">
                      {error}
                    </div>
                  )}

                  {/* Actions Header Bar */}
                  <div className="flex justify-between items-center bg-slate-200 p-4 rounded-2xl border border-slate-200 backdrop-blur-sm">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-lg">E-Commerce Storefront Customization</h3>
                      <p className="text-xs text-slate-500 font-light mt-0.5">Customize your storefront banners, marquees, and carousels. Make sure to click save to push updates live.</p>
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0F4C81] hover:bg-[#0B1F3A] hover:brightness-110 active:scale-[0.98] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#04667b]/20 transition-all cursor-pointer text-white"
                    >
                      <CheckCircle size={16} />
                      <span>Save All Changes</span>
                    </button>
                  </div>

                  {/* E-commerce Settings & Hero Carousel Slider Customization */}
                  <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 mt-6">
                    <div className="border-b border-slate-200 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-base text-[#0F4C81]">E-commerce Customization & Carousels</h4>
                        <p className="text-xs text-slate-500 font-light mt-0.5">Control the slides and headline text displayed in the storefront hero section.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddEcommSlide}
                        className="px-4 py-2 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#0F4C81]/20"
                      >
                        + Add Slider Slide
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 max-w-xl">
                      <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider flex justify-between mb-1">
                        <span>Top Banner News / Announcement Text</span>
                        <label className="flex items-center gap-2 cursor-pointer text-[#0F4C81] font-bold normal-case tracking-normal">
                          <input
                            type="checkbox"
                            checked={customizeForm.showEcommBanner !== false}
                            onChange={(e) => setCustomizeForm(prev => ({ ...prev, showEcommBanner: e.target.checked }))}
                            className="w-4 h-4 rounded bg-white border-slate-200 text-[#0F4C81] focus:ring-[#0F4C81]"
                          />
                          Make Banner Alive
                        </label>
                      </div>
                      <input
                        type="text"
                        value={customizeForm.ecommBannerText || ''}
                        onChange={e => setCustomizeForm(prev => ({ ...prev, ecommBannerText: e.target.value }))}
                        placeholder="e.g. CTS B2B Procurement Desk - Fast Quotations & Logistics"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 max-w-xl">
                      <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider mb-1">
                        Company Email (For Order & Inquiry CCs)
                      </div>
                      <input
                        type="email"
                        value={customizeForm.companyEmail || ''}
                        onChange={e => setCustomizeForm(prev => ({ ...prev, companyEmail: e.target.value }))}
                        placeholder="e.g. sales@yourcompany.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none text-slate-800 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(customizeForm.ecommSlides || []).map((slide, idx) => (
                        <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50 relative flex flex-col gap-4">
                          <button
                            type="button"
                            onClick={() => handleRemoveEcommSlide(idx)}
                            className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove slide"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                            Hero Slide #{idx + 1}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-500 uppercase">Tag (Category / Highlight)</label>
                              <input
                                type="text"
                                value={slide.tag || ''}
                                onChange={e => handleUpdateEcommSlide(idx, 'tag', e.target.value)}
                                placeholder="POWER TOOLS"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-[#0F4C81] outline-none"
                                required
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] text-slate-500 uppercase">Title</label>
                              <input
                                type="text"
                                value={slide.title || ''}
                                onChange={e => handleUpdateEcommSlide(idx, 'title', e.target.value)}
                                placeholder="Precision German Engineering"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-[#0F4C81] outline-none"
                                required
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 uppercase">Subtitle Description</label>
                            <input
                              type="text"
                              value={slide.subtitle || ''}
                              onChange={e => handleUpdateEcommSlide(idx, 'subtitle', e.target.value)}
                              placeholder="Heavy duty drilling and core machines..."
                              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-[#0F4C81] outline-none"
                              required
                            />
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] text-slate-500 uppercase">Image URL / Resource Path</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={slide.image || ''}
                                onChange={e => handleUpdateEcommSlide(idx, 'image', e.target.value)}
                                placeholder="Cloudinary URL or local path"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-[#0F4C81] outline-none"
                                required
                              />
                              <label className="shrink-0 px-3 py-1.5 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center justify-center border border-[#0F4C81]/20">
                                {uploadingField === `slide-${idx}` ? 'Uploading...' : 'Upload'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  disabled={uploadingField !== null}
                                  onChange={e => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleCloudinaryUpload(
                                        e.target.files[0],
                                        'ecomm',
                                        (url) => handleUpdateEcommSlide(idx, 'image', url),
                                        `slide-${idx}`
                                      );
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(customizeForm.ecommSlides || []).length === 0 && (
                        <div className="col-span-2 text-center py-12 text-slate-600 text-xs border border-dashed border-slate-200 rounded-xl">
                          No slides configured. Click Add Slider Slide.
                        </div>
                      )}
                    </div>

                    {/* E-COMMERCE STOREFRONT SETTINGS */}
                    <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 mt-6">
                      <div className="border-b border-slate-200 pb-3">
                        <h4 className="font-bold text-base text-[#0F4C81]">Storefront Dynamic Sections</h4>
                        <p className="text-xs text-slate-500 font-light mt-0.5">Toggle and customize the Brand Spotlight and Newly Added sections on your E-commerce shop page.</p>
                      </div>

                      <div className="flex flex-col gap-4">
                        {/* Brand Spotlight */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ecommCustomizeForm.showBrandSpotlight}
                              onChange={e => setEcommCustomizeForm({ ...ecommCustomizeForm, showBrandSpotlight: e.target.checked })}
                              className="w-4 h-4 rounded bg-white border-slate-200 text-[#0F4C81] focus:ring-[#0F4C81] focus:ring-offset-slate-900"
                            />
                            <span className="text-sm font-semibold">Show Brand Spotlight Section</span>
                          </label>

                          {ecommCustomizeForm.showBrandSpotlight && (
                            <div className="flex flex-col sm:flex-row gap-4 sm:ml-7">
                              <div className="flex-1 flex flex-col gap-1.5">
                                <label className="text-[10px] text-slate-500 uppercase">Tagline</label>
                                <input
                                  type="text"
                                  value={ecommCustomizeForm.brandSpotlightTag || ''}
                                  onChange={e => setEcommCustomizeForm({ ...ecommCustomizeForm, brandSpotlightTag: e.target.value })}
                                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] outline-none"
                                />
                              </div>
                              <div className="flex-2 flex flex-col gap-1.5">
                                <label className="text-[10px] text-slate-500 uppercase">Title</label>
                                <input
                                  type="text"
                                  value={ecommCustomizeForm.brandSpotlightTitle || ''}
                                  onChange={e => setEcommCustomizeForm({ ...ecommCustomizeForm, brandSpotlightTitle: e.target.value })}
                                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] outline-none w-full"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Newly Added */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-3">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={ecommCustomizeForm.showNewlyAdded}
                              onChange={e => setEcommCustomizeForm({ ...ecommCustomizeForm, showNewlyAdded: e.target.checked })}
                              className="w-4 h-4 rounded bg-white border-slate-200 text-[#0F4C81] focus:ring-[#0F4C81] focus:ring-offset-slate-900"
                            />
                            <span className="text-sm font-semibold">Show Newly Added Products Section</span>
                          </label>

                          {ecommCustomizeForm.showNewlyAdded && (
                            <div className="flex flex-col gap-3 ml-7">
                              <div className="flex gap-4">
                                <div className="flex-1 flex flex-col gap-1.5">
                                  <label className="text-[10px] text-slate-500 uppercase">Tagline</label>
                                  <input
                                    type="text"
                                    value={ecommCustomizeForm.newlyAddedTag || ''}
                                    onChange={e => setEcommCustomizeForm({ ...ecommCustomizeForm, newlyAddedTag: e.target.value })}
                                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] outline-none"
                                  />
                                </div>
                                <div className="flex-2 flex flex-col gap-1.5">
                                  <label className="text-[10px] text-slate-500 uppercase">Title</label>
                                  <input
                                    type="text"
                                    value={ecommCustomizeForm.newlyAddedTitle || ''}
                                    onChange={e => setEcommCustomizeForm({ ...ecommCustomizeForm, newlyAddedTitle: e.target.value })}
                                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] outline-none w-full"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] text-slate-500 uppercase">Subtitle / Description</label>
                                <textarea
                                  value={ecommCustomizeForm.newlyAddedSubtitle || ''}
                                  onChange={e => setEcommCustomizeForm({ ...ecommCustomizeForm, newlyAddedSubtitle: e.target.value })}
                                  className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] outline-none resize-none h-16"
                                />
                              </div>
                              <div className="flex items-center gap-4 mt-2">
                                <label className="text-[10px] text-slate-500 uppercase tracking-wide">Number of Products to Display</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="50"
                                  value={ecommCustomizeForm.newlyAddedLimit}
                                  onChange={e => setEcommCustomizeForm({ ...ecommCustomizeForm, newlyAddedLimit: parseInt(e.target.value) || 8 })}
                                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:border-[#0F4C81] outline-none w-24 font-mono"
                                />
                              </div>
                              <div className="flex flex-col gap-1.5 relative">
                                <label className="text-[10px] text-slate-500 uppercase">Manually Highlighted Products ({(ecommCustomizeForm.newlyAddedProductIDs || []).length} / {ecommCustomizeForm.newlyAddedLimit})</label>
                                <p className="text-[10px] text-slate-500">Search and add specific products to feature on the homepage.</p>
                                
                                <div className="flex flex-wrap gap-2 mb-1">
                                  {(ecommCustomizeForm.newlyAddedProductIDs || []).map((id, idx) => {
                                    const prod = ecommProducts.find(p => p.model === id || p.product_id === id);
                                    return (
                                      <div key={idx} className="flex items-center gap-1.5 bg-[#0F4C81]/10 border border-[#0F4C81]/30 px-2 py-1 rounded-md">
                                        <span className="text-[10px] text-[#0F4C81] font-bold">{prod ? prod.model || prod.product_id : id}</span>
                                        <button
                                          onClick={() => {
                                            setEcommCustomizeForm(prev => ({
                                              ...prev,
                                              newlyAddedProductIDs: prev.newlyAddedProductIDs.filter(pid => pid !== id)
                                            }));
                                          }}
                                          className="text-[#0F4C81] hover:text-slate-800"
                                        >
                                          <XCircle size={12} />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>

                                {(ecommCustomizeForm.newlyAddedProductIDs || []).length < ecommCustomizeForm.newlyAddedLimit && (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      placeholder="Search product by name or model..."
                                      value={highlightSearchTerm}
                                      onChange={e => setHighlightSearchTerm(e.target.value)}
                                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:border-[#0F4C81] outline-none w-full"
                                    />
                                    {highlightSearchTerm && (
                                      <div className="absolute top-full left-0 right-0 mt-1 bg-white shadow-lg border border-slate-200 rounded-xl max-h-48 overflow-y-auto z-50 shadow-xl custom-scrollbar p-1">
                                        {ecommProducts
                                          .filter(p => (p.product_name || '').toLowerCase().includes(highlightSearchTerm.toLowerCase()) || (p.model || '').toLowerCase().includes(highlightSearchTerm.toLowerCase()))
                                          .slice(0, 10)
                                          .map(p => (
                                            <div
                                              key={p._id || p.product_id}
                                              onClick={() => {
                                                if (!(ecommCustomizeForm.newlyAddedProductIDs || []).includes(p.model || p.product_id)) {
                                                  setEcommCustomizeForm(prev => ({
                                                    ...prev,
                                                    newlyAddedProductIDs: [...(prev.newlyAddedProductIDs || []), p.model || p.product_id]
                                                  }));
                                                }
                                                setHighlightSearchTerm('');
                                              }}
                                              className="px-3 py-2 text-xs text-slate-700 hover:text-slate-800 hover:bg-[#0F4C81]/20 rounded-lg cursor-pointer flex justify-between items-center"
                                            >
                                              <span className="truncate pr-2">{p.product_name}</span>
                                              <span className="text-[9px] text-[#0F4C81] font-mono shrink-0">{p.model}</span>
                                            </div>
                                          ))
                                        }
                                        {ecommProducts.filter(p => (p.product_name || '').toLowerCase().includes(highlightSearchTerm.toLowerCase()) || (p.model || '').toLowerCase().includes(highlightSearchTerm.toLowerCase())).length === 0 && (
                                          <div className="px-3 py-2 text-xs text-slate-500 text-center">No products found</div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* E-COMMERCE BRANDS / PARTNER LOGOS */}
                    <div className="bg-white shadow-md border border-slate-200 rounded-2xl p-6 flex flex-col gap-6 mt-6">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                        <div className="flex flex-col">
                          <h4 className="font-bold text-base text-[#0F4C81]">E-Commerce Brand Partner Logos</h4>
                          <p className="text-xs text-slate-500 font-light mt-0.5">Manage the brand logos displayed in the "Brand Spotlight" slider.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddEcommBrand}
                          className="px-4 py-2 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-[#0F4C81]/20 flex items-center gap-2"
                        >
                          <Plus size={14} />
                          <span>Add Brand Logo</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {ecommBrandsLocal.map((brand, idx) => (
                          <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 relative items-center group">
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveEcommBrand(idx)}
                              className="absolute top-2 right-2 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-800 border border-red-500/10 hover:border-red-500 rounded-lg transition-all opacity-40 group-hover:opacity-100 cursor-pointer"
                              title="Delete Brand Logo"
                            >
                              <Trash2 size={12} />
                            </button>

                            {/* Logo Preview */}
                            <div className="w-16 h-16 rounded-xl bg-[#F5F7FA] border border-slate-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative">
                              <img
                                src={brand.src || brand.logoUrl || 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png'}
                                alt={brand.name}
                                className="max-w-full max-h-full object-contain opacity-80"
                                style={{ transform: `scale(${parseFloat(brand.scale) || 1})` }}
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            </div>

                            {/* Logo Fields */}
                            <div className="flex-1 flex flex-col gap-2 pt-1">
                              <input
                                type="text"
                                value={brand.name}
                                onChange={e => handleUpdateEcommBrand(idx, 'name', e.target.value)}
                                placeholder="Brand Name"
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:border-[#0F4C81] outline-none text-slate-800 font-semibold transition-all w-full"
                                required
                              />
                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={brand.src || brand.logoUrl || ''}
                                  onChange={e => handleUpdateEcommBrand(idx, 'src', e.target.value)}
                                  placeholder="Image Path"
                                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] focus:border-[#0F4C81] outline-none text-slate-700 transition-all font-light"
                                  required
                                />
                                <label className="shrink-0 px-2 py-1 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors relative flex items-center justify-center">
                                  {uploadingField === `ecomm_brand_${idx}` ? 'Uploading...' : 'Upload'}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    disabled={uploadingField !== null}
                                    onChange={e => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleCloudinaryUpload(
                                          e.target.files[0],
                                          'ecomm',
                                          (url) => handleUpdateEcommBrand(idx, 'src', url),
                                          `ecomm_brand_${idx}`
                                        );
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 uppercase font-semibold">Scale:</span>
                                <input
                                  type="number"
                                  step="0.05"
                                  min="0.1"
                                  max="5.0"
                                  value={brand.scale ?? 1.0}
                                  onChange={e => handleUpdateEcommBrand(idx, 'scale', e.target.value)}
                                  className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5 text-xs focus:border-[#0F4C81] outline-none text-slate-800 text-center font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {ecommBrandsLocal.length === 0 && (
                          <div className="col-span-3 text-center py-12 text-slate-600 text-xs border border-dashed border-slate-200 rounded-xl mt-4">
                            No brands configured. Click Add Brand Logo to create one.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* E-COMMERCE CATALOG TAB */}
              {activeTab === 'ecomm' && (
                <EcommCatalogManager 
                  products={ecommProducts} 
                  setProducts={setEcommProducts}
                  brands={brandsList}
                  setBrands={setBrandsList}
                  setActiveModal={setActiveModal}
                  setActiveTab={setActiveTab}
                  setSelectedItem={setSelectedItem}
                  setEcommProductForm={setEcommProductForm}
                  API_BASE_URL={API_BASE_URL}
                  fetchStatsOnly={fetchStatsOnly}
                  setDeleteConfirmData={setDeleteConfirmData}
                />
              )}

              {/* E-COMMERCE ORDERS & RFQ TAB */}
              {activeTab === 'orders' && (
                <EcommOrdersManager
                  orders={ordersList}
                  setOrders={setOrdersList}
                  setActiveModal={setActiveModal}
                  setSelectedItem={setSelectedItem}
                  API_BASE_URL={API_BASE_URL}
                  setDeleteConfirmData={setDeleteConfirmData}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* CRUD MODALS & DIALOGS */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setActiveModal(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`bg-white border border-slate-200 rounded-2xl w-full overflow-hidden shadow-2xl relative z-10 text-slate-800 transition-all duration-300 ${
                activeModal === 'import_ecomm_csv' || activeModal === 'create_ecomm_product' || activeModal === 'edit_ecomm_product' || activeModal === 'edit_order_ecomm' || activeModal === 'manage_brands_ecomm'
                  ? 'max-w-3xl'
                  : 'max-w-lg'
              }`}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800">
                  {activeModal === 'create_activity' && 'Add New Activity'}
                  {activeModal === 'edit_activity' && 'Edit Activity'}
                  {activeModal === 'create_service' && 'Add Product/Service Capability'}
                  {activeModal === 'edit_service' && 'Edit Product/Service Capability'}
                  {activeModal === 'create_ecomm_product' && 'Add E-commerce Product'}
                  {activeModal === 'edit_ecomm_product' && 'Edit E-commerce Product'}
                  {activeModal === 'import_ecomm_csv' && 'Import Catalog via CSV'}
                  {activeModal === 'export_catalog_ecomm' && 'Export Catalog to CSV'}
                  {activeModal === 'mass_delete_ecomm' && 'Mass Delete Catalog Products'}
                  {activeModal === 'manage_brands_ecomm' && 'Partner Brand Manager'}
                  {activeModal === 'storefront_settings_ecomm' && 'E-Commerce Storefront Settings'}
                  {activeModal === 'edit_order_ecomm' && 'Process RFQ & Price Quotation Worksheet'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
                  <XCircle size={20} />
                </button>
              </div>

              {/* Modal Form */}
              {/* ACTIVITIES FORMS */}
              {(activeModal === 'create_activity' || activeModal === 'edit_activity') && (
                <form onSubmit={activeModal === 'create_activity' ? handleCreateActivitySubmit : handleEditActivitySubmit} className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Activity Title</label>
                    <input 
                      type="text" 
                      value={activityForm.title} 
                      onChange={e => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Project Highlights" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none transition-all"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Subtitle / Description</label>
                    <textarea 
                      value={activityForm.subtitle} 
                      onChange={e => setActivityForm(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Enter a brief summary of the activity..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none min-h-[80px] transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Image Resource Path</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={activityForm.image} 
                        onChange={e => setActivityForm(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="e.g., /port/image1.png" 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none transition-all"
                        required
                      />
                      <label className="shrink-0 px-4 py-2.5 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center border border-[#0F4C81]/20">
                        {uploadingField === 'activity' ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingField !== null}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleCloudinaryUpload(
                                e.target.files[0],
                                'port',
                                (url) => setActivityForm(prev => ({ ...prev, image: url })),
                                'activity'
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Select Theme Gradient</label>
                    <select
                      value={activityForm.gradient}
                      onChange={e => setActivityForm(prev => ({ ...prev, gradient: e.target.value }))}
                      className="w-full bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none transition-all text-slate-800"
                    >
                      {defaultGradients.map((g, idx) => (
                        <option key={idx} value={g}>Theme Gradient {idx + 1}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gradient Preview */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Preview Card Background</label>
                    <div className="h-16 rounded-xl flex items-center justify-center font-bold text-sm text-slate-800 border border-slate-200 shadow-inner" style={{ background: activityForm.gradient }}>
                      {activityForm.title || 'Gradient Preview'}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2.5 bg-[#0F4C81] hover:bg-[#0B1F3A] hover:brightness-110 rounded-xl text-xs font-semibold cursor-pointer text-white">
                      {activeModal === 'create_activity' ? 'Save Activity' : 'Update Activity'}
                    </button>
                  </div>
                </form>
              )}

              {/* SERVICES FORMS */}
              {(activeModal === 'create_service' || activeModal === 'edit_service') && (
                <form onSubmit={activeModal === 'create_service' ? handleCreateServiceSubmit : handleEditServiceSubmit} className="p-6 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Capability Title</label>
                      <input 
                        type="text" 
                        value={serviceForm.title} 
                        onChange={e => setServiceForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Heavy Pneumatics" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Select Lucide Icon</label>
                      <select
                        value={serviceForm.icon}
                        onChange={e => setServiceForm(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none transition-all text-slate-800"
                      >
                        {Object.keys(iconMap).map(iconName => (
                          <option key={iconName} value={iconName}>{iconName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Image Path</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={serviceForm.image} 
                        onChange={e => setServiceForm(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="e.g., /port/pneumatic.png" 
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none transition-all"
                        required
                      />
                      <label className="shrink-0 px-4 py-2.5 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center border border-[#0F4C81]/20">
                        {uploadingField === 'service' ? 'Uploading...' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingField !== null}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleCloudinaryUpload(
                                e.target.files[0],
                                'port',
                                (url) => setServiceForm(prev => ({ ...prev, image: url })),
                                'service'
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Description</label>
                    <textarea 
                      value={serviceForm.desc} 
                      onChange={e => setServiceForm(prev => ({ ...prev, desc: e.target.value }))}
                      placeholder="Describe what is provided in this category..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] focus:bg-slate-100 outline-none min-h-[90px] transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2.5 bg-[#0F4C81] hover:bg-[#0B1F3A] hover:brightness-110 rounded-xl text-xs font-semibold cursor-pointer text-white">
                      {activeModal === 'create_service' ? 'Save Capability' : 'Update Capability'}
                    </button>
                  </div>
                </form>
              )}

              {/* E-COMMERCE PRODUCT MODAL */}
              {(activeModal === 'create_ecomm_product' || activeModal === 'edit_ecomm_product') && (
                <EcommProductFormModal
                  activeModal={activeModal}
                  selectedItem={selectedItem}
                  ecommProductForm={ecommProductForm}
                  setEcommProductForm={setEcommProductForm}
                  setProducts={setEcommProducts}
                  setActiveModal={setActiveModal}
                  API_BASE_URL={API_BASE_URL}
                  fetchStatsOnly={fetchStatsOnly}
                  handleCloudinaryUpload={handleCloudinaryUpload}
                  uploadingField={uploadingField}
                  setUploadingField={setUploadingField}
                  customizeForm={customizeForm}
                  brands={brandsList}
                />
              )}

              {/* CSV IMPORT MODAL */}
              {activeModal === 'import_ecomm_csv' && (
                <EcommCsvImportModal
                  setProducts={setEcommProducts}
                  setActiveModal={setActiveModal}
                  API_BASE_URL={API_BASE_URL}
                  fetchStatsOnly={fetchStatsOnly}
                  brands={brandsList}
                />
              )}

              {/* MASS DELETE MODAL */}
              {activeModal === 'mass_delete_ecomm' && (
                <EcommMassDeleteModal
                  products={ecommProducts}
                  setProducts={setEcommProducts}
                  setActiveModal={setActiveModal}
                  API_BASE_URL={API_BASE_URL}
                  fetchStatsOnly={fetchStatsOnly}
                  brands={brandsList}
                />
              )}

              {/* EXPORT CATALOG MODAL */}
              {activeModal === 'export_catalog_ecomm' && (
                <EcommExportModal
                  products={ecommProducts}
                  brands={brandsList}
                  setActiveModal={setActiveModal}
                />
              )}


              {/* BRAND MANAGER MODAL */}
              {activeModal === 'manage_brands_ecomm' && (
                <EcommBrandManagerModal
                  brands={brandsList}
                  setBrands={setBrandsList}
                  setActiveModal={setActiveModal}
                  API_BASE_URL={API_BASE_URL}
                  handleCloudinaryUpload={handleCloudinaryUpload}
                  uploadingField={uploadingField}
                  setUploadingField={setUploadingField}
                  setDeleteConfirmData={setDeleteConfirmData}
                />
              )}

              {/* STOREFRONT SETTINGS MODAL */}
              {activeModal === 'storefront_settings_ecomm' && (
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-4">Redirecting...</h3>
                  <p className="text-sm text-slate-500 mb-6">Storefront Settings are managed in the Customization section.</p>
                  <button onClick={() => { setActiveModal(null); setActiveTab('ecommCustomize'); }} className="px-6 py-2.5 bg-[#0F4C81] text-white rounded-xl font-bold">
                    Go to Storefront Settings
                  </button>
                </div>
              )}

              {/* ORDER EDIT / QUOTATION PROPOSAL MODAL */}
              {activeModal === 'edit_order_ecomm' && (
                <EcommOrderEditModal
                  order={selectedItem}
                  setOrders={setOrdersList}
                  setActiveModal={setActiveModal}
                  API_BASE_URL={API_BASE_URL}
                />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM DELETE CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteConfirmData && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirmData(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 text-slate-800 p-6 flex flex-col gap-4"
            >
              <h3 className="font-bold text-lg text-slate-800 tracking-wide">{deleteConfirmData.title}</h3>
              <p className="text-sm font-light text-slate-600 leading-relaxed">
                {deleteConfirmData.message}
              </p>
              <div className="flex gap-3 justify-end mt-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmData(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteConfirmData.onConfirm();
                    setDeleteConfirmData(null);
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 rounded-xl text-xs font-semibold cursor-pointer text-slate-800 shadow-lg shadow-red-600/20"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* CUSTOMER HISTORY MODAL */}
      <AnimatePresence>
        {selectedUserHistory && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedUserHistory(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl relative z-10 flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Customer History</h3>
                  <p className="text-xs text-[#0F4C81]">{selectedUserHistory.email}</p>
                </div>
                <button onClick={() => setSelectedUserHistory(null)} className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
                  <XCircle size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex flex-col gap-6">
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2"><ShoppingCart size={16} /> Quotation Requests</h4>
                  {selectedUserHistory.orders?.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedUserHistory.orders.map(o => (
                        <div key={o._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-800 mr-2">{o.referenceId}</span>
                            <span className="text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-md ${o.status === 'Completed' ? 'bg-green-600/20 text-green-600' : 'bg-orange-500/20 text-orange-400'}`}>
                            {o.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-500 italic">No quotation requests found.</p>}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2"><Inbox size={16} /> General Inquiries</h4>
                  {selectedUserHistory.inquiries?.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedUserHistory.inquiries.map(i => (
                        <div key={i._id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-1 text-xs">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#0F4C81]">{i.subject}</span>
                            <span className="text-slate-500">{new Date(i.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className="text-slate-600 line-clamp-2">{i.message}</span>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-xs text-slate-500 italic">No inquiries found.</p>}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEWSLETTER MODAL */}
      <AnimatePresence>
        {isNewsletterOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsNewsletterOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl relative z-10 flex flex-col"
            >
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Send Newsletter</h3>
                  <p className="text-xs text-slate-600">Blast an email to all registered storefront customers.</p>
                </div>
                <button onClick={() => setIsNewsletterOpen(false)} className="text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
                  <XCircle size={20} />
                </button>
              </div>
              <form onSubmit={handleSendNewsletter} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-600 font-semibold uppercase">Banner Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          // Strip the Data URL prefix to get pure base64
                          const base64String = reader.result.split(',')[1];
                          setNewsletterForm(prev => ({
                            ...prev,
                            bannerBase64: base64String,
                            bannerName: file.name
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 focus:border-[#0F4C81] outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#0F4C81]/20 file:text-[#0F4C81] hover:file:bg-[#0F4C81]/30"
                  />
                  {newsletterForm.bannerName && <span className="text-xs text-[#0F4C81]">Selected: {newsletterForm.bannerName}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-600 font-semibold uppercase">Email Subject</label>
                  <input
                    type="text"
                    required
                    value={newsletterForm.subject}
                    onChange={e => setNewsletterForm({...newsletterForm, subject: e.target.value})}
                    placeholder="e.g. New Product Line Announcement!"
                    className="w-full bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0F4C81] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-600 font-semibold uppercase">HTML Content</label>
                  <textarea
                    required
                    value={newsletterForm.htmlContent}
                    onChange={e => setNewsletterForm({...newsletterForm, htmlContent: e.target.value})}
                    placeholder="<h1>Hello!</h1><p>Check out our new products...</p>"
                    rows={6}
                    className="w-full bg-white shadow-lg border border-slate-200 rounded-xl p-4 text-sm text-slate-800 focus:border-[#0F4C81] outline-none font-mono resize-none overflow-y-auto"
                  />
                </div>
                <div className="flex justify-end pt-4 mt-2 border-t border-slate-200">
                  <button type="submit" className="px-6 py-2.5 bg-[#0F4C81] hover:bg-[#0B1F3A] text-white text-sm font-bold rounded-xl shadow-lg hover:brightness-110 transition-all cursor-pointer">
                    Send
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Side Links Helper
function SidebarLink({ label, icon, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between py-3 px-4 rounded-xl text-sm font-medium transition-all cursor-pointer ${
        active 
          ? 'bg-gradient-to-r from-[#04667b]/20 to-[#0F4C81]/10 text-[#0F4C81] border-l-4 border-[#0F4C81] pl-3 shadow-[0_4px_12px_rgba(4,102,123,0.05)]' 
          : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-l-4 border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#0F4C81] text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

// Stats Cards Helper
function DashboardCard({ title, value, icon, color, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-2xl bg-gradient-to-b border flex flex-col gap-4 shadow-md ${color} ${onClick ? 'cursor-pointer hover:brightness-110 transition-all' : ''}`}
    >
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
          {icon}
        </div>
      </div>
      <span className="text-3xl font-extrabold tracking-tight text-slate-800 leading-none">
        {value !== undefined ? value : '-'}
      </span>
    </div>
  );
}

// Admin login protection view
function AdminLogin({ onSubmit, error, loading }) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F7FA] p-6 text-slate-800">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#04667b_0%,_transparent_60%)] opacity-20" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2 items-center text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1.5 mb-2">
            <ArrowLeft size={12} />
            <span>Back to site</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-wide">Admin Dashboard</h2>
          <p className="text-sm font-light text-slate-500">Please authenticate to access administrator settings.</p>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-500"><Mail size={16} /></span>
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0F4C81] focus:bg-slate-100 text-sm outline-none transition-all placeholder:text-slate-700 text-slate-800"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-500"><Lock size={16} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#0F4C81] focus:bg-slate-100 text-sm outline-none transition-all placeholder:text-slate-700 text-slate-800"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0F4C81] hover:bg-[#0B1F3A] hover:brightness-110 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(4,102,123,0.3)] cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ==========================================
// E-COMMERCE SUB-COMPONENTS
// ==========================================

// EcommCatalogManager Component
function EcommCatalogManager({ products, setProducts, brands, setBrands, setActiveModal, setActiveTab, setSelectedItem, setEcommProductForm, API_BASE_URL, fetchStatsOnly, setDeleteConfirmData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const approvedBrands = brands && brands.length > 0 
    ? brands.map(b => b.name)
    : [
        'Atlas Protective Products',
        'Bosch Power Tools',
        'Cromwell Tools Industries',
        'Eibenstock',
        'Ingersoll Rand',
        'Stanley Black & Decker'
      ];

  // Filtering products
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery.trim() || 
      p.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.model?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesBrand = brandFilter === 'All' || p.brand === brandFilter;
    
    return matchesSearch && matchesBrand;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    if (!products || products.length === 0) return alert('No products to export');
    
    const headers = ['Product ID', 'SKU', 'Name', 'Brand', 'Category', 'Type', 'Model', 'Description'];
    let csvContent = headers.join(',') + '\\n';
    
    products.forEach(p => {
      const row = [
        p.product_id || '',
        p.sku || '',
        `"${(p.product_name || '').replace(/"/g, '""')}"`,
        `"${p.brand || ''}"`,
        `"${p.category || ''}"`,
        `"${p.type || ''}"`,
        `"${p.model || ''}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`
      ];
      csvContent += row.join(',') + '\\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cts_catalog_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditClick = (product) => {
    setSelectedItem(product);
    setEcommProductForm({
      product_id: product.product_id || '',
      sku: product.sku || '',
      brand: product.brand || 'Ingersoll Rand',
      category: product.category || 'Power Tools',
      type: product.type || '',
      sub_type: product.sub_type || '',
      model: product.model || '',
      product_name: product.product_name || '',
      description: product.description || '',
      specifications: product.specifications || '',
      image: product.images?.[0] || 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png'
    });
    setActiveModal('edit_ecomm_product');
  };

  const handleAddClick = () => {
    setSelectedItem(null);
    setEcommProductForm({
      product_id: '',
      sku: '',
      brand: 'Ingersoll Rand',
      category: 'Power Tools',
      type: '',
      sub_type: '',
      model: '',
      product_name: '',
      description: '',
      specifications: '',
      image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png'
    });
    setActiveModal('create_ecomm_product');
  };

  const handleDeleteProduct = (id) => {
    setDeleteConfirmData({
      title: 'Delete Catalog Product',
      message: 'Are you sure you want to delete this catalog product? This action is permanent and cannot be undone.',
      onConfirm: async () => {
        const token = localStorage.getItem('cts_token');
        try {
          const res = await fetch(`${API_BASE_URL}/api/ecomm/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setProducts(prev => prev.filter(p => p._id !== id));
            fetchStatsOnly();
            if (paginatedProducts.length === 1 && currentPage > 1) {
              setCurrentPage(currentPage - 1);
            }
          } else {
            alert(data.error || 'Failed to delete product.');
          }
        } catch (err) {
          console.error(err);
          alert('Connection error.');
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header controls bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-200 p-5 rounded-2xl border border-slate-200 backdrop-blur-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by name, SKU, ID, model..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#0F4C81] outline-none text-slate-800 transition-all font-light"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Brand select filter */}
          <select
            value={brandFilter}
            onChange={e => { setBrandFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0F4C81] outline-none transition-all cursor-pointer"
          >
            <option value="All">All Brands</option>
            {approvedBrands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {/* Mass Delete */}
          <button
            onClick={() => setActiveModal('mass_delete_ecomm')}
            className="px-4 py-2.5 bg-red-600/10 hover:bg-red-650/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Mass Delete</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={() => setActiveModal('import_ecomm_csv')}
            className="px-4 py-2.5 bg-white shadow-lg hover:bg-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer text-slate-800"
          >
            <Upload size={14} />
            <span>CSV Import</span>
          </button>

          <button
            onClick={() => setActiveModal('export_catalog_ecomm')}
            className="px-4 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-green-600/20 text-green-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          {/* Manage Brands */}
          <button
            onClick={() => setActiveModal('manage_brands_ecomm')}
            className="px-4 py-2.5 bg-[#0F4C81]/10 hover:bg-[#0F4C81]/20 text-[#0F4C81] border border-[#0F4C81]/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <SlidersHorizontal size={14} />
            <span>Manage Brands</span>
          </button>

          {/* Storefront Settings */}
          <button
            onClick={() => setActiveTab('ecommCustomize')}
            className="px-4 py-2.5 bg-[#0F4C81]/10 hover:bg-[#0F4C81]/20 text-[#0F4C81] border border-[#0F4C81]/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Cog size={14} />
            <span>Storefront Settings</span>
          </button>

          {/* Add Product */}
          <button
            onClick={handleAddClick}
            className="px-4 py-2.5 bg-[#0F4C81] hover:bg-[#0B1F3A] hover:brightness-110 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer text-white"
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white shadow-md border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4">Image</th>
                <th className="p-4">Product ID / SKU</th>
                <th className="p-4">Name / Model</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(prod => (
                <tr key={prod._id || prod.product_id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="w-12 h-12 rounded-lg border border-slate-200 overflow-hidden bg-[#F5F7FA] flex items-center justify-center p-1">
                      <img 
                        src={optimizeCloudinaryUrl(prod.images?.[0]) || 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png'} 
                        alt={prod.product_name} 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => { e.target.src = 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png'; }}
                      />
                    </div>
                  </td>
                  <td className="p-4 text-xs font-sans font-medium">
                    <div className="text-slate-800 font-semibold">{prod.product_id}</div>
                    <div className="text-slate-500 mt-0.5">{prod.sku}</div>
                  </td>
                  <td className="p-4 max-w-[240px]">
                    <div className="font-bold text-slate-800 truncate">{prod.product_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">{prod.model || 'No model'}</div>
                  </td>
                  <td className="p-4 text-xs font-semibold text-slate-700">{prod.brand}</td>
                  <td className="p-4 text-xs text-slate-600">
                    <div>{prod.category}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{prod.type || '-'}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEditClick(prod)}
                        className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-600 text-sm">
                    No products found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 bg-white shadow-sm border-t border-slate-200 text-xs text-slate-500">
            <span>Showing {Math.min(filteredProducts.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredProducts.length, currentPage * itemsPerPage)} of {filteredProducts.length} entries</span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:hover:bg-slate-50 cursor-pointer transition-all"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:hover:bg-slate-50 cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// EcommProductFormModal Component
function EcommProductFormModal({
  activeModal,
  selectedItem,
  ecommProductForm,
  setEcommProductForm,
  setProducts,
  setActiveModal,
  API_BASE_URL,
  fetchStatsOnly,
  handleCloudinaryUpload,
  uploadingField,
  setUploadingField,
  customizeForm,
  brands
}) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const approvedBrands = brands && brands.length > 0
    ? brands.map(b => b.name)
    : [
        'Atlas Protective Products',
        'Bosch Power Tools',
        'Cromwell Tools Industries',
        'Eibenstock',
        'Ingersoll Rand',
        'Stanley Black & Decker'
      ];

  const categories = [
    'Power Tools',
    'Safety Equipment',
    'Industrial Cleaning',
    'Accessories'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validations
    if (!ecommProductForm.product_id.trim() || !ecommProductForm.sku.trim() || !ecommProductForm.product_name.trim()) {
      setError('Product ID, SKU, and Product Name are required.');
      return;
    }

    if (!approvedBrands.includes(ecommProductForm.brand)) {
      setError('Please select a valid approved brand.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('cts_token');

    // Assemble payload
    const payload = {
      product_id: ecommProductForm.product_id.trim(),
      sku: ecommProductForm.sku.trim(),
      brand: ecommProductForm.brand,
      category: ecommProductForm.category,
      type: ecommProductForm.type.trim(),
      sub_type: ecommProductForm.sub_type.trim(),
      model: ecommProductForm.model.trim(),
      product_name: ecommProductForm.product_name.trim(),
      description: ecommProductForm.description.trim(),
      specifications: ecommProductForm.specifications.trim(),
      images: [ecommProductForm.image.trim()]
    };

    try {
      const isEdit = activeModal === 'edit_ecomm_product';
      const url = isEdit 
        ? `${API_BASE_URL}/api/ecomm/products/${selectedItem._id}` 
        : `${API_BASE_URL}/api/ecomm/products`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        if (isEdit) {
          setProducts(prev => prev.map(p => p._id === selectedItem._id ? data.data : p));
        } else {
          setProducts(prev => [data.data, ...prev]);
        }
        fetchStatsOnly();
        setActiveModal(null);
      } else {
        setError(data.error || 'Failed to save product details.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure. Could not reach server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Grid: ID and SKU */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Product ID</label>
          <input
            type="text"
            value={ecommProductForm.product_id}
            onChange={e => setEcommProductForm(prev => ({ ...prev, product_id: e.target.value }))}
            disabled={activeModal === 'edit_ecomm_product'}
            placeholder="FI-POW-005"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none transition-all disabled:opacity-50 text-slate-800"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">SKU</label>
          <input
            type="text"
            value={ecommProductForm.sku}
            onChange={e => setEcommProductForm(prev => ({ ...prev, sku: e.target.value }))}
            placeholder="GSB-18V-50"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none transition-all text-slate-800"
            required
          />
        </div>
      </div>

      {/* Grid: Brand and Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Brand Name</label>
          <select
            value={ecommProductForm.brand}
            onChange={e => setEcommProductForm(prev => ({ ...prev, brand: e.target.value }))}
            className="w-full bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none transition-all text-slate-800 cursor-pointer"
          >
            {approvedBrands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Category</label>
          <select
            value={ecommProductForm.category}
            onChange={e => setEcommProductForm(prev => ({ ...prev, category: e.target.value }))}
            className="w-full bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none transition-all text-slate-800 cursor-pointer"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Type and Sub-type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Product Type</label>
          <input
            type="text"
            value={ecommProductForm.type}
            onChange={e => setEcommProductForm(prev => ({ ...prev, type: e.target.value }))}
            placeholder="e.g. Drilling Machine"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none transition-all text-slate-800"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Sub-Type</label>
          <input
            type="text"
            value={ecommProductForm.sub_type}
            onChange={e => setEcommProductForm(prev => ({ ...prev, sub_type: e.target.value }))}
            placeholder="e.g. Cordless Drills"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none transition-all text-slate-800"
          />
        </div>
      </div>

      {/* Grid: Model and Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Model</label>
          <input
            type="text"
            value={ecommProductForm.model}
            onChange={e => setEcommProductForm(prev => ({ ...prev, model: e.target.value }))}
            placeholder="e.g. GSB 18V-50"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none transition-all text-slate-800"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Product Name</label>
          <input
            type="text"
            value={ecommProductForm.product_name}
            onChange={e => setEcommProductForm(prev => ({ ...prev, product_name: e.target.value }))}
            placeholder="e.g. Bosch GSB 18V-50 Cordless Drill"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none transition-all text-slate-800"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Description</label>
        <textarea
          value={ecommProductForm.description}
          onChange={e => setEcommProductForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief summary detailing specifications and applications..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none min-h-[80px] transition-all resize-none text-slate-800 font-light"
        />
      </div>

      {/* Specifications */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Technical Specifications</label>
        <textarea
          value={ecommProductForm.specifications}
          onChange={e => setEcommProductForm(prev => ({ ...prev, specifications: e.target.value }))}
          placeholder="e.g. Voltage: 18 V | Weight: 1.10 kg | Chuck Capacity: 13 mm"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none min-h-[60px] transition-all resize-none text-slate-800 font-mono text-xs"
        />
      </div>

      {/* Product Image URL and upload */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Product Image URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={ecommProductForm.image}
            onChange={e => setEcommProductForm(prev => ({ ...prev, image: e.target.value }))}
            placeholder="Cloudinary resource link..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#0F4C81] outline-none transition-all text-slate-800"
            required
          />
          <label className="shrink-0 px-4 py-2.5 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center border border-[#0F4C81]/20">
            {uploadingField === 'ecomm_prod' ? 'Uploading...' : 'Upload'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingField !== null}
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleCloudinaryUpload(
                    e.target.files[0],
                    'ecomm',
                    (url) => setEcommProductForm(prev => ({ ...prev, image: url })),
                    'ecomm_prod'
                  );
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setActiveModal(null)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-[#0F4C81] hover:bg-[#0B1F3A] hover:brightness-110 rounded-xl text-xs font-semibold cursor-pointer text-white disabled:opacity-50"
        >
          {submitting ? 'Saving...' : activeModal === 'create_ecomm_product' ? 'Save Product' : 'Update Product'}
        </button>
      </div>
    </form>
  );
}

// EcommCsvImportModal Component
function EcommCsvImportModal({ setProducts, setActiveModal, API_BASE_URL, fetchStatsOnly, brands }) {
  const [csvText, setCsvText] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [validationErrors, setValidationErrors] = useState([]);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [hasDuplicates, setHasDuplicates] = useState(false);
  const [duplicateList, setDuplicateList] = useState([]);

  const handleRearrangeSKUs = () => {
    const skuTrackers = {};
    const skuCounts = {};
    
    parsedData.forEach(p => {
      if (p.sku) {
        skuCounts[p.sku] = (skuCounts[p.sku] || 0) + 1;
      }
    });

    const rearranged = parsedData.map(p => {
      if (p.sku && skuCounts[p.sku] > 1) {
        skuTrackers[p.sku] = (skuTrackers[p.sku] || 0) + 1;
        return {
          ...p,
          sku: `${p.sku}${skuTrackers[p.sku]}`
        };
      }
      return p;
    });

    setParsedData(rearranged);
    setHasDuplicates(false);
    setDuplicateList([]);
  };

  const approvedBrands = brands && brands.length > 0
    ? brands.map(b => b.name)
    : [
        'Atlas Protective Products',
        'Bosch Power Tools',
        'Cromwell Tools Industries',
        'Eibenstock',
        'Ingersoll Rand',
        'Stanley Black & Decker'
      ];

  const parseCSV = (text) => {
    setError('');
    setValidationErrors([]);
    setParsedData([]);
    
    if (!text.trim()) {
      setError('Please paste or upload some CSV data first.');
      return;
    }

    const lines = text.split(/\r?\n/);
    if (lines.length < 2) {
      setError('CSV requires at least a header row and one data row.');
      return;
    }

    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]);
    
    // Normalize header mapping
    const headerMap = {};
    headers.forEach((h, index) => {
      const lower = h.toLowerCase().replace(/[\s_-]+/g, '');
      if (lower === 'productid' || lower === 'id') headerMap.product_id = index;
      else if (lower === 'sku') headerMap.sku = index;
      else if (lower === 'brand') headerMap.brand = index;
      else if (lower === 'category') headerMap.category = index;
      else if (lower === 'type') headerMap.type = index;
      else if (lower === 'subtype') headerMap.sub_type = index;
      else if (lower === 'model') headerMap.model = index;
      else if (lower === 'productname' || lower === 'name') headerMap.product_name = index;
      else if (lower === 'description' || lower === 'desc') headerMap.description = index;
      else if (lower === 'specifications' || lower === 'specs') headerMap.specifications = index;
      else if (lower === 'images' || lower === 'image' || lower === 'img') headerMap.image = index;
    });

    // Check basic headers exist
    if (headerMap.product_id === undefined || headerMap.sku === undefined || headerMap.brand === undefined || headerMap.product_name === undefined) {
      setError('CSV must contain Product ID, SKU, Brand, and Product Name headers.');
      return;
    }

    const rows = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = parseLine(line);
      if (cols.length < 4) continue;

      const rowProduct = {
        product_id: cols[headerMap.product_id] || '',
        sku: cols[headerMap.sku] || '',
        brand: cols[headerMap.brand] || '',
        category: headerMap.category !== undefined ? cols[headerMap.category] || 'Power Tools' : 'Power Tools',
        type: headerMap.type !== undefined ? cols[headerMap.type] || '' : '',
        sub_type: headerMap.sub_type !== undefined ? cols[headerMap.sub_type] || '' : '',
        model: headerMap.model !== undefined ? cols[headerMap.model] || '' : '',
        product_name: cols[headerMap.product_name] || '',
        description: headerMap.description !== undefined ? cols[headerMap.description] || '' : '',
        specifications: headerMap.specifications !== undefined ? cols[headerMap.specifications] || '' : '',
        images: headerMap.image !== undefined && cols[headerMap.image] && cols[headerMap.image].trim() ? [cols[headerMap.image].trim()] : ['https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png']
      };

      // Validation check
      const rowErrors = [];
      if (!rowProduct.product_id) rowErrors.push('Missing Product ID');
      if (!rowProduct.sku) rowErrors.push('Missing SKU');
      if (!rowProduct.product_name) rowErrors.push('Missing Product Name');
      
      // Strict Brand validation
      if (rowProduct.brand) {
        const matchingBrand = approvedBrands.find(b => b.toLowerCase().replace(/[\s_-]+/g, '') === rowProduct.brand.toLowerCase().replace(/[\s_-]+/g, ''));
        if (matchingBrand) {
          rowProduct.brand = matchingBrand;
        } else {
          rowErrors.push(`Disallowed Brand: "${rowProduct.brand}" (Must be one of the 6 MRO partners)`);
        }
      } else {
        rowErrors.push('Missing Brand');
      }

      if (rowErrors.length > 0) {
        errors.push({ rowIndex: i, errors: rowErrors, data: rowProduct });
      } else {
        rows.push(rowProduct);
      }
    }

    const skuCounts = {};
    rows.forEach(r => {
      if (r.sku) {
        skuCounts[r.sku] = (skuCounts[r.sku] || 0) + 1;
      }
    });
    const duplicates = Object.keys(skuCounts).filter(sku => skuCounts[sku] > 1);

    setParsedData(rows);
    setValidationErrors(errors);
    if (duplicates.length > 0) {
      setHasDuplicates(true);
      setDuplicateList(duplicates);
    } else {
      setHasDuplicates(false);
      setDuplicateList([]);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      setCsvText(evt.target.result);
      parseCSV(evt.target.result);
    };
    reader.readAsText(file);
  };

  const handleSync = async () => {
    if (parsedData.length === 0) {
      setError('No valid rows to synchronize.');
      return;
    }

    setSyncing(true);
    const token = localStorage.getItem('cts_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecomm/products/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ products: parsedData })
      });
      const data = await res.json();
      if (data.success) {
        const refreshRes = await fetch(`${API_BASE_URL}/api/ecomm/products`);
        const refreshData = await refreshRes.json();
        if (refreshData.success) {
          setProducts(refreshData.data);
          localStorage.setItem('cts_products', JSON.stringify(refreshData.data));
        }
        fetchStatsOnly();
        setActiveModal(null);
      } else {
        setError(data.error || 'Bulk upload sync failed.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      {parsedData.length === 0 && validationErrors.length === 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Paste CSV Spreadsheet Data</span>
            <label className="px-3 py-1.5 bg-white shadow-lg hover:bg-slate-700 text-slate-800 rounded-lg text-xs font-bold border border-slate-200 cursor-pointer transition-all flex items-center gap-1.5">
              <Upload size={12} />
              <span>Choose CSV File</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <textarea
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            placeholder={`Product ID, SKU, Brand, Category, Type, Sub-Type, Model, Product Name, Description, Specifications, Images
FI-POW-005, GSB-18V-50, Bosch Power Tools, Power Tools, Drilling Machine, Cordless Drills, GSB 18V-50, Bosch Cordless Drill, Heavy-duty drill, Chuck capacity: 13mm, https://image-url.jpg`}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-[#0F4C81] outline-none min-h-[160px] font-mono text-slate-800 resize-y placeholder:text-slate-700"
          />

          <button
            type="button"
            onClick={() => parseCSV(csvText)}
            className="w-full py-2.5 bg-white shadow-lg hover:bg-slate-700 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            Parse Catalog CSV Data
          </button>
        </div>
      )}

      {(parsedData.length > 0 || validationErrors.length > 0) && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-green-600/10 border border-green-600/20 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-green-600 font-semibold uppercase tracking-wider">Valid Entries</span>
              <span className="text-3xl font-extrabold text-slate-800 mt-2">{parsedData.length}</span>
              <span className="text-[10px] text-slate-500 mt-1">Ready for database synchronization</span>
            </div>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col justify-between">
              <span className="text-xs text-red-400 font-semibold uppercase tracking-wider">Failed Validation</span>
              <span className="text-3xl font-extrabold text-slate-800 mt-2">{validationErrors.length}</span>
              <span className="text-[10px] text-slate-500 mt-1">Contains invalid brands or empty keys</span>
            </div>
          </div>

          {hasDuplicates && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">⚠️ Repeated SKUs Detected</span>
                <span className="text-xs text-slate-600 mt-1">
                  The following SKUs are repeated in the CSV: <span className="font-mono text-amber-300 font-bold">{duplicateList.join(', ')}</span>. Click Rearrange to auto-format them.
                </span>
              </div>
              <button
                type="button"
                onClick={handleRearrangeSKUs}
                className="px-4 py-2 bg-amber-500 text-slate-950 hover:brightness-110 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-amber-500/10 shrink-0"
              >
                Rearrange SKUs
              </button>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-3 max-h-[120px] overflow-y-auto">
              <div className="text-xs font-bold text-red-400 mb-1">Rejected Rows Summary:</div>
              <ul className="text-[10px] text-slate-600 list-disc pl-4 space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>
                    Row {err.rowIndex}: {err.errors.join(' | ')} (SKU: {err.data.sku || 'N/A'})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {parsedData.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Valid Parsed Catalog Preview</span>
              <div className="border border-slate-200 rounded-xl max-h-[180px] overflow-auto bg-white shadow-sm">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                      <th className="p-2">Product ID</th>
                      <th className="p-2">SKU</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">Brand</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-2 font-mono text-slate-700">{row.product_id}</td>
                        <td className="p-2 font-mono text-slate-500">{row.sku}</td>
                        <td className="p-2 truncate max-w-[120px] text-slate-800/90">{row.product_name}</td>
                        <td className="p-2 text-slate-600">{row.brand}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <div className="text-center py-1.5 bg-slate-50 text-[10px] text-slate-500">
                    ...and {parsedData.length - 10} more rows
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end mt-2">
            <button
              type="button"
              onClick={() => { setParsedData([]); setValidationErrors([]); setHasDuplicates(false); setDuplicateList([]); }}
              className="px-4 py-2 bg-white shadow-lg hover:bg-slate-700 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Reset / Edit Text
            </button>
            <button
              type="button"
              disabled={parsedData.length === 0 || syncing}
              onClick={handleSync}
              className="px-5 py-2 bg-[#0F4C81] hover:bg-[#0B1F3A] hover:brightness-110 text-white text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-30 transition-all flex items-center gap-1.5"
            >
              {syncing ? 'Syncing...' : 'Sync Valid Rows to DB'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// EcommMassDeleteModal Component
function EcommMassDeleteModal({ products, setProducts, setActiveModal, API_BASE_URL, fetchStatsOnly, brands }) {
  const [deleteType, setDeleteType] = useState('brand'); // 'brand', 'category', 'type', 'sub_type', 'all'
  const [selectedValue, setSelectedValue] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const approvedBrands = brands && brands.length > 0
    ? brands.map(b => b.name)
    : [
        'Atlas Protective Products',
        'Bosch Power Tools',
        'Cromwell Tools Industries',
        'Eibenstock',
        'Ingersoll Rand',
        'Stanley Black & Decker'
      ];

  const categories = [
    'Power Tools',
    'Safety Equipment',
    'Industrial Cleaning',
    'Accessories'
  ];

  // Dynamically extract unique product types and sub-types from products array
  const uniqueTypes = React.useMemo(() => {
    const types = new Set();
    products.forEach(p => {
      if (p.type && p.type.trim()) types.add(p.type.trim());
    });
    return Array.from(types).sort();
  }, [products]);

  const uniqueSubTypes = React.useMemo(() => {
    const subTypes = new Set();
    products.forEach(p => {
      if (p.sub_type && p.sub_type.trim()) subTypes.add(p.sub_type.trim());
    });
    return Array.from(subTypes).sort();
  }, [products]);

  // Determine selectable values based on selection type
  useEffect(() => {
    if (deleteType === 'brand') {
      setSelectedValue(approvedBrands[0] || '');
    } else if (deleteType === 'category') {
      setSelectedValue(categories[0] || '');
    } else if (deleteType === 'type') {
      setSelectedValue(uniqueTypes[0] || '');
    } else if (deleteType === 'sub_type') {
      setSelectedValue(uniqueSubTypes[0] || '');
    } else {
      setSelectedValue('');
    }
  }, [deleteType, uniqueTypes, uniqueSubTypes]);

  // Calculate matching products that will be deleted
  const matchingCount = React.useMemo(() => {
    if (deleteType === 'all') {
      return products.length;
    }
    if (!selectedValue) return 0;
    
    return products.filter(p => {
      if (deleteType === 'brand') {
        return p.brand?.toLowerCase() === selectedValue.toLowerCase();
      }
      if (deleteType === 'category') {
        return p.category?.toLowerCase() === selectedValue.toLowerCase();
      }
      if (deleteType === 'type') {
        return p.type?.toLowerCase() === selectedValue.toLowerCase();
      }
      if (deleteType === 'sub_type') {
        return p.sub_type?.toLowerCase() === selectedValue.toLowerCase();
      }
      return false;
    }).length;
  }, [deleteType, selectedValue, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm.');
      return;
    }

    if (deleteType !== 'all' && !selectedValue) {
      setError('Please select a valid filter value.');
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('cts_token');

    // Build filter payload matching database fields exactly
    const filter = {};
    if (deleteType === 'brand') filter.brand = selectedValue;
    if (deleteType === 'category') filter.category = selectedValue;
    if (deleteType === 'type') filter.type = selectedValue;
    if (deleteType === 'sub_type') filter.sub_type = selectedValue;

    try {
      const res = await fetch(`${API_BASE_URL}/api/ecomm/products/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          filter,
          deleteAll: deleteType === 'all'
        })
      });
      const data = await res.json();
      if (data.success) {
        // Update client products list
        if (deleteType === 'all') {
          setProducts([]);
        } else {
          setProducts(prev => prev.filter(p => {
            if (deleteType === 'brand') return p.brand?.toLowerCase() !== selectedValue.toLowerCase();
            if (deleteType === 'category') return p.category?.toLowerCase() !== selectedValue.toLowerCase();
            if (deleteType === 'type') return p.type?.toLowerCase() !== selectedValue.toLowerCase();
            if (deleteType === 'sub_type') return p.sub_type?.toLowerCase() !== selectedValue.toLowerCase();
            return true;
          }));
        }
        fetchStatsOnly();
        setActiveModal(null);
      } else {
        setError(data.error || 'Failed to complete mass deletion.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure. Could not contact the server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 text-slate-800">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="bg-amber-500/10 border border-amber-500/25 text-amber-400 p-4 rounded-xl text-xs leading-relaxed flex flex-col gap-1.5">
        <span className="font-bold">⚠️ Warning: Bulk Deletion is Permanent!</span>
        <span>
          Products deleted cannot be recovered. Ensure you select the correct filter criteria before proceeding.
        </span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">Deletion Method</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { value: 'brand', label: 'By Brand' },
            { value: 'category', label: 'By Category' },
            { value: 'type', label: 'By Type' },
            { value: 'sub_type', label: 'By Sub-Type' },
            { value: 'all', label: 'All Products' }
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDeleteType(opt.value)}
              className={`py-2 px-1 text-center rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                deleteType === opt.value
                  ? 'bg-red-600 border-red-500 text-slate-800 shadow-lg shadow-red-600/15'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {deleteType !== 'all' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-slate-600 font-semibold uppercase tracking-wider">
            Select {deleteType === 'brand' ? 'Brand' : deleteType === 'category' ? 'Category' : deleteType === 'type' ? 'Product Type' : 'Sub-Type'}
          </label>
          
          {deleteType === 'brand' && (
            <select
              value={selectedValue}
              onChange={e => setSelectedValue(e.target.value)}
              className="w-full bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none text-slate-800 cursor-pointer"
            >
              {approvedBrands.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}

          {deleteType === 'category' && (
            <select
              value={selectedValue}
              onChange={e => setSelectedValue(e.target.value)}
              className="w-full bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none text-slate-800 cursor-pointer"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          {deleteType === 'type' && (
            uniqueTypes.length > 0 ? (
              <select
                value={selectedValue}
                onChange={e => setSelectedValue(e.target.value)}
                className="w-full bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none text-slate-800 cursor-pointer"
              >
                {uniqueTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            ) : (
              <div className="text-slate-500 text-xs py-2">No product types found in local catalog list.</div>
            )
          )}

          {deleteType === 'sub_type' && (
            uniqueSubTypes.length > 0 ? (
              <select
                value={selectedValue}
                onChange={e => setSelectedValue(e.target.value)}
                className="w-full bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 outline-none text-slate-800 cursor-pointer"
              >
                {uniqueSubTypes.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <div className="text-slate-500 text-xs py-2">No product sub-types found in local catalog list.</div>
            )
          )}
        </div>
      )}

      {/* Stats preview */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-sm">
        <span className="text-slate-600">Products to be deleted:</span>
        <span className="font-bold text-red-400 font-mono text-base">{matchingCount}</span>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-red-400 font-bold uppercase tracking-wider">
          Verification Required
        </label>
        <p className="text-xs text-slate-500 mb-1">
          Type <span className="text-slate-800 font-mono bg-slate-100 px-1 py-0.5 rounded">DELETE</span> below to confirm bulk deletion:
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="Type DELETE"
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-red-500 focus:bg-slate-100 outline-none transition-all text-slate-800 font-mono"
          required
        />
      </div>

      <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={() => setActiveModal(null)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || confirmText !== 'DELETE' || (deleteType !== 'all' && !selectedValue) || matchingCount === 0}
          className="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 rounded-xl text-xs font-semibold cursor-pointer text-slate-800 shadow-lg shadow-red-600/20 transition-all"
        >
          {submitting ? 'Deleting...' : `Confirm Bulk Delete (${matchingCount})`}
        </button>
      </div>
    </form>
  );
}


// EcommOrdersManager Component
function EcommOrdersManager({ orders, setOrders, setActiveModal, setSelectedItem, API_BASE_URL, setDeleteConfirmData }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredOrders = orders.filter(o => {
    const matchesSearch = !searchQuery.trim() ||
      o.referenceId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerDetails?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerDetails?.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerDetails?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditClick = (order) => {
    setSelectedItem(order);
    setActiveModal('edit_order_ecomm');
  };

  const handleDeleteOrder = (id, refId) => {
    setDeleteConfirmData({
      title: 'Delete Quotation Request',
      message: `Are you sure you want to delete quote request "${refId}"? This action is permanent and cannot be undone.`,
      onConfirm: async () => {
        const token = localStorage.getItem('cts_token');
        try {
          const res = await fetch(`${API_BASE_URL}/api/ecomm/orders/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            setOrders(prev => prev.filter(o => o._id !== id));
            if (paginatedOrders.length === 1 && currentPage > 1) {
              setCurrentPage(currentPage - 1);
            }
          } else {
            alert(data.error || 'Failed to delete quote request.');
          }
        } catch (err) {
          console.error(err);
          alert('Connection error.');
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header controls bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-200 p-5 rounded-2xl border border-slate-200 backdrop-blur-sm">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search by Ref ID, customer name, company..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#0F4C81] outline-none text-slate-800 transition-all font-light"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status select filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-white shadow-lg border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0F4C81] outline-none transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved / Priced</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-md border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-800/55 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4">Reference ID</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Requested Items</th>
                <th className="p-4">Quote Value</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedOrders.map(order => {
                const subtotal = (order.items || []).reduce((acc, item) => acc + (item.quantity * (item.unitPrice || 0)), 0);
                const taxAmount = (subtotal * (order.taxRate || 0)) / 100;
                const grandTotal = subtotal + taxAmount + (order.shippingCost || 0);
                const hasPricedItems = (order.items || []).some(item => item.unitPrice > 0);

                return (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-bold text-slate-800 font-sans text-sm">
                      {order.referenceId}
                      <span className="text-[10px] text-slate-600 block font-normal font-sans mt-0.5">
                        {new Date(order.date || order.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block text-sm">{order.customerDetails?.name}</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5 truncate max-w-[200px]" title={`${order.customerDetails?.email} | ${order.customerDetails?.company}`}>
                        {order.customerDetails?.company ? `${order.customerDetails.company} • ` : ''}{order.customerDetails?.email}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {order.items?.length || 0} items
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Qty total: {order.items?.reduce((acc, it) => acc + it.quantity, 0) || 0}
                      </span>
                    </td>
                    <td className="p-4 font-bold font-sans text-slate-800 text-sm">
                      {hasPricedItems ? `₹${grandTotal.toFixed(2)}` : <span className="text-yellow-700 font-sans font-normal text-xs">Unpriced RFQ</span>}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        order.status === 'Pending' ? 'bg-yellow-100 border-yellow-200 text-yellow-700' :
                        order.status === 'Approved' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                        order.status === 'Processing' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                        order.status === 'Completed' ? 'bg-[#0F4C81]/10 border-[#0F4C81]/20 text-[#0F4C81]' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {order.status || 'Pending'}
                      </span>
                      {order.adminComments && (
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-600/10 px-1.5 py-0.5 rounded border border-green-600/20" title="You have already replied to this request">
                          <CheckCircle size={10} /> REPLIED
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEditClick(order)}
                          className="px-3 py-1.5 bg-[#0F4C81]/10 hover:bg-[#0F4C81] text-[#0F4C81] hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer border border-[#0F4C81]/20"
                        >
                          {order.adminComments ? 'View / Reply Again' : 'Process RFQ'}
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id, order.referenceId)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete request"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-600 text-xs">
                    No quotation requests or orders found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-white shadow-sm flex justify-between items-center text-xs">
            <span className="text-slate-500 font-light">
              Showing page {currentPage} of {totalPages} ({filteredOrders.length} total orders)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 disabled:opacity-30 disabled:hover:bg-slate-50 transition-all cursor-pointer font-semibold"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-800 disabled:opacity-30 disabled:hover:bg-slate-50 transition-all cursor-pointer font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// EcommOrderEditModal Component
function EcommOrderEditModal({ order, setOrders, setActiveModal, API_BASE_URL }) {
  const [status, setStatus] = useState(order.status || 'Pending');
  const [shippingCost, setShippingCost] = useState(order.shippingCost || 0);
  const [taxRate, setTaxRate] = useState(order.taxRate || 0);
  const [paymentTerms, setPaymentTerms] = useState(order.paymentTerms || 'Net 30');
  const [validUntil, setValidUntil] = useState(order.validUntil ? order.validUntil.split('T')[0] : '');
  const [adminComments, setAdminComments] = useState(order.adminComments || '');
  const [items, setItems] = useState(order.items || []);
  const [includePricing, setIncludePricing] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleItemPriceChange = (idx, value) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], unitPrice: parseFloat(value) || 0 };
    setItems(updated);
  };

  const handleReplyWithQuote = async () => {
    setError('');
    setSubmitting(true);
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders/${order._id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items,
          message: adminComments,
          includePricing
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === order._id ? data.data : o));
        setActiveModal(null);
        alert('Quote replied successfully!');
      } else {
        setError(data.error || 'Failed to send reply.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/ecomm/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status,
          items,
          shippingCost: Number(shippingCost) || 0,
          taxRate: Number(taxRate) || 0,
          paymentTerms,
          validUntil: validUntil ? new Date(validUntil).toISOString() : null,
          adminComments
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === order._id ? data.data : o));
        setActiveModal(null);
      } else {
        setError(data.error || 'Failed to update order.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection failure.');
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (item.quantity * (item.unitPrice || 0)), 0);
  const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
  const total = subtotal + taxAmount + (Number(shippingCost) || 0);

  return (
    <div className="p-6 flex flex-col gap-6 text-slate-800 max-h-[85vh] overflow-y-auto">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Customer Info Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Customer Name</span>
            <span className="font-semibold text-slate-800">{order.customerDetails?.name}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Company / Enterprise</span>
            <span className="font-semibold text-slate-800">{order.customerDetails?.company || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Email Address</span>
            <span className="font-semibold text-slate-800">{order.customerDetails?.email}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Phone Contact</span>
            <span className="font-semibold text-slate-800">{order.customerDetails?.phone || 'N/A'}</span>
          </div>
          {order.customerDetails?.message && (
            <div className="col-span-2 border-t border-slate-200 pt-2 mt-1">
              <span className="text-slate-500 block">Customer Notes/Instructions</span>
              <span className="italic text-slate-700">{order.customerDetails?.message}</span>
            </div>
          )}
        </div>

        {/* Status Dropdown */}
        <div className="flex flex-col gap-1.5 max-w-xs">
          <label className="text-[10px] text-slate-500 uppercase">Order / RFQ Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:border-[#0F4C81] outline-none"
          >
            <option value="Pending">Pending Review</option>
            <option value="Approved">Approved / Priced</option>
            <option value="Processing">Processing Quote</option>
            <option value="Completed">Completed / Dispatched</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Items Listing & Unit Price Setting */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Item Worksheet & Pricing</h4>
          <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-800/55 text-[10px] uppercase tracking-wider">
                  <th className="p-3">Product details</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3">Unit Price (₹)</th>
                  <th className="p-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <span className="font-semibold block text-slate-800">{item.product_name}</span>
                      <span className="text-[10px] text-slate-500">
                        Brand: {item.brand} | SKU: {item.sku} | Model: {item.model || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-600">{item.quantity}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unitPrice || ''}
                        onChange={e => handleItemPriceChange(idx, e.target.value)}
                        placeholder="0.00"
                        className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:border-[#0F4C81] outline-none text-right font-mono"
                        required
                      />
                    </td>
                    <td className="p-3 text-right font-mono text-slate-700 font-bold">
                      ₹{((item.quantity || 1) * (item.unitPrice || 0)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Costing Summary & Quote Terms Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 pt-6">
          {/* Quote Settings Form */}
          <div className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase">Shipping & Handling (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={shippingCost}
                  onChange={e => setShippingCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-[#0F4C81] outline-none font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={e => setTaxRate(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-[#0F4C81] outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase">Payment Terms</label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  placeholder="Net 30, COD, etc."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-[#0F4C81] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 uppercase">Quote Validity Date</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-[#0F4C81] outline-none font-mono text-slate-700"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-slate-500 uppercase">Procurement Officer Comments / Notes</label>
              <textarea
                value={adminComments}
                onChange={e => setAdminComments(e.target.value)}
                placeholder="Add special terms, lead time details, shipping estimates..."
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:border-[#0F4C81] outline-none resize-none"
              />
            </div>
          </div>

          {/* Pricing Worksheet Totals Panel */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3 text-xs justify-center">
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest border-b border-slate-200 pb-2">
              Worksheet Cost Summary
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-mono text-slate-800 font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Shipping cost:</span>
              <span className="font-mono text-slate-800 font-semibold">₹{Number(shippingCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tax / GST ({taxRate}%):</span>
              <span className="font-mono text-slate-800 font-semibold">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 font-bold text-sm text-[#0F4C81]">
              <span>RFQ Grand Total:</span>
              <span className="font-mono text-slate-800">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setActiveModal(null)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={includePricing}
                onChange={(e) => setIncludePricing(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 bg-white shadow-lg text-[#0F4C81] focus:ring-[#0F4C81]"
              />
              Include Item Pricing Breakdown in Email
            </label>
            <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-[#0F4C81] text-white text-xs font-bold rounded-xl hover:bg-[#0B1F3A] active:scale-[0.98] transition-all cursor-pointer"
            >
              {submitting ? 'Saving...' : 'Save & Approve Quote'}
            </button>
            <button
              type="button"
              onClick={handleReplyWithQuote}
              disabled={submitting}
              className="px-6 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-green-600 border border-green-600/30 text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer"
            >
              Reply with Quote
            </button>
          </div>
        </div>
        </div>
      </form>
    </div>
  );
}

function EcommBrandManagerModal({ brands, setBrands, setActiveModal, API_BASE_URL }) {
  const [localBrands, setLocalBrands] = useState([...brands]);
  const [uploadingField, setUploadingField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddBrand = () => {
    setLocalBrands([{ name: 'New Brand', src: '', scale: 1.0 }, ...localBrands]);
  };

  const handleUpdateBrand = (index, field, value) => {
    const updated = [...localBrands];
    updated[index] = { ...updated[index], [field]: value };
    setLocalBrands(updated);
  };

  const handleRemoveBrand = (index) => {
    setLocalBrands(localBrands.filter((_, i) => i !== index));
  };

  const handleSaveBrands = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('cts_token');
      const res = await fetch(`${API_BASE_URL}/api/ecomm/brands/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ brands: localBrands })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBrands(data.data);
        setActiveModal(null);
      } else {
        alert(data.error || 'Failed to save brands');
      }
    } catch (err) {
      console.error(err);
      alert('Connection error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloudinaryUpload = async (file, folder, onUploadSuccess, fieldId) => {
    setUploadingField(fieldId);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'cts_unsigned');
      formData.append('folder', folder);
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/dzfuhxr2z/image/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.secure_url) {
        onUploadSuccess(data.secure_url);
      } else {
        alert('Upload failed: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Upload failed: Connection error');
    } finally {
      setUploadingField(null);
    }
  };

  return (
    <div className="p-6 max-h-[80vh] overflow-y-auto flex flex-col gap-6 custom-scrollbar text-slate-800">
      <div className="flex justify-between items-center border-b border-slate-200 pb-3">
        <p className="text-xs text-slate-500">Add, edit, or remove partner brand logos.</p>
        <button
          onClick={handleAddBrand}
          className="px-4 py-2 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-xl text-xs font-bold transition-all border border-[#0F4C81]/20 flex items-center gap-2"
        >
          <span>Add Brand Logo</span>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {localBrands.map((brand, idx) => (
          <div key={idx} className="flex gap-4 p-4 bg-white shadow-sm rounded-xl border border-slate-200 relative items-center">
            <div 
              className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative group/logo cursor-pointer"
              onClick={() => handleRemoveBrand(idx)}
              title="Click to delete this brand"
            >
              <img
                src={brand.src || brand.logoUrl || 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png'}
                alt={brand.name}
                className="max-w-full max-h-full object-contain opacity-80"
                style={{ transform: `scale(${parseFloat(brand.scale) || 1})` }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity">
                <Trash2 size={20} className="text-slate-800" />
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2 pt-1 pr-6">
              <input
                type="text"
                value={brand.name}
                onChange={e => handleUpdateBrand(idx, 'name', e.target.value)}
                placeholder="Brand Name"
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:border-[#0F4C81] outline-none text-slate-800 font-semibold transition-all w-full"
              />
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={brand.src || brand.logoUrl || ''}
                  onChange={e => handleUpdateBrand(idx, 'src', e.target.value)}
                  placeholder="Image URL path"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] focus:border-[#0F4C81] outline-none text-slate-700 transition-all"
                />
                <label className="shrink-0 px-3 py-1.5 bg-[#0F4C81]/10 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-colors relative">
                  {uploadingField === `brand_${idx}` ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleCloudinaryUpload(e.target.files[0], 'ecomm', (url) => handleUpdateBrand(idx, 'src', url), `brand_${idx}`);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
        {localBrands.length === 0 && (
          <div className="text-center py-8 text-slate-600 text-xs border border-dashed border-slate-200 rounded-xl">
            No brands configured. Click Add Brand Logo to create one.
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200">
        <button
          onClick={() => setActiveModal(null)}
          className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-800 border border-transparent hover:bg-slate-50 transition-all text-xs font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveBrands}
          disabled={isSaving}
          className="px-6 py-2 bg-[#0F4C81] hover:bg-[#0B1F3A] text-white rounded-xl text-xs font-bold hover:brightness-110 shadow-lg disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? 'Saving...' : 'Save All Brands'}
        </button>
      </div>
    </div>
  );
}

