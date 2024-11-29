import { cn } from "../lib/utils";

export const Section: React.FC<{
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}> = ({ children, className, hover = true }) => {
  return (
    <div
      className={cn(
        "relative pl-2 border-l-4 border-ctp-surface0 py-2",
        hover &&
          "hover:border-ctp-blue hover:bg-ctp-surface0 hover:bg-opacity-50 transition-colors",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const NumberedSection: React.FC<{
  children: React.ReactNode;
  index: number;
  className?: string;
}> = ({ children, index, className }) => {
  return (
    <Section className={className}>
      <div className="absolute -left-4 -ml-4 text-ctp-overlay0 opacity-50 select-none invisible sm:visible">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="space-y-2">{children}</div>
    </Section>
  );
};

export const Tag: React.FC<{
  tag: string;
  handleTagClick?: (tag: string) => void;
}> = ({ tag, handleTagClick }) => {
  return (
    <button
      type="button"
      tabIndex={0}
      className="text-ctp-lavender hover:text-ctp-peach transition-colors"
      onClick={() => handleTagClick?.(tag)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleTagClick?.(tag);
        }
      }}
    >
      #{tag.toLowerCase().replace(" ", "-")}
    </button>
  );
};

export const Heading: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  return (
    <h1 className={cn("text-ctp-mauve text-xl font-bold mb-4", className)}>
      {text}
    </h1>
  );
};
