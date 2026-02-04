/**
 * Hero Section Component
 *
 * Landing page hero with headline, accent text, description, and CTAs.
 * Uses Modern Technical Editorial design with staggered animations.
 */

"use client";

import { motion } from "framer-motion";
import { HERO_CONTENT } from "@/lib/constants";
import { useViewport } from "@/components/hooks/useViewport";
import { staggerContainer, fadeInUp } from "@/lib/animations";

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: string;
  secondaryCTA?: string;
}

export function Hero({
  title = HERO_CONTENT.headline,
  subtitle = HERO_CONTENT.accentText,
  description = HERO_CONTENT.description,
  primaryCTA = HERO_CONTENT.primaryCTA,
  secondaryCTA = HERO_CONTENT.secondaryCTA,
}: HeroProps) {
  const { isMobile } = useViewport();

  return (
    <section className="relative py-24 px-6 bg-background overflow-hidden" id="hero">
      {/* Background decorative elements */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-accent opacity-20"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content - Text */}
          <motion.div variants={fadeInUp} className="space-y-8 text-center lg:text-left">
            {/* Headline with accent */}
            <div className="space-y-2">
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                {title}
              </h1>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-accent leading-tight">
                {subtitle}
              </h2>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-foreground-secondary leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              {description}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.a
                href="/signup"
                className="px-8 py-4 bg-accent text-white rounded-lg font-medium text-lg hover:bg-[#ff856a] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {primaryCTA}
              </motion.a>
              <motion.a
                href="https://github.com/bilalinit/evolution-of-todo"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border-2 border-foreground/20 bg-transparent text-foreground rounded-lg font-medium text-lg hover:border-accent hover:text-accent transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                {secondaryCTA}
              </motion.a>
            </motion.div>

            {/* Technical indicator line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-px bg-foreground/10 mt-6"
            />
          </motion.div>

          {/* Right Content - Visual/Technical */}
          <motion.div
            variants={fadeInUp}
            className="relative lg:pl-8"
          >
            {/* Technical card */}
            <div className="bg-surface border border-foreground/10 rounded-xl p-6 md:p-8 backdrop-blur-sm">
              <div className="space-y-6">
                {/* Tech stack indicators */}
                <div className="flex flex-wrap gap-3">
                  {["Next.js", "Neon DB", "Better Auth", "Fast API"].map((tech, index) => (
                    <motion.span
                      key={tech}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 0.6 + (index * 0.1),
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="px-3 py-1 text-xs font-mono bg-background border border-foreground/10 rounded-full text-foreground-secondary hover:border-accent hover:text-accent transition-colors"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>

                {/* Feature bullets */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="space-y-3"
                >
                  {[
                    "Modern Technical Editorial design",
                    "High-performance FastAPI Backend",
                    "Serverless Neon Database",
                    "Secure Better Auth Integration"
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        duration: 0.4,
                        delay: 1.1 + (index * 0.1),
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className="flex items-center gap-3 text-sm text-foreground-secondary"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {feature}
                    </motion.div>
                  ))}
                </motion.div>

                {/* Technical line animation */}
                <motion.div
                  className="h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent overflow-hidden"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.5, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.div
                    className="h-full bg-accent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      duration: 2,
                      delay: 2,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Floating accent dots */}
            <motion.div
              className="absolute -top-4 -right-4 w-2 h-2 bg-accent rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-8 -left-4 w-2 h-2 bg-foreground/30 rounded-full"
              animate={{
                y: [0, 8, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient line */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 2.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </section>
  );
}

/**
 * Hero Skeleton
 * Loading state for Hero section
 */
export function HeroSkeleton() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="h-12 md:h-16 bg-structure/30 rounded animate-pulse w-3/4" />
            <div className="h-10 md:h-14 bg-structure/20 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-structure/20 rounded animate-pulse w-full" />
            <div className="h-4 bg-structure/20 rounded animate-pulse w-5/6" />
            <div className="flex gap-4 pt-4">
              <div className="h-12 bg-structure/30 rounded w-32 animate-pulse" />
              <div className="h-12 bg-structure/20 rounded w-32 animate-pulse" />
            </div>
          </div>
          <div className="bg-surface border border-structure/30 rounded-xl p-8 h-64 animate-pulse" />
        </div>
      </div>
    </section>
  );
}