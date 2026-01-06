/**
 * Features Section Component
 *
 * Displays three feature cards in a responsive grid.
 * Uses staggered animations on scroll into view.
 */

"use client";

import { motion } from "framer-motion";
import { FeatureCard, CardSkeleton } from "@/components/ui/FeatureCard";
import { FEATURE_DATA } from "@/lib/constants";
import { staggerContainer } from "@/lib/animations";
import { FeatureData } from "@/types/components";

interface FeaturesProps {
  title?: string;
  subtitle?: string;
  features?: readonly FeatureData[];
}

export function Features({
  title = "Core Features",
  subtitle = "Built for Focus",
  features = FEATURE_DATA,
}: FeaturesProps) {
  return (
    <section className="py-24 px-6 bg-surface" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-serif text-4xl md:text-5xl text-foreground mb-2"
          >
            {title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-mono text-sm uppercase tracking-widest text-foreground-secondary"
          >
            {subtitle}
          </motion.p>
        </div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" },
                },
              }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                benefits={feature.benefits}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Features Skeleton
 * Loading state for Features section
 */
export function FeaturesSkeleton() {
  return (
    <section className="py-24 px-6 bg-surface">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="h-10 bg-structure/30 rounded mx-auto mb-2 w-64 animate-pulse" />
          <div className="h-4 bg-structure/20 rounded mx-auto w-32 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Re-export FeatureCardSkeleton for convenience
export { CardSkeleton as FeatureCardSkeleton } from "@/components/ui/FeatureCard";