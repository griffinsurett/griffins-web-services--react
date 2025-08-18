// src/Sections/TechStack.jsx
import React, { useRef, useEffect, useState } from "react";
import Heading from "../components/Heading";
import { useVisibility } from "../hooks/useVisibility";
import useEngagementAutoplay from "../hooks/useEngagementAutoplay";
import BorderTitle from "../components/BorderTitle";
import LabelIcon from "../components/LoopComponents/LabelIcon";
import {
  Code2,
  Palette,
  Layers,
  Zap,
  Globe,
  Database,
  PenTool,
  Frame,
  Triangle,
  Github,
  Sparkles,
  Blocks,
  Server,
  Cloud,
  GitBranch,
  Workflow,
} from "lucide-react";

const TechStack = () => {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [currentOffset, setCurrentOffset] = useState(0);
  
  // Mobile touch state
  const [activeMobileItem, setActiveMobileItem] = useState(null);
  const mobileTimeoutRef = useRef(null);

  // Check if section is in view
  const inView = useVisibility(containerRef, { threshold: 0.3 });

  const description = "From modern frameworks, CMS platforms, to a wide range of hosting platforms we build with the right tools for your project."

  // Technology stack with lucide-react icons
  const technologies = [
    {
      name: "Astro.js",
      icon: <Code2 className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "Next.js",
      icon: <Code2 className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "React",
      icon: <Sparkles className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "Gatsby",
      icon: <Layers className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "Svelte",
      icon: <Blocks className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "Shopify",
      icon: <Zap className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "WordPress",
      icon: <Globe className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "Elementor",
      icon: <Zap className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "Payload CMS",
      icon: <Database className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "Webflow",
      icon: <PenTool className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "Framer",
      icon: <Frame className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "Vercel",
      icon: <Triangle className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "GitHub",
      icon: <Github className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "Node.js",
      icon: <Server className="w-8 h-8 md:w-10 md:h-10" />,
    },
    {
      name: "AWS",
      icon: <Cloud className="w-8 h-8 md:w-10 md:h-10" />,
    },
  ];

  // Duplicate for infinite scroll
  const duplicatedTechnologies = [
    ...technologies,
    ...technologies,
    ...technologies,
  ];
  const itemWidth = 120; // Approximate width of each item including gap
  const totalWidth = technologies.length * itemWidth;

  // Mobile touch handlers
  const handleMobileTouch = (techName, index) => {
    // Clear any existing timeout
    if (mobileTimeoutRef.current) {
      clearTimeout(mobileTimeoutRef.current);
    }
    
    // Set active item
    setActiveMobileItem(`${techName}-${index}`);
    
    // Auto-hide after 2.5 seconds
    mobileTimeoutRef.current = setTimeout(() => {
      setActiveMobileItem(null);
    }, 2500);
  };

  const clearMobileActive = () => {
    if (mobileTimeoutRef.current) {
      clearTimeout(mobileTimeoutRef.current);
    }
    setActiveMobileItem(null);
  };

  // Use engagement autoplay hook
  const { isAutoplayPaused, userEngaged, engageUser, pause, resume } =
    useEngagementAutoplay({
      totalItems: technologies.length,
      currentIndex:
        Math.floor(Math.abs(currentOffset) / itemWidth) % technologies.length,
      setIndex: () => {}, // We handle animation differently
      autoplayTime: 50, // Very short for smooth animation
      resumeDelay: 3000,
      resumeTriggers: ["hover-away"],
      containerSelector: "[data-tech-carousel]",
      itemSelector: "[data-tech-item]",
      inView,
      pauseOnEngage: true,
      engageOnlyOnActiveItem: false,
    });

  // Animation loop
  useEffect(() => {
    if (!inView || isAutoplayPaused) return;

    let animationId;
    let lastTime = Date.now();
    const speed = 30; // pixels per second

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000; // Convert to seconds
      lastTime = now;

      setCurrentOffset((prev) => {
        let newOffset = prev - speed * deltaTime;
        // Reset when we've scrolled one full set
        if (Math.abs(newOffset) >= totalWidth) {
          newOffset = newOffset + totalWidth;
        }
        return newOffset;
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [inView, isAutoplayPaused, totalWidth]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (mobileTimeoutRef.current) {
        clearTimeout(mobileTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="outer-section bg-bg relative overflow-hidden"
      id="tech-stack"
    >
      {/* <div className="section-dim-border"></div> */}
      <div className="inner-section text-center lg:text-left">
        <BorderTitle>Our Tech Stack</BorderTitle>
        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_2fr] gap-4 lg:gap-12 items-center">
          {/* Left side - Text (full width on mobile) */}
          <div className="w-sm">
            <Heading
              tagName="h2"
              className="mb-6"
              before="We master "
              beforeClass="text-heading block lg:inline"
              text="the tools that matter."
              textClass="text-heading block lg:inline"
            />
            <p className="text-text text-lg hidden lg:block">
                        {description}
            </p>
          </div>

          {/* Right side - Carousel (full width on mobile) */}
          <div className="relative w-full">
            {/* Gradient masks for fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-bg to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-bg to-transparent z-10 pointer-events-none" />

            {/* Carousel container */}
            <div
              className="overflow-hidden"
              data-tech-carousel
              onMouseEnter={() => {
                engageUser();
                pause();
              }}
              onMouseLeave={() => {
                resume();
              }}
              // Clear mobile active state when touching outside
              onTouchStart={(e) => {
                if (e.target === e.currentTarget) {
                  clearMobileActive();
                }
              }}
            >
              <div
                ref={trackRef}
                className="flex items-center gap-6 md:gap-8 lg:gap-10"
                style={{
                  transform: `translateX(${currentOffset}px)`,
                  width: "max-content",
                }}
              >
                {duplicatedTechnologies.map((tech, index) => {
                  const itemKey = `${tech.name}-${index}`;
                  const isMobileActive = activeMobileItem === itemKey;
                  
                  return (
                    <LabelIcon
                      key={itemKey}
                      tech={tech}
                      index={index}
                      isActive={isMobileActive}
                      onTouch={handleMobileTouch}
                      onMouseEnter={engageUser}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile subtitle */}
        <p className="text-center text-text text-base lg:hidden">
          {description}
        </p>
      </div>
    </section>
  );
};

export default TechStack;