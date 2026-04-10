import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-navy pt-16 pb-8 px-6 md:px-16 lg:px-28 text-white w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 border-b border-white/10 pb-12">
        
        {/* Company Info */}
        <div className="md:w-1/3">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Concept Tools & Services
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Your trusted industrial partner for premium tools, MRO solutions, and uncompromised safety equipment.
          </p>
        </div>

        {/* Quick Links */}
        <div className="md:w-1/4">
          <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
          <ul className="space-y-3">
            {['Home', 'About', 'Services', 'Contact'].map((link) => (
              <li key={link}>
                 <a
                    href={`#${link.toLowerCase()}`}
                    className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-1 group w-fit"
                 >
                   {link}
                   <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                 </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected Contact Info */}
        <div className="md:w-1/3">
          <h4 className="text-lg font-semibold mb-4 text-white">Get in Touch</h4>
          <ul className="space-y-3 text-slate-400 text-sm">
            <li>
              <span className="block font-semibold text-slate-300 mb-1">Phone</span>
              9444218166
            </li>
            <li>
              <span className="block font-semibold text-slate-300 mb-1">Email</span>
              <a href="mailto:sales@concepttools.net" className="hover:text-white transition-colors">
                sales@concepttools.net
              </a>
            </li>
            <li>
              <span className="block font-semibold text-slate-300 mb-1">Address</span>
              #92, Railway Station Road, Korattur,<br />
              Chennai – 600080
            </li>
          </ul>
        </div>

      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <p>&copy; {currentYear} Concept Tools and Services. All rights reserved.</p>
        <p>Built for precision. Built for industry.</p>
      </div>
    </footer>
  );
}
