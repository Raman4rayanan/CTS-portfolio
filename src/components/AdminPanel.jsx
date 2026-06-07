import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ThumbsUp
} from 'lucide-react';

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

export default function AdminPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [activities, setActivities] = useState([]);
  const [services, setServices] = useState([]);
  const [config, setConfig] = useState(null);
  const [customizeForm, setCustomizeForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    aboutText: '',
    aboutHeaderLight: '',
    aboutHeaderBold: '',
    journey: [],
    reasons: [],
    partners: [],
    customers: []
  });
  const [saveSuccess, setSaveSuccess] = useState('');
  
  // UI Loading/Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // CRUD Modals state
  const [activeModal, setActiveModal] = useState(null); // 'create_activity', 'edit_activity', 'create_service', 'edit_service'
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewingInquiry, setViewingInquiry] = useState(null);

  // Form states
  const [activityForm, setActivityForm] = useState({ title: '', subtitle: '', image: '/image1.png', gradient: defaultGradients[0] });
  const [serviceForm, setServiceForm] = useState({ title: '', icon: 'Settings', image: '/pneumatic.png', desc: '' });

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
      if (field === 'scale') {
        const val = parseFloat(value);
        newPartners[index] = { ...newPartners[index], [field]: isNaN(val) ? 1.0 : val };
      } else {
        newPartners[index] = { ...newPartners[index], [field]: value };
      }
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
      if (field === 'scale') {
        const val = parseFloat(value);
        newCustomers[index] = { ...newCustomers[index], [field]: isNaN(val) ? 1.0 : val };
      } else {
        newCustomers[index] = { ...newCustomers[index], [field]: value };
      }
      return { ...prev, customers: newCustomers };
    });
  };

  const handleRemoveCustomer = (index) => {
    setCustomizeForm(prev => ({
      ...prev,
      customers: prev.customers.filter((_, i) => i !== index)
    }));
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
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers });
      const statsData = await statsRes.json();

      // Inquiries
      const inquiriesRes = await fetch('http://localhost:5000/api/admin/inquiries', { headers });
      const inquiriesData = await inquiriesRes.json();

      // Activities
      const activitiesRes = await fetch('http://localhost:5000/api/portfolio/activities');
      const activitiesData = await activitiesRes.json();

      // Services
      const servicesRes = await fetch('http://localhost:5000/api/portfolio/services');
      const servicesData = await servicesRes.json();

      // Portfolio Config
      const configRes = await fetch('http://localhost:5000/api/portfolio/config');
      const configData = await configRes.json();

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
          journey: configData.data.journey || [],
          reasons: configData.data.reasons || [],
          partners: configData.data.partners || [],
          customers: configData.data.customers || []
        });
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
    try {
      const res = await fetch('http://localhost:5000/api/portfolio/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(customizeForm)
      });
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setSaveSuccess('Configuration saved successfully! The changes are now live.');
        setTimeout(() => setSaveSuccess(''), 5000);
      } else {
        setError(data.error || 'Failed to update configuration.');
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
      const response = await fetch('http://localhost:5000/api/admin/login', {
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
        await fetch('http://localhost:5000/api/admin/logout', {
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
      const res = await fetch(`http://localhost:5000/api/admin/inquiries/${id}`, {
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

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`http://localhost:5000/api/admin/inquiries/${id}`, {
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
  };

  const fetchStatsOnly = async () => {
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
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
      const res = await fetch('http://localhost:5000/api/portfolio/activities', {
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
        setActivityForm({ title: '', subtitle: '', image: '/image1.png', gradient: defaultGradients[0] });
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
      const res = await fetch(`http://localhost:5000/api/portfolio/activities/${selectedItem._id}`, {
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
        setActivityForm({ title: '', subtitle: '', image: '/image1.png', gradient: defaultGradients[0] });
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`http://localhost:5000/api/portfolio/activities/${id}`, {
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
  };

  // Services CRUD
  const handleCreateServiceSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch('http://localhost:5000/api/portfolio/services', {
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
        setServiceForm({ title: '', icon: 'Settings', image: '/pneumatic.png', desc: '' });
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
      const res = await fetch(`http://localhost:5000/api/portfolio/services/${selectedItem._id}`, {
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
        setServiceForm({ title: '', icon: 'Settings', image: '/pneumatic.png', desc: '' });
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product/service?')) return;
    const token = localStorage.getItem('cts_token');
    try {
      const res = await fetch(`http://localhost:5000/api/portfolio/services/${id}`, {
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
  };

  // Login view if not logged in
  if (!user || user.role !== 'Admin') {
    return <AdminLogin onSubmit={handleInlineLogin} error={error} loading={loading} />;
  }

  return (
    <div className="flex min-h-screen bg-[#02050c] text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/60 backdrop-blur-md border-r border-white/5 flex flex-col shrink-0">
        <div className="h-24 px-6 flex items-center justify-between border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 text-[#2796a9] font-bold text-lg hover:brightness-110 transition-all">
            <ArrowLeft size={16} />
            <span>Go to Site</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          <div className="text-[10px] uppercase font-bold tracking-widest text-white/35 px-4 mb-2">
            Main
          </div>
          <SidebarLink 
            label="Dashboard" 
            icon={<LayoutDashboard size={18} />} 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarLink 
            label="Inquiries" 
            icon={<Inbox size={18} />} 
            badge={inquiries.filter(i => !i.read).length}
            active={activeTab === 'inquiries'} 
            onClick={() => setActiveTab('inquiries')} 
          />

          <div className="text-[10px] uppercase font-bold tracking-widest text-white/35 px-4 mt-6 mb-2">
            Portfolio
          </div>
          <SidebarLink 
            label="Activities" 
            icon={<Sparkles size={18} />} 
            active={activeTab === 'activities'} 
            onClick={() => setActiveTab('activities')} 
          />
          <SidebarLink 
            label="Product Services" 
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
        </nav>

        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-[#2796a9] flex items-center justify-center font-bold text-sm">
              {user.username ? user.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate">{user.username}</span>
              <span className="text-xs text-white/40 truncate">{user.email}</span>
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
        <header className="h-24 border-b border-white/5 px-8 flex items-center justify-between bg-slate-950/20 backdrop-blur-md">
          <h2 className="text-2xl font-bold tracking-wide capitalize">
            {activeTab === 'services' ? 'Products & Services Management' : activeTab === 'customize' ? 'Customization Management' : `${activeTab} Management`}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-cyan-500/10 text-[#2796a9] border border-cyan-500/20 uppercase">
              Phase 1 Admin Panel Active
            </span>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="h-64 w-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-[#2796a9] border-t-transparent rounded-full animate-spin" />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <DashboardCard 
                      title="Total Inquiries" 
                      value={stats.portfolio.inquiries} 
                      icon={<Inbox className="text-blue-400" />} 
                      color="from-blue-500/10 to-blue-500/5 border-blue-500/10"
                    />
                    <DashboardCard 
                      title="Unread Inquiries" 
                      value={stats.portfolio.unreadInquiries} 
                      icon={<Inbox className="text-orange-400" />} 
                      color="from-orange-500/10 to-orange-500/5 border-orange-500/10"
                    />
                    <DashboardCard 
                      title="Read Inquiries" 
                      value={stats.portfolio.readInquiries} 
                      icon={<CheckCircle className="text-emerald-400" />} 
                      color="from-emerald-500/10 to-emerald-500/5 border-emerald-500/10"
                    />
                    <DashboardCard 
                      title="Total Activities" 
                      value={stats.portfolio.activities} 
                      icon={<Sparkles className="text-indigo-400" />} 
                      color="from-indigo-500/10 to-indigo-500/5 border-indigo-500/10"
                    />
                    <DashboardCard 
                      title="Products & Services" 
                      value={stats.portfolio.services} 
                      icon={<Hammer className="text-teal-400" />} 
                      color="from-teal-500/10 to-teal-500/5 border-teal-500/10"
                    />
                  </div>

                  {/* Quick Activity Lists / Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Inquiries Panel */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Unread Inquiries Inbox</h3>
                        <button onClick={() => setActiveTab('inquiries')} className="text-xs text-[#2796a9] hover:underline">View All</button>
                      </div>
                      
                      <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                        {inquiries.filter(i => !i.read).slice(0, 5).map(inq => (
                          <div key={inq._id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center gap-4">
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-semibold text-sm truncate">{inq.name}</span>
                              <span className="text-xs text-white/50 truncate mb-1">{inq.email || inq.phone}</span>
                              <p className="text-xs text-white/70 truncate">{inq.message}</p>
                            </div>
                            <button 
                              onClick={() => {
                                setViewingInquiry(inq);
                                setActiveTab('inquiries');
                              }}
                              className="px-3 py-1.5 bg-[#2796a9]/10 text-[#2796a9] hover:bg-[#2796a9] hover:text-white rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                            >
                              Open
                            </button>
                          </div>
                        ))}
                        {inquiries.filter(i => !i.read).length === 0 && (
                          <div className="text-center py-8 text-white/40 text-sm">
                            No unread inquiries. All caught up!
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fast Stats verification */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                      <h3 className="font-bold text-lg">System & Database Status</h3>
                      <div className="flex flex-col gap-4 text-sm font-light text-white/70">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Segregated Databases Connectors</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Admin DB Connection (cts_admin)</span>
                          <span className="font-semibold text-white">Connected</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Portfolio DB Connection (cts_portfolio)</span>
                          <span className="font-semibold text-white">Connected</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span>Registered Admin Users</span>
                          <span className="font-semibold text-white">{stats.admin.users}</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span>Total DB Entities Managed</span>
                          <span className="font-semibold text-[#2796a9]">{stats.portfolio.inquiries + stats.portfolio.activities + stats.portfolio.services}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* INQUIRIES TAB */}
              {activeTab === 'inquiries' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Inquiry List */}
                  <div className="lg:col-span-2 bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
                    <h3 className="font-bold text-lg mb-2">Received Inquiries Inbox</h3>
                    
                    <div className="flex flex-col gap-3">
                      {inquiries.map(inq => (
                        <div 
                          key={inq._id} 
                          onClick={() => setViewingInquiry(inq)}
                          className={`p-4 rounded-xl border transition-all duration-300 flex justify-between items-center gap-4 cursor-pointer hover:border-[#2796a9]/30 ${
                            viewingInquiry?._id === inq._id 
                              ? 'bg-[#2796a9]/10 border-[#2796a9]/50' 
                              : inq.read 
                                ? 'bg-white/5 border-white/5 opacity-70' 
                                : 'bg-white/10 border-white/10 shadow-[0_0_10px_rgba(39,150,169,0.05)]'
                          }`}
                        >
                          <div className="flex flex-col overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate">{inq.name}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                inq.read ? 'bg-emerald-500/10 text-emerald-400' : 'bg-orange-500/10 text-orange-400'
                              }`}>
                                {inq.read ? 'Read' : 'Unread'}
                              </span>
                            </div>
                            <span className="text-xs text-white/40 truncate mt-0.5">{inq.email || inq.phone}</span>
                            <p className="text-xs text-white/70 truncate mt-2">{inq.message}</p>
                          </div>
                          <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleToggleInquiryRead(inq._id, inq.read)}
                              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                                inq.read 
                                  ? 'bg-orange-500/10 border-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-white' 
                                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                              }`}
                              title={inq.read ? 'Mark as Unread' : 'Mark as Read'}
                            >
                              {inq.read ? <XCircle size={16} /> : <CheckCircle size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteInquiry(inq._id)}
                              className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Delete Inquiry"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {inquiries.length === 0 && (
                        <div className="text-center py-12 text-white/30 text-sm">
                          No inquiries received yet.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inquiry Detail Panel */}
                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-6 sticky top-8">
                    <h3 className="font-bold text-lg border-b border-white/5 pb-4">Inquiry Details</h3>
                    {viewingInquiry ? (
                      <div className="flex flex-col gap-4 text-sm">
                        <div>
                          <span className="text-xs text-white/40 block mb-1">Name:</span>
                          <span className="font-semibold text-white text-base">{viewingInquiry.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-white/40 block mb-1">Email:</span>
                            <span className="font-medium text-white truncate block">{viewingInquiry.email || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-xs text-white/40 block mb-1">Phone:</span>
                            <span className="font-medium text-white block">{viewingInquiry.phone}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-white/40 block mb-1">Received Date:</span>
                          <span className="font-light text-white/80">{new Date(viewingInquiry.createdAt).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-xs text-white/40 block mb-1">Message:</span>
                          <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-white/80 leading-relaxed font-light min-h-[120px] whitespace-pre-line">
                            {viewingInquiry.message}
                          </div>
                        </div>
                        
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => handleToggleInquiryRead(viewingInquiry._id, viewingInquiry.read)}
                            className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {viewingInquiry.read ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            {viewingInquiry.read ? 'Mark Unread' : 'Mark Read'}
                          </button>
                          <button
                            onClick={() => handleDeleteInquiry(viewingInquiry._id)}
                            className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-white/30 text-sm flex flex-col items-center gap-2">
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
                        setActivityForm({ title: '', subtitle: '', image: '/image1.png', gradient: defaultGradients[0] });
                        setActiveModal('create_activity');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Add Activity</span>
                    </button>
                  </div>

                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-white/50 text-xs uppercase tracking-wider">
                          <th className="p-4">Image & Preview</th>
                          <th className="p-4">Title</th>
                          <th className="p-4">Subtitle</th>
                          <th className="p-4">Created At</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map(act => (
                          <tr key={act._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <div className="w-24 h-14 rounded-lg overflow-hidden relative border border-white/10 flex items-center justify-center" style={{ background: act.gradient }}>
                                <img src={act.image} alt={act.title} className="w-full h-full object-cover opacity-60" onError={(e) => {e.target.style.display='none';}} />
                              </div>
                            </td>
                            <td className="p-4 font-bold text-white max-w-[200px] truncate">{act.title}</td>
                            <td className="p-4 font-light text-white/70 max-w-[350px] truncate">{act.subtitle}</td>
                            <td className="p-4 text-xs font-light text-white/40">{new Date(act.createdAt).toLocaleDateString()}</td>
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
                                  className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteActivity(act._id)}
                                  className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
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
                            <td colSpan="5" className="text-center py-12 text-white/30 text-sm">
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
                    <h3 className="font-bold text-lg">Product Services Capability List</h3>
                    <button
                      onClick={() => {
                        setServiceForm({ title: '', icon: 'Settings', image: '/pneumatic.png', desc: '' });
                        setActiveModal('create_service');
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Plus size={16} />
                      <span>Add Capability</span>
                    </button>
                  </div>

                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-white/5 border-b border-white/5 text-white/50 text-xs uppercase tracking-wider">
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
                            <tr key={srv._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#2796a9]">
                                    <IconComponent size={20} />
                                  </div>
                                  <div className="w-14 h-10 rounded overflow-hidden border border-white/5 bg-slate-950">
                                    <img src={srv.image} alt={srv.title} className="w-full h-full object-cover" onError={(e) => {e.target.style.display='none';}} />
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-bold text-white max-w-[200px] truncate">{srv.title}</td>
                              <td className="p-4 font-light text-white/70 max-w-[400px] truncate">{srv.desc}</td>
                              <td className="p-4 text-xs font-light text-white/40">{new Date(srv.createdAt).toLocaleDateString()}</td>
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
                                    className="p-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title="Edit"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteService(srv._id)}
                                    className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
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
                            <td colSpan="5" className="text-center py-12 text-white/30 text-sm">
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
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-semibold animate-pulse">
                      {saveSuccess}
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold">
                      {error}
                    </div>
                  )}

                  {/* Actions Header Bar */}
                  <div className="flex justify-between items-center bg-slate-900/20 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                    <div className="flex flex-col">
                      <h3 className="font-bold text-lg">Site Settings & Landing Page Copy</h3>
                      <p className="text-xs text-white/50 font-light mt-0.5">Customize copy and branding assets in real-time. Make sure to click save to push updates live.</p>
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 active:scale-[0.98] rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#04667b]/20 transition-all cursor-pointer text-white"
                    >
                      <CheckCircle size={16} />
                      <span>Save All Changes</span>
                    </button>
                  </div>

                  {/* Grid 1: General Copy & Journey Milestones */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {/* General Copy Card */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="border-b border-white/5 pb-3">
                        <h4 className="font-bold text-base text-[#2796a9]">General Section Copy</h4>
                        <p className="text-xs text-white/40 font-light mt-0.5">Edit main titles and descriptions shown on landing page.</p>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Hero Headline Title</label>
                        <input
                          type="text"
                          value={customizeForm.heroTitle}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, heroTitle: e.target.value }))}
                          placeholder="Precision & Reliability"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] focus:bg-white/10 outline-none text-white transition-all font-medium"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Hero Subtitle</label>
                        <textarea
                          value={customizeForm.heroSubtitle}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                          placeholder="Hero section subtitle description copy..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] focus:bg-white/10 outline-none min-h-[100px] text-white transition-all font-light resize-none leading-relaxed"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">About Core Description</label>
                        <textarea
                          value={customizeForm.aboutText}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, aboutText: e.target.value }))}
                          placeholder="About section core summary/description copy..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] focus:bg-white/10 outline-none min-h-[110px] text-white transition-all font-light resize-none leading-relaxed"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">About Title Header (Light text)</label>
                        <input
                          type="text"
                          value={customizeForm.aboutHeaderLight}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, aboutHeaderLight: e.target.value }))}
                          placeholder="Powering Industries with"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] focus:bg-white/10 outline-none text-white transition-all font-medium"
                          required
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">About Title Header (Bold text)</label>
                        <input
                          type="text"
                          value={customizeForm.aboutHeaderBold}
                          onChange={e => setCustomizeForm(prev => ({ ...prev, aboutHeaderBold: e.target.value }))}
                          placeholder="Precision & Reliability"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] focus:bg-white/10 outline-none text-white transition-all font-medium"
                          required
                        />
                      </div>
                    </div>

                    {/* Timeline Journey Milestones Card */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-base text-[#2796a9]">Our Journey Milestones</h4>
                          <p className="text-xs text-white/40 font-light mt-0.5">Add, edit, or remove milestones in the company history timeline.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddJourney}
                          className="px-3 py-1.5 bg-[#2796a9]/10 text-[#2796a9] hover:bg-[#2796a9] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Add Row</span>
                        </button>
                      </div>

                      <div className="flex flex-col gap-3 max-h-[360px] overflow-y-auto pr-1">
                        {customizeForm.journey.map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                            <input
                              type="text"
                              value={item.year}
                              onChange={e => handleUpdateJourney(idx, 'year', e.target.value)}
                              placeholder="Year (e.g. 2021)"
                              className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs focus:border-[#2796a9] outline-none text-white transition-all font-bold text-center"
                              required
                            />
                            <input
                              type="text"
                              value={item.event}
                              onChange={e => handleUpdateJourney(idx, 'event', e.target.value)}
                              placeholder="Describe milestone event..."
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:border-[#2796a9] outline-none text-white transition-all"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveJourney(idx)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/10 hover:border-red-500 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Delete Row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                        {customizeForm.journey.length === 0 && (
                          <div className="text-center py-12 text-white/30 text-xs">
                            No journey milestones added yet. Click Add Row.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Why Choose Us Values Card */}
                  <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
                    <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-base text-[#2796a9]">Why Choose Us (Core Value Cards)</h4>
                        <p className="text-xs text-white/40 font-light mt-0.5">Customize the value proposition boxes displayed in the About section.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddReason}
                        className="px-3 py-1.5 bg-[#2796a9]/10 text-[#2796a9] hover:bg-[#2796a9] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Add Value Card</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customizeForm.reasons.map((reason, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 relative items-start group">
                          {/* Remove Card button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveReason(idx)}
                            className="absolute top-2 right-2 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/10 hover:border-red-500 rounded-lg transition-all opacity-40 group-hover:opacity-100 cursor-pointer"
                            title="Remove Reason Card"
                          >
                            <Trash2 size={12} />
                          </button>

                          {/* Left Column: Icon Select */}
                          <div className="flex flex-col gap-2 shrink-0 items-center">
                            <label className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Icon</label>
                            <select
                              value={reason.icon}
                              onChange={e => handleUpdateReason(idx, 'icon', e.target.value)}
                              className="bg-slate-800 border border-white/10 rounded-lg p-1.5 text-xs text-white outline-none focus:border-[#2796a9] w-24 text-center"
                            >
                              <option value="ShieldCheck">Shield</option>
                              <option value="Cpu">CPU</option>
                              <option value="ThumbsUp">ThumbsUp</option>
                              <option value="HardHat">Safety</option>
                            </select>
                            <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-white/10 flex items-center justify-center text-[#2796a9] mt-1">
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
                              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs focus:border-[#2796a9] outline-none text-white font-bold transition-all w-full"
                              required
                            />
                            <textarea
                              value={reason.desc}
                              onChange={e => handleUpdateReason(idx, 'desc', e.target.value)}
                              placeholder="Description copy detailing why this choice matter..."
                              className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-xs focus:border-[#2796a9] outline-none text-white font-light transition-all w-full min-h-[48px] resize-none leading-relaxed"
                              required
                            />
                          </div>
                        </div>
                      ))}
                      {customizeForm.reasons.length === 0 && (
                        <div className="col-span-2 text-center py-12 text-white/30 text-xs">
                          No value cards configured. Click Add Value Card to get started.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Partners & Customers Brand Logo Lists */}
                  <div className="grid grid-cols-1 gap-8">
                    {/* Partners List */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-base text-[#2796a9]">Brand Partner Logos</h4>
                          <p className="text-xs text-white/40 font-light mt-0.5">Manage companies we partner with logo slider.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddPartner}
                          className="px-3 py-1.5 bg-[#2796a9]/10 text-[#2796a9] hover:bg-[#2796a9] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Add Partner Logo</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customizeForm.partners.map((partner, idx) => (
                          <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 relative items-center group">
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemovePartner(idx)}
                              className="absolute top-2 right-2 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/10 hover:border-red-500 rounded-lg transition-all opacity-40 group-hover:opacity-100 cursor-pointer"
                              title="Delete Logo Card"
                            >
                              <Trash2 size={12} />
                            </button>

                            {/* Logo Preview */}
                            <div className="w-16 h-16 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative">
                              <img
                                src={partner.src}
                                alt={partner.name}
                                className="max-w-full max-h-full object-contain brightness-0 invert opacity-70"
                                style={{ transform: `scale(${partner.scale || 1})` }}
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
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:border-[#2796a9] outline-none text-white font-semibold transition-all w-full"
                                required
                              />
                              <input
                                type="text"
                                value={partner.src}
                                onChange={e => handleUpdatePartner(idx, 'src', e.target.value)}
                                placeholder="Image Path (e.g. /atlas.png)"
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] focus:border-[#2796a9] outline-none text-white/80 transition-all w-full font-light"
                                required
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-white/40 uppercase font-semibold">Scale:</span>
                                <input
                                  type="number"
                                  step="0.05"
                                  min="0.1"
                                  max="5.0"
                                  value={partner.scale || 1.0}
                                  onChange={e => handleUpdatePartner(idx, 'scale', e.target.value)}
                                  className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-xs focus:border-[#2796a9] outline-none text-white text-center font-mono"
                                  required
                                />
                                <span className="text-[10px] text-white/30">(e.g. 1.35)</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {customizeForm.partners.length === 0 && (
                          <div className="col-span-3 text-center py-12 text-white/30 text-xs">
                            No brand partners configured. Click Add Partner Logo.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Customers List */}
                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
                      <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-base text-[#2796a9]">Brand Customer Logos</h4>
                          <p className="text-xs text-white/40 font-light mt-0.5">Manage prestigious customers logo marquee.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddCustomer}
                          className="px-3 py-1.5 bg-[#2796a9]/10 text-[#2796a9] hover:bg-[#2796a9] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                          <span>Add Customer Logo</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customizeForm.customers.map((customer, idx) => (
                          <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 relative items-center group">
                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveCustomer(idx)}
                              className="absolute top-2 right-2 p-1 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/10 hover:border-red-500 rounded-lg transition-all opacity-40 group-hover:opacity-100 cursor-pointer"
                              title="Delete Logo Card"
                            >
                              <Trash2 size={12} />
                            </button>

                            {/* Logo Preview */}
                            <div className="w-16 h-16 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center p-1.5 shrink-0 overflow-hidden relative">
                              <img
                                src={customer.src}
                                alt={customer.name}
                                className="max-w-full max-h-full object-contain brightness-0 invert opacity-70"
                                style={{ transform: `scale(${customer.scale || 1})` }}
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
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs focus:border-[#2796a9] outline-none text-white font-semibold transition-all w-full"
                                required
                              />
                              <input
                                type="text"
                                value={customer.src}
                                onChange={e => handleUpdateCustomer(idx, 'src', e.target.value)}
                                placeholder="Image Path (e.g. /suzlon.png)"
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px] focus:border-[#2796a9] outline-none text-white/80 transition-all w-full font-light"
                                required
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-white/40 uppercase font-semibold">Scale:</span>
                                <input
                                  type="number"
                                  step="0.05"
                                  min="0.1"
                                  max="5.0"
                                  value={customer.scale || 1.0}
                                  onChange={e => handleUpdateCustomer(idx, 'scale', e.target.value)}
                                  className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-xs focus:border-[#2796a9] outline-none text-white text-center font-mono"
                                  required
                                />
                                <span className="text-[10px] text-white/30">(e.g. 1.35)</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {customizeForm.customers.length === 0 && (
                          <div className="col-span-3 text-center py-12 text-white/30 text-xs">
                            No brand customers configured. Click Add Customer Logo.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
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
              className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 text-white"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-lg">
                  {activeModal === 'create_activity' && 'Add New Activity'}
                  {activeModal === 'edit_activity' && 'Edit Activity'}
                  {activeModal === 'create_service' && 'Add Product/Service Capability'}
                  {activeModal === 'edit_service' && 'Edit Product/Service Capability'}
                </h3>
                <button onClick={() => setActiveModal(null)} className="text-white/40 hover:text-white transition-colors cursor-pointer">
                  <XCircle size={20} />
                </button>
              </div>

              {/* Modal Form */}
              {/* ACTIVITIES FORMS */}
              {(activeModal === 'create_activity' || activeModal === 'edit_activity') && (
                <form onSubmit={activeModal === 'create_activity' ? handleCreateActivitySubmit : handleEditActivitySubmit} className="p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Activity Title</label>
                    <input 
                      type="text" 
                      value={activityForm.title} 
                      onChange={e => setActivityForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Project Highlights" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] focus:bg-white/10 outline-none transition-all"
                      required
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Subtitle / Description</label>
                    <textarea 
                      value={activityForm.subtitle} 
                      onChange={e => setActivityForm(prev => ({ ...prev, subtitle: e.target.value }))}
                      placeholder="Enter a brief summary of the activity..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] focus:bg-white/10 outline-none min-h-[80px] transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Image Resource Path</label>
                      <input 
                        type="text" 
                        value={activityForm.image} 
                        onChange={e => setActivityForm(prev => ({ ...prev, image: e.target.value }))}
                        placeholder="e.g., /image1.png" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] focus:bg-white/10 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Select Theme Gradient</label>
                      <select
                        value={activityForm.gradient}
                        onChange={e => setActivityForm(prev => ({ ...prev, gradient: e.target.value }))}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] outline-none transition-all text-white"
                      >
                        {defaultGradients.map((g, idx) => (
                          <option key={idx} value={g}>Theme Gradient {idx + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Gradient Preview */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Preview Card Background</label>
                    <div className="h-16 rounded-xl flex items-center justify-center font-bold text-sm text-white border border-white/10 shadow-inner" style={{ background: activityForm.gradient }}>
                      {activityForm.title || 'Gradient Preview'}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 text-xs font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2.5 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 rounded-xl text-xs font-semibold cursor-pointer">
                      {activeModal === 'create_activity' ? 'Save Activity' : 'Update Activity'}
                    </button>
                  </div>
                </form>
              )}

              {/* SERVICES FORMS */}
              {(activeModal === 'create_service' || activeModal === 'edit_service') && (
                <form onSubmit={activeModal === 'create_service' ? handleCreateServiceSubmit : handleEditServiceSubmit} className="p-6 flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Capability Title</label>
                      <input 
                        type="text" 
                        value={serviceForm.title} 
                        onChange={e => setServiceForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Heavy Pneumatics" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] focus:bg-white/10 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Select Lucide Icon</label>
                      <select
                        value={serviceForm.icon}
                        onChange={e => setServiceForm(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] outline-none transition-all text-white"
                      >
                        {Object.keys(iconMap).map(iconName => (
                          <option key={iconName} value={iconName}>{iconName}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Image Path</label>
                    <input 
                      type="text" 
                      value={serviceForm.image} 
                      onChange={e => setServiceForm(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="e.g., /pneumatic.png" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] focus:bg-white/10 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Description</label>
                    <textarea 
                      value={serviceForm.desc} 
                      onChange={e => setServiceForm(prev => ({ ...prev, desc: e.target.value }))}
                      placeholder="Describe what is provided in this category..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:border-[#2796a9] focus:bg-white/10 outline-none min-h-[90px] transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-white/5">
                    <button type="button" onClick={() => setActiveModal(null)} className="px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 text-xs font-semibold cursor-pointer">Cancel</button>
                    <button type="submit" className="px-4 py-2.5 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 rounded-xl text-xs font-semibold cursor-pointer">
                      {activeModal === 'create_service' ? 'Save Capability' : 'Update Capability'}
                    </button>
                  </div>
                </form>
              )}
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
          ? 'bg-gradient-to-r from-[#04667b]/20 to-[#2796a9]/10 text-[#2796a9] border-l-4 border-[#2796a9] pl-3 shadow-[0_4px_12px_rgba(4,102,123,0.05)]' 
          : 'text-white/60 hover:text-white hover:bg-white/5 border-l-4 border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {badge > 0 && (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#2796a9] text-white">
          {badge}
        </span>
      )}
    </button>
  );
}

// Stats Cards Helper
function DashboardCard({ title, value, icon, color }) {
  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-b border flex flex-col gap-4 shadow-md ${color}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
          {icon}
        </div>
      </div>
      <span className="text-3xl font-extrabold tracking-tight text-white leading-none">
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
    <div className="flex items-center justify-center min-h-screen bg-[#02050c] p-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#04667b_0%,_transparent_60%)] opacity-20" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 flex flex-col gap-6"
      >
        <div className="flex flex-col gap-2 items-center text-center">
          <Link to="/" className="text-xs text-white/50 hover:text-white transition-colors flex items-center gap-1.5 mb-2">
            <ArrowLeft size={12} />
            <span>Back to site</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white tracking-wide">Admin Dashboard</h2>
          <p className="text-sm font-light text-white/50">Please authenticate to access administrator settings.</p>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-white/40"><Mail size={16} /></span>
              <input
                type="email"
                placeholder="admin@gmail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all placeholder:text-white/20 text-white"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-white/60 font-semibold uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-white/40"><Lock size={16} /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:border-[#2796a9] focus:bg-white/10 text-sm outline-none transition-all placeholder:text-white/20 text-white"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                className="absolute right-3 text-white/40 hover:text-white transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-[#04667b] to-[#2796a9] hover:brightness-110 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-[0_4px_12px_rgba(4,102,123,0.3)] cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
