import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, PenTool, Wrench, Archive, ArrowUpSquare, Leaf, HardHat, Cog, Wrench as ToolIcon } from 'lucide-react';
import MagicBento from './MagicBento';

const services = [
  { title: 'Lifting Equipment', icon: ArrowUpSquare, image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278560/port/mdztfabj3qigkdf8nkw1.jpg', desc: 'Safe and certified lifting gear for seamless material handling.' },
  { title: 'Pneumatic Tools', icon: Settings, image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/awouogqczxlfzf4fn9qf.jpg', desc: 'High-performance air-powered tools for heavy-duty applications.' },
  { title: 'Hand Tools', icon: Wrench, image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278522/port/zhzh2v9rozlz7q6askvl.jpg', desc: 'Durable manual tools crafted for everyday industrial tasks.' },
  { title: 'Storage Cabinets', icon: Archive, image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278567/port/lycedhxfwbcvsoyjdt71.jpg', desc: 'Robust industrial storage solutions to keep workspaces organized.' },
  { title: 'Power Tools', icon: PenTool, image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png', desc: 'Reliable and efficient electric tools for precision and power.' },
  { title: 'PPE (Personal Protective Equipment)', icon: HardHat, image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/i57qdajixxllurowpkev.jpg', desc: 'Industry-standard safety gear to protect your workforce.' },
  { title: 'Environmental Protection Equipment', icon: Leaf, image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278520/port/gyg0vgl7shq7mraalswv.jpg', desc: 'Sustainable solutions for emission control and safe disposal.' },
  { title: 'Service Solutions', icon: ToolIcon, image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278564/port/hou9pvgexr530c5ryfqn.jpg', desc: 'Expert MRO support and repair services to minimize downtime.' },
  { title: 'Customized Tools', icon: Cog, image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278519/port/acxitxmrf86z68u2inpw.jpg', desc: 'Bespoke tool designs tailored to your specific operational needs.' },
];

const dummyTools = {
  'Pneumatic Tools': [
    { name: 'Impact Wrench 1/2"', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/awouogqczxlfzf4fn9qf.jpg' },
    { name: 'Air Grinder Heavy Duty', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/awouogqczxlfzf4fn9qf.jpg' },
    { name: 'Pneumatic Hammer', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/awouogqczxlfzf4fn9qf.jpg' },
    { name: 'Air Riveter', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/awouogqczxlfzf4fn9qf.jpg' },
    { name: 'Pneumatic Drill', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/awouogqczxlfzf4fn9qf.jpg' },
    { name: 'High Speed Sander', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/awouogqczxlfzf4fn9qf.jpg' },
  ],
  'Power Tools': [
    { name: 'Cordless Drill 20V', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png' },
    { name: 'Angle Grinder Compact', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png' },
    { name: 'Rotary Hammer Pro', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png' },
    { name: 'Circular Saw', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png' },
    { name: 'Impact Driver', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png' },
    { name: 'Electric Planer', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782367880/ecomm/placeholder.png' },
  ],
  'Hand Tools': [
    { name: 'Pro Screwdriver Set', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278522/port/zhzh2v9rozlz7q6askvl.jpg' },
    { name: 'Adjustable Wrench Set', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278522/port/zhzh2v9rozlz7q6askvl.jpg' },
    { name: 'Industrial Pliers', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278522/port/zhzh2v9rozlz7q6askvl.jpg' },
    { name: 'Claw Hammer', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278522/port/zhzh2v9rozlz7q6askvl.jpg' },
    { name: 'Impact Socket Box', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278522/port/zhzh2v9rozlz7q6askvl.jpg' },
    { name: 'Precision Torque Wrench', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278522/port/zhzh2v9rozlz7q6askvl.jpg' },
  ],
  'Storage Cabinets': [
    { name: 'Heavy Duty Tool Cabinet', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278567/port/lycedhxfwbcvsoyjdt71.jpg' },
    { name: 'Mobile Roller Box', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278567/port/lycedhxfwbcvsoyjdt71.jpg' },
    { name: 'Wall Mount Organizer', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278567/port/lycedhxfwbcvsoyjdt71.jpg' },
    { name: 'Draw Drawer Unit', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278567/port/lycedhxfwbcvsoyjdt71.jpg' },
    { name: 'Workshop Rack 8-Tier', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278567/port/lycedhxfwbcvsoyjdt71.jpg' },
  ],
  'Lifting Equipment': [
    { name: 'Hydraulic Floor Jack', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278560/port/mdztfabj3qigkdf8nkw1.jpg' },
    { name: 'Heavy Chain Hoist', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278560/port/mdztfabj3qigkdf8nkw1.jpg' },
    { name: 'Industrial Lifting Straps', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278560/port/mdztfabj3qigkdf8nkw1.jpg' },
    { name: 'Engine Crane', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278560/port/mdztfabj3qigkdf8nkw1.jpg' },
    { name: 'Pallet Truck Standard', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278560/port/mdztfabj3qigkdf8nkw1.jpg' },
  ],
  'PPE (Personal Protective Equipment)': [
    { name: 'Standard Safety Helmet', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/i57qdajixxllurowpkev.jpg' },
    { name: 'Anti-fog Protective Goggles', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/i57qdajixxllurowpkev.jpg' },
    { name: 'Reflective High-Vis Vest', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/i57qdajixxllurowpkev.jpg' },
    { name: 'Industrial Ear Defenders', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/i57qdajixxllurowpkev.jpg' },
    { name: 'Cut-Resistant Gloves', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/i57qdajixxllurowpkev.jpg' },
    { name: 'Steel Toe Boots', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278562/port/i57qdajixxllurowpkev.jpg' },
  ],
  'Environmental Protection Equipment': [
    { name: 'Chemical Spill Kit', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278520/port/gyg0vgl7shq7mraalswv.jpg' },
    { name: 'Industrial Air Purifier', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278520/port/gyg0vgl7shq7mraalswv.jpg' },
    { name: 'Hazardous Waste Bin', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278520/port/gyg0vgl7shq7mraalswv.jpg' },
    { name: 'Safe Containment Drum', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278520/port/gyg0vgl7shq7mraalswv.jpg' },
  ],
  'Service Solutions': [
    { name: 'Annual Maintenance Contract', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278564/port/hou9pvgexr530c5ryfqn.jpg' },
    { name: 'On-site Repair & Service', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278564/port/hou9pvgexr530c5ryfqn.jpg' },
    { name: 'Precise Equipment Calibration', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278564/port/hou9pvgexr530c5ryfqn.jpg' },
    { name: 'Comprehensive Safety Audit', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278564/port/hou9pvgexr530c5ryfqn.jpg' },
  ],
  'Customized Tools': [
    { name: 'Custom Fabrication Specs', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278519/port/acxitxmrf86z68u2inpw.jpg' },
    { name: 'Specialty Locking Wrench', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278519/port/acxitxmrf86z68u2inpw.jpg' },
    { name: 'Tailored Storage Solution', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278519/port/acxitxmrf86z68u2inpw.jpg' },
    { name: 'Bespoke Lifting Framework', image: 'https://res.cloudinary.com/dzfuhxr2z/image/upload/f_auto,q_auto/v1782278519/port/acxitxmrf86z68u2inpw.jpg' },
  ],
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const iconMap = {
  Settings,
  PenTool,
  Wrench,
  Archive,
  ArrowUpSquare,
  HardHat,
  Leaf,
  Cog,
  ToolIcon
};

export default function ServicesSection() {
  const [servicesList, setServicesList] = useState(services);
  const navigate = useNavigate();

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiBaseUrl}/api/portfolio/services`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map(item => ({
            ...item,
            icon: iconMap[item.icon] || Settings
          }));
          setServicesList(mapped);
        }
      })
      .catch(err => console.error('Error fetching services:', err));
  }, []);

  const handleServiceClick = (card) => {
    console.log('DEBUG CLICK:', card);
    if (card.title && card.title.toLowerCase().includes('customized')) {
      localStorage.setItem('prefill_contact_msg', 'true');
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = 'contact';
      }
      window.dispatchEvent(new Event('prefillContact'));
    } else {
      let mappedCategory = card.title;
      const t = card.title.toLowerCase();
      if (t.includes('storage cabinets')) {
        mappedCategory = 'Storage Units';
      } else if (t.includes('ppe')) {
        mappedCategory = ['Protective Clothing', 'Protective Equipment', 'Hearing Protection', 'Safety Eyewear', 'Safety Footwear', 'Hand Protection'];
      } else if (t.includes('service solution')) {
        mappedCategory = 'Accessories';
      }
      navigate('/shop', { state: { category: mappedCategory } });
    }
  };

  return (
    <section id="services" className="bg-background-light py-16 md:py-20 px-6 md:px-16 lg:px-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm font-semibold tracking-widest text-primary-blue uppercase"
          >
            Capabilities
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-3 text-3xl md:text-4xl font-bold text-primary-navy"
          >
            Products &amp; Service
          </motion.h2>
        </div>

        <div className="w-full relative z-0">
          <MagicBento items={servicesList} onItemClick={handleServiceClick} />
        </div>
      </div>
    </section>
  );
}
