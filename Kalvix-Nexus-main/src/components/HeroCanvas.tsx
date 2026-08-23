"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const BusinessGrowthEngine = dynamic(
  () => import("./BusinessGrowthEngine"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] lg:h-[650px] rounded-[30px] bg-zinc-900 border border-[#D4AF37]/20 animate-pulse" />
    ),
  }
);
export default function HeroCanvas() {
  return (
    <section className="relative min-h-screen bg-black overflow-hidden pt-28 flex items-center">

      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-[#D4AF37]/10 blur-[140px] rounded-full -translate-x-1/2 -translate-y-1/2" />

        <div className="absolute top-20 right-10 w-[250px] h-[250px] bg-[#D4AF37]/10 blur-[100px] rounded-full" />

        <div className="absolute bottom-10 left-10 w-[250px] h-[250px] bg-[#D4AF37]/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT CONTENT */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >

            <p className="uppercase tracking-[0.35em] text-[#D4AF37] text-sm mb-6">
              Digital Innovation Agency
            </p>

            <h1 className="text-white text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Where Vision Meets
              <span className="block text-[#D4AF37]">
                Technology
              </span>
            </h1>

            <p className="text-zinc-400 text-lg mt-8 max-w-xl leading-relaxed">
              Kalvix Nexus helps businesses scale through
              AI solutions, automation systems, modern web
              platforms and digital growth strategies.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">

              <button className="bg-[#D4AF37] text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition">
                Start Your Project
              </button>

              <button className="border border-[#D4AF37] text-white px-8 py-4 rounded-full hover:bg-[#D4AF37]/10 transition">
                Explore Services
              </button>

            </div>

            <div className="grid grid-cols-2 gap-4 mt-12">

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-[#D4AF37] text-xl font-bold">
                  AI Solutions
                </h3>
                <p className="text-zinc-400 text-sm mt-2">
                  Intelligent business automation
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-[#D4AF37] text-xl font-bold">
                  Web Platforms
                </h3>
                <p className="text-zinc-400 text-sm mt-2">
                  High-performance digital experiences
                </p>
              </div>

            </div>

          </motion.div>

          {/* RIGHT VISUAL */}

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center"
          >

            {/* Main Orb */}

            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              className="relative w-[350px] h-[350px] lg:w-[500px] lg:h-[500px]"
            >

              <div className="absolute inset-0 rounded-full border border-[#D4AF37]/30" />

              <div className="absolute inset-8 rounded-full border border-[#D4AF37]/20" />

              <div className="absolute inset-16 rounded-full border border-[#D4AF37]/20" />

              <div className="absolute inset-24 rounded-full border border-[#D4AF37]/20" />

              <div className="absolute inset-[35%] rounded-full bg-[#D4AF37]/20 blur-3xl" />

            </motion.div>

            {/* Floating Cards */}

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="absolute top-10 left-0 bg-white rounded-2xl p-5 shadow-2xl"
            >
              <h3 className="text-black text-2xl font-bold">
                +247%
              </h3>
              <p className="text-gray-600 text-sm">
                Business Growth
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
              }}
              className="absolute bottom-10 right-0 bg-white rounded-2xl p-5 shadow-2xl"
            >
              <h3 className="text-black text-2xl font-bold">
                3.4x
              </h3>
              <p className="text-gray-600 text-sm">
                Lead Generation
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="absolute top-1/2 -right-2 bg-white rounded-2xl p-5 shadow-2xl"
            >
              <h3 className="text-black text-2xl font-bold">
                24/7
              </h3>
              <p className="text-gray-600 text-sm">
                Automation
              </p>
            </motion.div>

          </motion.div>

        </div>

      </div>

    </section>
  );
}
