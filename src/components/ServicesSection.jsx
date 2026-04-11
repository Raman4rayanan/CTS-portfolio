import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, PenTool, Wrench, Archive, ArrowUpSquare, Leaf, HardHat, Cog, Wrench as ToolIcon, X } from 'lucide-react';
import MagicBento from './MagicBento';

const services = [
  { title: 'Pneumatic Tools', icon: Settings, image: '/pneumatic.png', desc: 'High-performance air-powered tools for heavy-duty applications.' },
  { title: 'Power Tools', icon: PenTool, image: '/power.jpeg', desc: 'Reliable and efficient electric tools for precision and power.' },
  { title: 'Hand Tools', icon: Wrench, image: '/hand.jpg', desc: 'Durable manual tools crafted for everyday industrial tasks.' },
  { title: 'Storage Cabinets', icon: Archive, image: '/storage.jpg', desc: 'Robust industrial storage solutions to keep workspaces organized.' },
  { title: 'Lifting Equipment', icon: ArrowUpSquare, image: '/lifting.jpg', desc: 'Safe and certified lifting gear for seamless material handling.' },
  { title: 'PPE (Personal Protective Equipment)', icon: HardHat, image: '/personal.jpg', desc: 'Industry-standard safety gear to protect your workforce.' },
  { title: 'Environmental Protection Equipment', icon: Leaf, image: '/environment.jpg', desc: 'Sustainable solutions for emission control and safe disposal.' },
  { title: 'Service Solutions', icon: ToolIcon, image: '/services.jpg', desc: 'Expert MRO support and repair services to minimize downtime.' },
  { title: 'Customized Tools', icon: Cog, image: '/customized.jpg', desc: 'Bespoke tool designs tailored to your specific operational needs.' },
];

const dummyTools = {
  'Pneumatic Tools': [
    { name: 'Impact Wrench 1/2"', image: '/pneumatic.png' },
    { name: 'Air Grinder Heavy Duty', image: '/pneumatic.png' },
    { name: 'Pneumatic Hammer', image: '/pneumatic.png' },
    { name: 'Air Riveter', image: '/pneumatic.png' },
    { name: 'Pneumatic Drill', image: '/pneumatic.png' },
    { name: 'High Speed Sander', image: '/pneumatic.png' },
  ],
  'Power Tools': [
    { name: 'Cordless Drill 20V', image: '/power.jpeg' },
    { name: 'Angle Grinder Compact', image: '/power.jpeg' },
    { name: 'Rotary Hammer Pro', image: '/power.jpeg' },
    { name: 'Circular Saw', image: '/power.jpeg' },
    { name: 'Impact Driver', image: '/power.jpeg' },
    { name: 'Electric Planer', image: '/power.jpeg' },
  ],
  'Hand Tools': [
    { name: 'Pro Screwdriver Set', image: '/hand.jpg' },
    { name: 'Adjustable Wrench Set', image: '/hand.jpg' },
    { name: 'Industrial Pliers', image: '/hand.jpg' },
    { name: 'Claw Hammer', image: '/hand.jpg' },
    { name: 'Impact Socket Box', image: '/hand.jpg' },
    { name: 'Precision Torque Wrench', image: '/hand.jpg' },
  ],
  'Storage Cabinets': [
    { name: 'Heavy Duty Tool Cabinet', image: '/storage.jpg' },
    { name: 'Mobile Roller Box', image: '/storage.jpg' },
    { name: 'Wall Mount Organizer', image: '/storage.jpg' },
    { name: 'Draw Drawer Unit', image: '/storage.jpg' },
    { name: 'Workshop Rack 8-Tier', image: '/storage.jpg' },
  ],
  'Lifting Equipment': [
    { name: 'Hydraulic Floor Jack', image: '/lifting.jpg' },
    { name: 'Heavy Chain Hoist', image: '/lifting.jpg' },
    { name: 'Industrial Lifting Straps', image: '/lifting.jpg' },
    { name: 'Engine Crane', image: '/lifting.jpg' },
    { name: 'Pallet Truck Standard', image: '/lifting.jpg' },
  ],
  'PPE (Personal Protective Equipment)': [
    { name: 'Standard Safety Helmet', image: '/personal.jpg' },
    { name: 'Anti-fog Protective Goggles', image: '/personal.jpg' },
    { name: 'Reflective High-Vis Vest', image: '/personal.jpg' },
    { name: 'Industrial Ear Defenders', image: '/personal.jpg' },
    { name: 'Cut-Resistant Gloves', image: '/personal.jpg' },
    { name: 'Steel Toe Boots', image: '/personal.jpg' },
  ],
  'Environmental Protection Equipment': [
    { name: 'Chemical Spill Kit', image: '/environment.jpg' },
    { name: 'Industrial Air Purifier', image: '/environment.jpg' },
    { name: 'Hazardous Waste Bin', image: '/environment.jpg' },
    { name: 'Safe Containment Drum', image: '/environment.jpg' },
  ],
  'Service Solutions': [
    { name: 'Annual Maintenance Contract', image: '/services.jpg' },
    { name: 'On-site Repair & Service', image: '/services.jpg' },
    { name: 'Precise Equipment Calibration', image: '/services.jpg' },
    { name: 'Comprehensive Safety Audit', image: '/services.jpg' },
  ],
  'Customized Tools': [
    { name: 'Custom Fabrication Specs', image: '/customized.jpg' },
    { name: 'Specialty Locking Wrench', image: '/customized.jpg' },
    { name: 'Tailored Storage Solution', image: '/customized.jpg' },
    { name: 'Bespoke Lifting Framework', image: '/customized.jpg' },
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

export default function ServicesSection() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedCategory) {
        setSelectedCategory(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [selectedCategory]);

  return (
    <section id="services" className="bg-background-light py-20 px-6 md:px-16 lg:px-28">
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
            Products &amp; Services
          </motion.h2>
        </div>

        <div className="w-full relative z-0">
          <MagicBento items={services} onItemClick={(card) => setSelectedCategory(card)} />
        </div>
      </div>

      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-10 shrink-0">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-primary-navy m-0">
                    {selectedCategory.title}
                  </h3>
                  <p className="text-slate-500 mt-1 text-sm md:text-base font-light">
                    Explore our range of premium solutions.
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary-navy hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable grid area */}
              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                   {(dummyTools[selectedCategory.title] || []).map((tool, idx) => (
                     <div key={idx} className="group flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                       <div className="h-48 w-full bg-slate-50 relative overflow-hidden">
                         <img src={tool.image} alt={tool.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                         <div className="absolute inset-0 bg-primary-navy/5 group-hover:bg-transparent transition-colors duration-300" />
                       </div>
                       <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                         <h4 className="font-bold text-primary-navy text-lg leading-tight">
                           {tool.name}
                         </h4>
                         <span className="text-xs font-semibold text-primary-blue bg-blue-50 w-max px-3 py-1.5 rounded-md self-start border border-blue-100/50">View specs</span>
                       </div>
                     </div>
                   ))}
                   
                   {(!dummyTools[selectedCategory.title] || dummyTools[selectedCategory.title].length === 0) && (
                     <div className="col-span-full py-12 text-center text-slate-400">
                       <p>Detailed equipment lists coming soon.</p>
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
