/**
 * Footer Component
 *
 * Footer for public pages with links, social media, and copyright.
 * Uses Modern Technical Editorial design system.
 */

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FOOTER_DATA } from "@/lib/constants";
import { useViewport } from "@/components/hooks/useViewport";

export function Footer() {
  const { isMobile } = useViewport();

  return (
    <footer className="bg-background border-t border-foreground/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-foreground">
                {FOOTER_DATA.brandName}
              </span>
              <span className="text-xs font-mono text-accent">BETA</span>
            </div>
            <p className="text-sm text-foreground-secondary leading-relaxed">
              Modern task management platform designed for clarity and productivity.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              {FOOTER_DATA.socialLinks.map((social, index) => (
                <motion.a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 rounded-md bg-surface border border-foreground/10 hover:border-accent hover:text-accent transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.3,
                    delay: 0.1 + (index * 0.05),
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  {/* Simple platform icons */}
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    {social.platform === "github" ? (
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    ) : social.platform === "linkedin" ? (
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    ) : social.platform === "x" ? (
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    ) : null}
                  </svg>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Link Groups */}
          {FOOTER_DATA.linkGroups.map((group, groupIndex) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.1 + (groupIndex * 0.1),
                ease: [0.22, 1, 0.36, 1]
              }}
              className="space-y-4"
            >
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.links.map((link, linkIndex) => (
                  <motion.li
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.3,
                      delay: 0.2 + (groupIndex * 0.1) + (linkIndex * 0.05),
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    <Link
                      href={link.href}
                      className="text-sm text-foreground-secondary hover:text-accent transition-colors relative group inline-block"
                    >
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Technical Divider */}
        <motion.div
          className="h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent mb-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm"
        >
          <p className="text-foreground-secondary">{FOOTER_DATA.copyright}</p>

          {/* Technical badge */}
          <div className="flex items-center gap-2 text-xs font-mono text-foreground/60">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span>Modern Technical Editorial</span>
            <span>•</span>
            <span>v1.0.0</span>
          </div>
        </motion.div>

        {/* Subtle background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
    </footer>
  );
}

/**
 * Footer Skeleton
 * Loading state for Footer component
 */
export function FooterSkeleton() {
  return (
    <footer className="bg-background border-t border-foreground/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="h-8 w-24 bg-structure/30 rounded animate-pulse" />
            <div className="h-4 w-full bg-structure/20 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-structure/20 rounded animate-pulse" />
            <div className="flex gap-2 pt-2">
              <div className="w-8 h-8 bg-structure/20 rounded animate-pulse" />
              <div className="w-8 h-8 bg-structure/20 rounded animate-pulse" />
              <div className="w-8 h-8 bg-structure/20 rounded animate-pulse" />
            </div>
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-20 bg-structure/30 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-16 bg-structure/20 rounded animate-pulse" />
                <div className="h-4 w-12 bg-structure/20 rounded animate-pulse" />
                <div className="h-4 w-14 bg-structure/20 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
        <div className="h-px bg-structure/20 mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="h-4 w-48 bg-structure/20 rounded animate-pulse" />
          <div className="h-4 w-36 bg-structure/20 rounded animate-pulse" />
        </div>
      </div>
    </footer>
  );
}