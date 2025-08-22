// src/Sections/TechStack.jsx
import React, { useState, useRef, useEffect } from "react";
import Heading from "../components/Heading";
import BorderTitle from "../components/BorderTitle";
import LabelIcon from "../components/LoopComponents/LabelIcon";
import AnimatedElementWrapper from "../components/AnimatedElementWrapper";
import SmoothScrollCarousel from "../components/SmoothScrollCarousel";
import {
  Code2,
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
} from "lucide-react";

const TechStack = () => {
  // Mobile touch state for LabelIcon interactions
  const [activeMobileItem, setActiveMobileItem] = useState(null);
  const mobileTimeoutRef = useRef(null);

  const description =
    "From modern frameworks, CMS platforms, to a wide range of hosting platforms we build with the right tools for your project.";

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

  // Mobile touch handlers for LabelIcon
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

  // Handle carousel item interactions
  const handleItemInteraction = (item, index, type) => {
    if (type === "touch") {
      handleMobileTouch(item.name, index);
    }
  };

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
      className="outer-section bg-bg relative overflow-hidden"
      id="tech-stack"
    >
      <div className="inner-section text-center lg:text-left">
        <BorderTitle>Our Tech Stack</BorderTitle>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_2fr] gap-4 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="w-sm">
            <Heading
              tagName="h2"
              className="mb-6"
              before="We master "
              beforeClass="text-heading block lg:inline"
              text="the tools that matter."
              textClass="text-heading block lg:inline"
            />
            <p className="text-text text-lg hidden lg:block">{description}</p>
          </div>

            {/* Right side - Smooth Scroll Carousel */}
            <SmoothScrollCarousel
              items={technologies}
              renderItem={(tech, index, { onInteraction }) => {
                const itemKey = `${tech.name}-${index}`;
                const isMobileActive = activeMobileItem === itemKey;

                return (
                       <AnimatedElementWrapper
            variant="fade-in"
            animationDuration={600}
            animationDelay={300} // ⬅️ same stagger you had
            threshold={0.2}
            rootMargin="0px 0px -50px 0px" // early trigger
            once={false}
          >
                  <LabelIcon
                    tech={tech}
                    index={index}
                    isActive={isMobileActive}
                    onTouch={handleMobileTouch}
                    onMouseEnter={() => onInteraction?.("hover")}
                  />
                  </AnimatedElementWrapper>
                );
              }}
              
              speed={30}
              gap={32} // Matches gap-8 (32px) to gap-10 (40px) from original
              itemWidth={120}
              autoplay={true}
              pauseOnHover={true}
              pauseOnEngage={true}
              gradientMask={true}
              gradientWidth={{ base: 48, md: 80 }} // w-12 md:w-20 converted to px
              onItemInteraction={handleItemInteraction}
              className="relative w-full"
            />
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
