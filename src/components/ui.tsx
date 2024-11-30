import {
  Check,
  Copy,
  ExternalLink,
  Github,
  Globe,
  Linkedin,
  Mail,
} from "lucide-react";

import { useState } from "react";
import XLogo from "../assets/x-logo.svg?react";
import type { Profile } from "../lib/types";
import { cn } from "../lib/utils";

interface IconWrapperProps {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  size?: number;
  className?: string;
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  icon: Icon,
  size = 24,
  className,
}) => {
  return (
    <Icon
      className={cn("fill-current text-inherit", className)}
      style={{ width: size, height: size }}
    />
  );
};

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

export const SocialLinks: React.FC<{
  links: Profile["links"];
  size?: number;
  useIcons?: boolean;
  color?: string;
  hoverColor?: string;
}> = ({
  links,
  size = 24,
  useIcons = true,
  color = "overlay0",
  hoverColor = "pink",
}) => {
  const iconMap = {
    github: Github,
    x_dot_com: XLogo,
    linkedin: Linkedin,
    email: Mail,
    website: Globe,
  } as const;

  return (
    <>
      {Object.entries(links).map(([key, url]) => {
        const IconComponent =
          iconMap[key as keyof typeof iconMap] || ExternalLink;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              `text-ctp-${color} hover:text-ctp-${hoverColor} underline transition-colors`,
              useIcons && "flex items-center",
            )}
          >
            {useIcons ? (
              key === "x_dot_com" ? (
                <IconWrapper icon={IconComponent} size={size} />
              ) : key === "myanimelist" ? null : (
                <IconComponent size={size} />
              )
            ) : (
              <span>{key}</span>
            )}
          </a>
        );
      })}
    </>
  );
};

export const Tooltip: React.FC<{
  children: React.ReactNode;
  tooltip: string;
  className?: string;
}> = ({ children, tooltip, className }) => {
  return (
    <div className={cn("relative group", className)}>
      {children}
      <span
        className={cn(
          "bg-ctp-surface0 text-ctp-text text-xs",
          "absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1",
          "rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity",
        )}
      >
        {tooltip}
      </span>
    </div>
  );
};

export const TooltipButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  className?: string;
}> = ({ children, onClick, tooltip, className }) => {
  return (
    <Tooltip tooltip={tooltip}>
      <button
        type="button"
        onClick={onClick}
        className={cn("transition-all duration-100 border-none", className)}
      >
        {children}
      </button>
    </Tooltip>
  );
};

export const BadgeColor = {
  Teal: "teal",
  Lavender: "lavender",
  Green: "green",
  Red: "red",
  Peach: "peach",
} as const;

export const Badge: React.FC<{
  children: React.ReactNode;
  color?: (typeof BadgeColor)[keyof typeof BadgeColor];
  className?: string;
}> = ({ children, color = BadgeColor.Peach, className }) => {
  const colorClasses = {
    [BadgeColor.Teal]: "bg-ctp-teal/10 text-ctp-teal",
    [BadgeColor.Green]: "bg-ctp-green/10 text-ctp-green",
    [BadgeColor.Red]: "bg-ctp-red/10 text-ctp-red",
    [BadgeColor.Peach]: "bg-ctp-peach/10 text-ctp-peach",
    [BadgeColor.Lavender]: "bg-ctp-lavender/10 text-ctp-lavender",
  } as const;

  return (
    <span
      className={cn(
        "px-2 py-0.5 text-center text-xs leading-normal rounded inline-flex items-center",
        colorClasses[color],
        className,
      )}
    >
      {children}
    </span>
  );
};

export const CopyButton: React.FC<{
  text: string;
  tooltip: string;
  size?: number;
  color?: string;
}> = ({ text, tooltip, size = 4, color = "blue" }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const iconSize = `w-${size} h-${size}`;
  const iconColor = isCopied ? "text-ctp-green" : `text-ctp-${color}`;

  return (
    <TooltipButton tooltip={tooltip} onClick={handleCopy} className={iconColor}>
      {isCopied ? (
        <Check className={iconSize} />
      ) : (
        <Copy className={iconSize} />
      )}
    </TooltipButton>
  );
};
