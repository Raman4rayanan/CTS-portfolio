import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChromaGrid from './ChromaGrid';

const activities = [
  {
    title: 'Work Updates',
    subtitle: 'Latest developments and operational milestones from our daily industrial engagements.',
    image: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857693/fhzsbpsktiawwqraf8lh.png',
    gradient: 'linear-gradient(135deg, #0F4C81, #0B1F3A)',
  },
  {
    title: 'Project Highlights',
    subtitle: 'Showcasing our recent successful implementations and turnkey solutions.',
    image: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857694/cceq41dnnlwuxtidgqa4.png',
    gradient: 'linear-gradient(135deg, #198e9d, #0B1F3A)',
  },
  {
    title: 'Product Demonstrations',
    subtitle: 'On-site technical demonstrations of our newest power tools and equipment.',
    image: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857695/a4v03lafndermfqibdi5.png',
    gradient: 'linear-gradient(135deg, #016A8A, #053b4d)',
  },
  {
    title: 'Client Visits',
    subtitle: 'Building lasting partnerships through on-site visits and collaborative consultations with our clients.',
    image: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857693/fhzsbpsktiawwqraf8lh.png',
    gradient: 'linear-gradient(135deg, #1a3a5c, #0B1F3A)',
  },
  {
    title: 'Training & Workshops',
    subtitle: 'Empowering our teams with the latest safety protocols, tool handling skills, and industry best practices.',
    image: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857694/cceq41dnnlwuxtidgqa4.png',
    gradient: 'linear-gradient(135deg, #0e5c6e, #0B1F3A)',
  },
  {
    title: 'Trade Exhibitions',
    subtitle: 'Representing CTS at premier industrial expos to showcase innovations and connect with global partners.',
    image: 'https://res.cloudinary.com/coo50qxq/image/upload/v1786857695/a4v03lafndermfqibdi5.png',
    gradient: 'linear-gradient(135deg, #0a4a7a, #0B1F3A)',
  },
];

export default function ActivitiesSection() {
  const [activitiesList, setActivitiesList] = useState(activities);

  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiBaseUrl}/api/portfolio/activities`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          setActivitiesList(data.data);
        }
      })
      .catch(err => console.error('Error fetching activities:', err));
  }, []);

  return (
    <section id="activities" className="bg-white py-32 px-6 md:px-16 lg:px-28 flex flex-col justify-center">
      <div className="max-w-[1400px] mx-auto w-full">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base font-bold tracking-[0.2em] text-primary-blue uppercase"
          >
            Insights
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-4xl md:text-5xl font-extrabold text-primary-navy"
          >
            Recent Activities
          </motion.h2>
        </div>

        {/* Integrated ChromaGrid Carousel component */}
        <ChromaGrid items={activitiesList} />
      </div>
    </section>
  );
}
