"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const services = [
  {
    title: "Web Development",
    image: "/web-dev.jpeg",
    points: [
      "Custom Websites",
      "High Performance",
      "SEO Optimized",
    ],
  },
  {
    title: "Mobile Applications",
    image: "/mobile-app.jpeg",
    points: [
      "Android",
      "iOS",
      "Cross Platform",
    ],
  },
  {
    title: "AI Solutions",
    image: "/ai-solutions.jpeg",
    points: [
      "Chatbots",
      "Automation",
      "AI Integrations",
    ],
  },
  {
    title: "Business Automation",
    image: "/automation.jpeg",
    points: [
      "CRM Systems",
      "Workflow Automation",
      "Lead Automation",
    ],
  },
  {
    title: "Social Media Marketing",
    image: "/Social Media Marketing.jpeg",
    points: [
      "Research",
      "Wireframes",
      "Premium Content",
    ],
  },
  {
    title: "Digital Growth",
    image: "/growth.jpeg",
    points: [
      "SEO",
      "Analytics",
      "Conversion Optimization",
    ],
  },
];

export default function ServicesSection() {
  return (
    <section
      id="services"
      className="bg-black py-24 lg:py-32"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center mb-20">

          <p className="uppercase tracking-[0.3em] text-gold-primary text-sm mb-4">
            Our Services
          </p>

          <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold">
            Technology Driven
            <span className="block text-gold-primary">
              Business Solutions
            </span>
          </h2>

          <p className="text-text-muted mt-6 max-w-3xl mx-auto text-lg">
            Premium digital solutions engineered
            to help businesses scale faster,
            automate operations and dominate
            their markets.
          </p>

        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {services.map((service, index) => (

            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
              }}
              whileHover={{
                y: -12,
              }}
              className="
              bg-[#0D0D0D]
              rounded-[30px]
              overflow-hidden
              border
              border-gold-primary/10
              hover:border-gold-primary/40
              hover:shadow-[0_20px_60px_rgba(212,160,23,0.15)]
              transition-all
              duration-300
              "
            >

              <div className="relative h-[240px] overflow-hidden">

                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="
                  object-cover
                  hover:scale-110
                  transition-transform
                  duration-700
                  "
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              </div>

              <div className="p-8">

                <h3 className="text-white text-2xl font-bold mb-6">
                  {service.title}
                </h3>

                <div className="space-y-3">

                  {service.points.map((point) => (

                    <div
                      key={point}
                      className="
                      bg-white/5
                      border
                      border-white/10
                      rounded-xl
                      px-4
                      py-3
                      text-gray-300
                      "
                    >
                      {point}
                    </div>

                  ))}

                </div>

                <button
                  className="
                  mt-8
                  text-gold-primary
                  font-semibold
                  hover:translate-x-1
                  transition-transform
                  "
                >
                  Learn More →
                </button>

              </div>

            </motion.div>

          ))}

        </div>

      </div>
    </section>
  );
}
