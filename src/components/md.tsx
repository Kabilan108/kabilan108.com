import { Terminal } from "lucide-react";
import type { FC, HTMLProps, OlHTMLAttributes } from "react";
import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import SyntaxHighlighter from "react-syntax-highlighter";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { cn } from "../lib/utils";
import catppuccin from "./catppuccin";
import { CopyButton } from "./ui";
import { Section } from "./ui";

type ComponentProps<T> = HTMLProps<T> & {
  className?: string;
};

const Heading: FC<{
  children: React.ReactNode;
  level: number;
  color?: string;
  font?: string;
}> = ({ level, color = "text-ctp-lavender", font = "text-2xl", children }) => {
  return (
    <p className={cn("heading", color, font)}>
      {`${"#".repeat(level)} ${children}`}
    </p>
  );
};

const CodeBlock: Components["pre"] = ({ className, ...props }) => {
  const child = props.children as React.ReactElement;
  const code = child?.props?.children.trim();
  const language = child?.props?.className?.replace("language-", "");

  return (
    <Section className={cn("pl-6 pr-4", className)}>
      <div className="rounded-lg overflow-hidden">
        <div className="flex items-center justify-between bg-ctp-crust px-4 pt-1">
          <div className="flex items-center gap-2 text-sm text-ctp-subtext0">
            <Terminal className="w-4 h-4" />
            {language}
          </div>
          <CopyButton text={code} tooltip="Copy code" color="subtext0" />
        </div>
        <div className="text-sm">
          <SyntaxHighlighter
            language={language}
            style={catppuccin as { [key: string]: React.CSSProperties }}
            customStyle={{
              padding: "1rem",
              maxHeight: "400px",
              overflowY: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "rgb(var(--ctp-surface0)) rgb(var(--ctp-base))",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>
    </Section>
  );
};

const components = {
  h1: ({ children, ...props }: ComponentProps<HTMLHeadingElement>) => (
    <Heading level={1} font="hidden" {...props}>
      {children}
    </Heading>
  ),
  h2: ({ children, ...props }: ComponentProps<HTMLHeadingElement>) => (
    <Heading
      level={2}
      color="text-ctp-green"
      font="text-2xl font-semibold mb-2"
      {...props}
    >
      {children}
    </Heading>
  ),
  h3: ({ children, ...props }: ComponentProps<HTMLHeadingElement>) => (
    <Heading
      level={3}
      color="text-ctp-blue"
      font="text-xl font-semibold mb-2"
      {...props}
    >
      {children}
    </Heading>
  ),
  h4: ({ children, ...props }: ComponentProps<HTMLHeadingElement>) => (
    <Heading
      level={4}
      color="text-ctp-sapphire"
      font="text-lg font-semibold mb-0"
      {...props}
    >
      {children}
    </Heading>
  ),
  h5: ({ children, ...props }: ComponentProps<HTMLHeadingElement>) => (
    <Heading
      level={5}
      color="text-ctp-teal"
      font="text-base font-semibold mb-0"
      {...props}
    >
      {children}
    </Heading>
  ),
  p: ({ className, ...props }: ComponentProps<HTMLParagraphElement>) => (
    <p className={cn("text-ctp-text", className)} {...props} />
  ),
  blockquote: ({
    className,
    children,
    ...props
  }: ComponentProps<HTMLQuoteElement>) => (
    <blockquote className={className} {...props}>
      {children}
    </blockquote>
  ),
  a: ({ className, ...props }: ComponentProps<HTMLAnchorElement>) => (
    <a
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...props}
    />
  ),
  ul: ({ className, ...props }: ComponentProps<HTMLUListElement>) => (
    <ul
      className={cn("list-disc list-outside pl-4 my-0", className)}
      {...props}
    />
  ),
  ol: ({
    className,
    ...props
  }: { className?: string } & OlHTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn("list-decimal list-outside pl-8 my-0", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentProps<HTMLLIElement>) => (
    <li className={cn("text-ctp-text", className)} {...props} />
  ),
  code: ({ className, ...props }: ComponentProps<HTMLElement>) => (
    <code className={className} {...props} />
  ),
  pre: CodeBlock,
  img: ({ className, ...props }: ComponentProps<HTMLImageElement>) => {
    const src = props.src as string;
    if (src.match(/\/public\/img\/.*/)) {
      props.src = src.replace(/.*\/public/, "");
    }
    return <img className={className} {...props} alt={props.alt || ""} />;
  },
};

export const MD: FC<{ content: string; className?: string }> = ({
  content,
  className = "",
}) => {
  return (
    <div className={cn("prose prose-invert max-w-none markdown", className)}>
      <Markdown
        components={components}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { displayMode: true, fleqn: true }]]}
      >
        {content}
      </Markdown>
    </div>
  );
};
