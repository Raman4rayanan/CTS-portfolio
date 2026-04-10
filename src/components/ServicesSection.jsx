import React from 'react';
import { motion } from 'framer-motion';
import { Settings, PenTool, Wrench, Archive, ArrowUpSquare, Leaf, HardHat, Cog, Wrench as ToolIcon } from 'lucide-react';
import MagicBento from './MagicBento';

const services = [
  { title: 'Pneumatic Tools', icon: Settings, desc: 'High-performance air-powered tools for heavy-duty applications.' },
  { title: 'Power Tools', icon: PenTool, desc: 'Reliable and efficient electric tools for precision and power.' },
  { title: 'Hand Tools', icon: Wrench, desc: 'Durable manual tools crafted for everyday industrial tasks.' },
  { title: 'Storage Cabinets', icon: Archive, desc: 'Robust industrial storage solutions to keep workspaces organized.' },
  { title: 'Lifting Equipment', icon: ArrowUpSquare, desc: 'Safe and certified lifting gear for seamless material handling.' },
  { title: 'Environmental Protection Equipment', icon: Leaf, desc: 'Sustainable solutions for emission control and safe disposal.' },
  { title: 'PPE (Personal Protective Equipment)', icon: HardHat, desc: 'Industry-standard safety gear to protect your workforce.' },
  { title: 'Customized Tools', icon: Cog, desc: 'Bespoke tool designs tailored to your specific operational needs.' },
  { title: 'Service Solutions', icon: ToolIcon, desc: 'Expert MRO support and repair services to minimize downtime.' },
];

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

        <div className="w-full">
          <MagicBento items={services} />
        </div>
      </div>
    </section>
  );
}
