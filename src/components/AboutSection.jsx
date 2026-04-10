import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Settings, Clock, TrendingDown, Cpu, ThumbsUp, HardHat } from 'lucide-react';

const badges = [
  { icon: Clock, label: '25+ Years Experience' },
  { icon: ShieldCheck, label: 'HSE Compliant' },
  { icon: Settings, label: 'Customized Solutions' },
];

const reasons = [
  { title: 'High-Quality Products', icon: ShieldCheck, desc: 'Sourced from the best global brands.' },
  { title: 'Cost-Effective Solutions', icon: TrendingDown, desc: 'Value-driven pricing without compromise.' },
  { title: 'Advanced Technology', icon: Cpu, desc: 'State-of-the-art tools and equipment.' },
  { title: 'Reliable Service', icon: ThumbsUp, desc: 'Consistent support you can count on.' },
  { title: 'HSE Compliance', icon: HardHat, desc: 'Highest standards in health & safety.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

export default function AboutSection() {
  return (
    <section id="about" className="bg-white py-20 px-6 md:px-16 lg:px-28">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Section: About Us Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Left – Image */}
          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-xl"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <img
              src="/about.jpg"
              alt="Concept Tools Workshop"
              className="w-full h-[420px] object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.style.background = 'linear-gradient(135deg, #0F4C81 0%, #0B1F3A 100%)';
                e.target.parentElement.style.display = 'flex';
                e.target.parentElement.style.alignItems = 'center';
                e.target.parentElement.style.justifyContent = 'center';
                e.target.parentElement.innerHTML = `<div style="text-align:center;color:#fff;padding:2rem"><div style="font-size:4rem;margin-bottom:1rem">🔧</div><div style="font-size:1.2rem;font-weight:600">Concept Tools & Services</div><div style="opacity:.7;margin-top:.5rem">Est. 2021</div></div>`;
              }}
            />
            {/* Accent bar */}
            <div className="absolute left-0 top-0 h-full w-1.5 bg-primary-blue rounded-l-2xl" />
          </motion.div>

          {/* Right – Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.span
              variants={fadeUp}
              className="text-sm font-semibold tracking-widest text-primary-blue uppercase"
            >
              About Us
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="mt-3 text-3xl md:text-4xl font-bold text-primary-navy leading-snug"
            >
              Powering Industries with <br />
              <span className="text-primary-blue">Precision &amp; Reliability</span>
            </motion.h2>

            <motion.p variants={fadeUp} className="mt-5 text-slate-600 leading-relaxed text-base">
              Concept Tools and Services (CTS) was established in 2021 with a clear mission — to be
              the most trusted partner for industrial tools and MRO (Maintenance, Repair &amp;
              Operations) solutions in India. Backed by a leadership team with over{' '}
              <strong>25 years of hands-on industry experience</strong>, we deliver world-class
              products paired with expert technical knowledge.
            </motion.p>

            <motion.p variants={fadeUp} className="mt-4 text-slate-600 leading-relaxed text-base">
              From pneumatic &amp; power tools to safety equipment and customized solutions, our
              comprehensive product range is carefully curated to meet the evolving demands of
              modern industrial operations — all while maintaining full HSE compliance.
            </motion.p>

            {/* Badges */}
            <motion.div
              variants={fadeUp}
              className="mt-8 flex flex-wrap gap-4"
            >
              {badges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2.5 bg-background-light border border-slate-200 rounded-lg shadow-sm text-sm font-semibold text-primary-navy"
                >
                  <Icon size={16} className="text-primary-blue flex-shrink-0" />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Section: Why Choose Us */}
        <div className="mt-28">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-primary-navy mb-4">
              Why Choose Us
            </h3>
            <div className="h-1 w-16 bg-primary-blue mx-auto rounded"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-8">
            {reasons.map((reason, idx) => {
              const Icon = reason.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="text-center flex flex-col items-center bg-background-light p-6 rounded-xl border border-slate-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-white text-primary-blue rounded-full shadow-sm flex items-center justify-center mb-5">
                    <Icon size={28} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-primary-navy font-bold text-base mb-3">
                    {reason.title}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {reason.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
