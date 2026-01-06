"use client";

import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, lineDraw } from "@/lib/animations";

export function CTA() {
    return (
        <section className="relative py-32 px-6 bg-background overflow-hidden" id="cta">
            {/* Technical Background Elements - Modern Technical Editorial Style */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top technical line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
                />
                {/* Bottom technical line */}
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent"
                />
                {/* Decorative vertical lines */}
                <div className="absolute inset-y-0 left-[15%] w-px bg-foreground/5" />
                <div className="absolute inset-y-0 right-[15%] w-px bg-foreground/5" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center space-y-12"
                >
                    {/* Main Content Block */}
                    <div className="space-y-8">
                        {/* Technical Label */}
                        <motion.div
                            variants={fadeInUp}
                            className="inline-block px-4 py-2 bg-surface border border-foreground/10 rounded-full"
                        >
                            <span className="font-mono text-xs uppercase tracking-widest text-foreground-secondary">
                                Call To Action
                            </span>
                        </motion.div>

                        {/* Main Headline with Wireframe Style */}
                        <motion.h2
                            variants={fadeInUp}
                            className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]"
                        >
                            Ready to boost your{" "}
                            <span className="text-accent relative inline-block">
                                productivity?
                                {/* Underline animation */}
                                <motion.span
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="absolute -bottom-2 left-0 w-full h-1 bg-accent origin-left"
                                />
                            </span>
                        </motion.h2>

                        {/* Supporting Text */}
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-foreground-secondary max-w-2xl mx-auto leading-relaxed font-sans"
                        >
                            Join a few users who have transformed their task management
                            with PlanStack. Experience the difference today.
                        </motion.p>
                    </div>

                    {/* Technical Connection Line */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex items-center justify-center gap-4 py-4"
                    >
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                        <div className="w-2 h-2 bg-accent rounded-full" />
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />
                    </motion.div>

                    {/* Action Buttons with Technical Styling */}
                    <motion.div
                        variants={fadeInUp}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        {/* Primary CTA - Technical Pill Style */}
                        <motion.a
                            href="/signup"
                            whileHover={{
                                scale: 1.02,
                                y: -1,
                                transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                            }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 bg-accent text-white rounded-lg font-medium text-lg hover:bg-[#ff856a] transition-all duration-300 shadow-lg shadow-accent/20 font-sans relative overflow-hidden group"
                        >
                            <span className="relative z-10">{/* Start Free Trial */}</span>
                            Get Started
                            {/* Hover overlay */}
                            <motion.div
                                className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                whileHover={{ opacity: 1 }}
                            />
                        </motion.a>

                        {/* Secondary CTA - Technical Outline Style */}
                        <motion.a
                            href="/login"
                            whileHover={{
                                scale: 1.02,
                                y: -1,
                                transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
                            }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 border border-foreground/20 bg-transparent text-foreground rounded-lg font-medium text-lg hover:border-accent hover:text-accent transition-all duration-300 font-sans relative group"
                        >
                            <span className="relative z-10">Sign In</span>
                            {/* Technical border effect on hover */}
                            <motion.div
                                className="absolute inset-0 border-2 border-accent opacity-0 rounded-lg group-hover:opacity-100 transition-opacity duration-300"
                                whileHover={{ opacity: 1 }}
                            />
                        </motion.a>
                    </motion.div>
                </motion.div>
            </div>

            {/* Floating Accent Elements - Subtle Technical Details */}
            <motion.div
                className="absolute top-12 left-8 w-1.5 h-1.5 bg-accent rounded-full"
                animate={{
                    y: [0, -6, 0],
                    opacity: [0.6, 1, 0.6],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-16 right-8 w-1.5 h-1.5 bg-foreground/30 rounded-full"
                animate={{
                    y: [0, 6, 0],
                    opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
        </section>
    );
}
