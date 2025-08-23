// src/Sections/TechStack.jsx
import React, { useState, useRef, useEffect } from "react";
import Heading from "../components/Heading";
import BorderTitle from "../components/BorderTitle";
import LabelIcon from "../components/LoopComponents/LabelIcon";
import AnimatedElementWrapper from "../components/AnimatedElementWrapper";
import SmoothScrollCarousel from "../components/Carousels/SmoothScrollCarousel";
import { useHoverInteraction } from "../hooks/animations/useInteractions";
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

  // Hovered tech label to show in overlay
  const [hoveredTech, setHoveredTech] = useState(null);

  const description =
    "From modern frameworks, CMS platforms, to a wide range of hosting platforms we build with the right tools for your project.";

  const technologies = [
    { name: "Astro.js", icon: <Code2 className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "Next.js", icon: <Code2 className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "React", icon: <Sparkles className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "Gatsby", icon: <Layers className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "Svelte", icon: <Blocks className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "Shopify", icon: <Zap className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "WordPress", icon: <Globe className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "Elementor", icon: <Zap className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "Payload CMS", icon: <Database className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "Webflow", icon: <PenTool className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "Framer", icon: <Frame className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "Vercel", icon: <Triangle className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "GitHub", icon: <Github className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "Node.js", icon: <Server className="w-8 h-8 md:w-10 md:h-10" /> },
    { name: "AWS", icon: <Cloud className="w-8 h-8 md:w-10 md:h-10" /> },
  ];

  const DEFAULT_BEFORE = "We've mastered ";
  const DEFAULT_HEADING_TEXT = "the tools that matter.";

  // Strict hover behavior: change on enter, clear on leave
  const { handleMouseEnter, handleMouseLeave } = useHoverInteraction({
    hoverDelay: 0,
    onHoverStart: (el) => {
      const name = el?.dataset?.techName || null;
      setHoveredTech(name);
    },
    onHoverEnd: () => {
      setHoveredTech(null);
    },
  });

  // Mobile touch: show label for 2.5s
  const handleMobileTouch = (techName, index) => {
    if (mobileTimeoutRef.current) clearTimeout(mobileTimeoutRef.current);
    setActiveMobileItem(`${techName}-${index}`);
    setHoveredTech(techName);

    mobileTimeoutRef.current = setTimeout(() => {
      setActiveMobileItem(null);
      setHoveredTech(null);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (mobileTimeoutRef.current) clearTimeout(mobileTimeoutRef.current);
    };
  }, []);

  return (
    <section className="outer-section bg-bg relative overflow-hidden" id="tech-stack">
      <div className="inner-section text-center lg:text-left">
        <BorderTitle>Our Tech Stack</BorderTitle>

        <div className="flex flex-col lg:grid lg:grid-cols-[1fr_2fr] gap-4 lg:gap-12 items-center">
          {/* Left side - Text content */}
          <div className="w-sm">
            <div className="relative inline-block mb-6 leading-tight">
              {/* Base heading IN FLOW — never changes. Locks layout height. */}
              <Heading
                tagName="h2"
                before={DEFAULT_BEFORE}
                beforeClass="text-heading block lg:inline"
                text={DEFAULT_HEADING_TEXT}
                textClass={`text-heading block lg:inline transition-opacity duration-150 ${hoveredTech ? "opacity-0" : "opacity-100"}`}
              />

              {/* Overlay heading — absolute; fades in/out; no layout impact */}
              <div className={`absolute inset-0 transition-opacity duration-150 ${hoveredTech ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                <Heading
                  tagName="h2"
                  before={DEFAULT_BEFORE}
                  beforeClass="text-heading block lg:inline"
                  text={hoveredTech || ""}
                  textClass="text-heading block lg:inline"
                />
              </div>
            </div>
          </div>

          {/* Right side - Smooth Scroll Carousel */}
          <SmoothScrollCarousel
            items={technologies}
            renderItem={(tech, index) => {
              const itemKey = `${tech.name}-${index}`;
              const isMobileActive = activeMobileItem === itemKey;

              return (
                <AnimatedElementWrapper
                  variant="fade-in"
                  animationDuration={600}
                  animationDelay={300}
                  threshold={0.2}
                  rootMargin="0px 0px -50px 0px"
                  once={false}
                >
                  <LabelIcon
                    tech={tech}
                    index={index}
                    isActive={isMobileActive}
                    onTouch={handleMobileTouch}
                    // pass element to hook so it can read dataset.techName
                    onHoverStart={(el) => handleMouseEnter(el, index)}
                    onHoverEnd={(el) => handleMouseLeave(el, index)}
                    showName={false}
                  />
                </AnimatedElementWrapper>
              );
            }}
            speed={30}
            gap={32}
            itemWidth={120}
            autoplay={true}
            pauseOnHover={true}
            pauseOnEngage={true}
            gradientMask={true}
            gradientWidth={{ base: 48, md: 80 }}
            className="relative w-full h-[84px] md:h-[96px]" // reserves carousel lane height
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
