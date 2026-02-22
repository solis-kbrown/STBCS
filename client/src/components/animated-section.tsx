import { useInView } from "@/hooks/use-in-view";

interface AnimatedSectionProps {
  children: React.ReactNode;
  animation?: "fade-up" | "fade-down" | "fade-left" | "fade-right" | "scale";
  stagger?: number;
  className?: string;
  as?: "div" | "section" | "article";
}

export default function AnimatedSection({
  children,
  animation = "fade-up",
  stagger,
  className = "",
  as: Tag = "div",
}: AnimatedSectionProps) {
  const { ref, isInView } = useInView();

  const animClass = `anim-${animation}`;
  const staggerClass = stagger ? `stagger-${stagger}` : "";
  const viewClass = isInView ? "in-view" : "";

  return (
    <Tag
      ref={ref}
      className={`${animClass} ${staggerClass} ${viewClass} ${className}`}
    >
      {children}
    </Tag>
  );
}

export function AnimatedList({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, isInView } = useInView();

  return (
    <div
      ref={ref}
      className={`list-cascade ${isInView ? "in-view" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
