import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, User } from 'lucide-react';

export default function ContactSection() {
  return (
    <section id="contact" className="bg-background-light py-20 px-6 md:px-16 lg:px-28">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          
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
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-primary-navy mb-6">
              Contact Us
            </h2>
            <p className="text-slate-600 mb-10 leading-relaxed max-w-md">
              Ready to upgrade your industrial tools and safety equipment? Reach out to us for customized solutions, quotes, and expert MRO support.
            </p>

            <div className="space-y-6">
              {/* Point of Contact */}
              <div className="flex items-start gap-4 cursor-pointer group">
                <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex flex-shrink-0 items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-colors duration-300">
                  <User size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-500">Point of Contact</h4>
                  <p className="text-lg font-bold text-primary-navy mt-1">Priyadharshan A</p>
                  <p className="text-md font-semibold text-primary-navy">6379427064</p>
                </div>
              </div>

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

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100"
          >
            <h3 className="text-2xl font-bold text-primary-navy mb-6">Send an Inquiry</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-background-light border border-slate-200 rounded-lg px-4 py-3 text-slate-700 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Phone Number</label>
                <input
                  type="tel"
                  placeholder="Your Phone Number"
                  className="w-full bg-background-light border border-slate-200 rounded-lg px-4 py-3 text-slate-700 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-background-light border border-slate-200 rounded-lg px-4 py-3 text-slate-700 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Message</label>
                <textarea
                  rows="4"
                  placeholder="How can we help you?"
                  className="w-full bg-background-light border border-slate-200 rounded-lg px-4 py-3 text-slate-700 outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue transition-all resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-primary-blue hover:bg-blue-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Send Message
                <Send size={18} />
              </button>
            </form>
          </motion.div>

        </div>

        {/* Incorporated Map Section */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6, delay: 0.4 }}
           className="w-full h-96 rounded-2xl overflow-hidden shadow-lg border border-slate-200"
        >
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.0827145781304!2d80.1834!3d13.1098!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526400c28383e5%3A0xe67ba3dca7c7d415!2sRailway%20Station%20Rd%2C%20Korattur%2C%20Chennai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1713000000000!5m2!1sen!2sin" 
            className="w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}
