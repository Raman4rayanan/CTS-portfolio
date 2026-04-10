import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingDown, Cpu, ThumbsUp, HardHat } from 'lucide-react';

const reasons = [
  { title: 'High-Quality Products', icon: ShieldCheck, desc: 'Sourced from the best global brands.' },
  { title: 'Cost-Effective Solutions', icon: TrendingDown, desc: 'Value-driven pricing without compromise.' },
  { title: 'Advanced Technology', icon: Cpu, desc: 'State-of-the-art tools and equipment.' },
  { title: 'Reliable Service', icon: ThumbsUp, desc: 'Consistent support you can count on.' },
  { title: 'HSE Compliance', icon: HardHat, desc: 'Highest standards in health & safety.' },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-primary-navy py-16 px-6 md:px-16 lg:px-28 border-y-4 border-primary-blue">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Why Choose Us
          </h2>
          <div className="h-1 w-16 bg-primary-blue mx-auto rounded"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {reasons.map((reason, idx) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-white/10 text-primary-blue rounded-full flex items-center justify-center mb-4 ring-1 ring-white/20">
                  <Icon size={28} />
                </div>
                <h4 className="text-white font-semibold text-lg mb-2">
                  {reason.title}
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed max-w-[180px]">
                  {reason.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
