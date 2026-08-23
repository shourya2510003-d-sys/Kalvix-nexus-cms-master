"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section
      id="about"
      className="bg-white py-24 lg:py-32"
    >
      <div className="max-w-7xl mx-auto px-6">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >

            <p className="uppercase tracking-[0.3em] text-gold-primary mb-4">
          
            </p>

            <h2 className="text-black text-5xl lg:text-6xl font-bold leading-tight">
              About
              <span className="block text-gold-primary">
                Kalvix Nexus
              </span>
            </h2>

            <p className="text-gray-700 text-xl mt-10 leading-relaxed">
              We don't just build websites.
            </p>

            <p className="text-gray-600 mt-6 text-lg leading-relaxed">
              We build scalable digital ecosystems
              that help businesses grow faster,
              operate smarter and create
              long-term competitive advantages.
            </p>

            <p className="text-gray-600 mt-6 text-lg leading-relaxed">
              Our focus is combining modern design,
              AI innovation, automation systems and
              growth-driven technology.
            </p>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >

            <div
              className="
              bg-white
              rounded-[40px]
              overflow-hidden
              shadow-[0_30px_80px_rgba(0,0,0,0.1)]
              "
            >

              <Image
                src="/founder.jpg"
                alt="Shourya Sharma"
                width={700}
                height={900}
                className="w-full h-auto object-cover"
              />

            </div>

          </motion.div>
           <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -right-4 bottom-16 bg-bg-card border border-gold-primary/20 px-5 py-4 rounded-2xl"
              >
                <p className="font-semibold text-black">
                  Kalvix Nexus <br /> 
                  <span className="font-normal text-sm">led by Shourya Sharma</span>
                </p>
              </motion.div>

        </div>

      </div>
    </section>
  );
}
