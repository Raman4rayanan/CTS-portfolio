import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, User, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      setStatus('error');
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    try {
      const response = await fetch(`${apiBaseUrl}/api/portfolio/inquiries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setFormData({ name: '', phone: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMsg(data.error || 'Failed to submit inquiry.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg('Could not connect to server. Please check your backend is running.');
    }
  };

  return (
    <section id="contact" className="bg-background-light py-20 px-6 md:px-16 lg:px-28">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 mb-16">

          {/* Left Column: Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-semibold tracking-widest text-primary-blue uppercase">
              Get in Touch
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-primary-navy mb-10">
              Contact Us
            </h2>

            <div className="space-y-6">
              {/* Company Phone */}
              <div className="flex items-start gap-4 cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex flex-shrink-0 items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-colors duration-300">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500">Company Phone</h4>
                  <p className="text-lg font-bold text-primary-navy mt-1">9444218166</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex flex-shrink-0 items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-colors duration-300">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500">Email Address</h4>
                  <a href="mailto:sales@concepttools.net" className="text-lg font-bold text-primary-navy mt-1 hover:text-primary-blue transition-colors">
                    sales@concepttools.net
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex flex-shrink-0 items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-colors duration-300">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500">Address</h4>
                  <p className="text-base font-semibold text-primary-navy mt-1 max-w-[280px] leading-relaxed">
                    #92, Railway Station Road, Korattur, Chennai – 600080, Near Green Cinemas
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Center Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
          >
            <h3 className="text-2xl font-bold text-primary-navy mb-6">Send an Inquiry</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                  className="w-full bg-background-light border border-slate-200 rounded-lg px-4 py-3 text-slate-700 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your Phone Number"
                  required
                  className="w-full bg-background-light border border-slate-200 rounded-lg px-4 py-3 text-slate-700 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your Email"
                  className="w-full bg-background-light border border-slate-200 rounded-lg px-4 py-3 text-slate-700 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="How can we help you?"
                  required
                  className="w-full bg-background-light border border-slate-200 rounded-lg px-4 py-3 text-slate-700 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                style={{ backgroundColor: '#0f5660' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1b809a'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#0f5660'}
                className="w-full mt-4 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? 'Sending...' : 'Send Message'}
                <Send size={18} />
              </button>

              {/* Status Notifications */}
              {status === 'success' && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 text-sm">
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <span>Your inquiry has been successfully sent!</span>
                </div>
              )}
              {status === 'error' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                  <AlertCircle size={16} className="text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>
          </motion.div>


          {/* Right Column: Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full h-full min-h-[300px] md:min-h-[400px] rounded-2xl overflow-hidden shadow-lg border border-slate-200"
          >
            <iframe
              src="https://maps.google.com/maps?q=13.102535392655057, 80.17953434935382&z=17&output=embed"
              className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
