import type { FC, HTMLProps, OlHTMLAttributes } from "react";
import Markdown from "react-markdown";
import { cn } from "../lib/utils";
import { Section } from "./ui";

type ComponentProps<T> = HTMLProps<T> & {
  className?: string;
};

const components = {
  h1: ({ className, ...props }: ComponentProps<HTMLHeadingElement>) => (
    <h1
      className={cn("text-3xl font-bold text-ctp-mauve my-6", className)}
      {...props}
    />
  ),
  h2: ({ className, ...props }: ComponentProps<HTMLHeadingElement>) => (
    <h2
      className={cn("text-2xl font-semibold text-ctp-mauve my-5", className)}
      {...props}
    />
  ),
  h3: ({ className, ...props }: ComponentProps<HTMLHeadingElement>) => (
    <h3
      className={cn("text-xl font-semibold text-ctp-mauve my-4", className)}
      {...props}
    />
  ),
  p: ({ className, ...props }: ComponentProps<HTMLParagraphElement>) => (
    <p
      className={cn("my-4 leading-relaxed text-ctp-text", className)}
      {...props}
    />
  ),
  a: ({ className, ...props }: ComponentProps<HTMLAnchorElement>) => (
    <a
      className={cn(
        "text-ctp-blue hover:text-ctp-sapphire underline",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: ComponentProps<HTMLUListElement>) => (
    <ul
      className={cn("list-disc list-inside my-4 space-y-2", className)}
      {...props}
    />
  ),
  ol: ({
    className,
    ...props
  }: { className?: string } & OlHTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn("list-decimal list-inside my-4 space-y-2", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentProps<HTMLLIElement>) => (
    <li className={cn("text-ctp-text", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentProps<HTMLQuoteElement>) => (
    <Section>
      <blockquote
        className={cn("italic text-ctp-overlay0", className)}
        {...props}
      />
    </Section>
  ),
  code: ({ className, ...props }: ComponentProps<HTMLElement>) => (
    <code
      className={cn(
        "bg-ctp-surface0 rounded px-1 py-0.5 text-ctp-pink",
        className,
      )}
      {...props}
    />
  ),
  pre: ({ className, ...props }: ComponentProps<HTMLPreElement>) => (
    <Section>
      <pre
        className={cn("bg-ctp-surface0 rounded p-4 overflow-x-auto", className)}
        {...props}
      />
    </Section>
  ),
};

export const MD: FC<{ content: string; className?: string }> = ({
  content,
  className = "",
}) => {
  console.log(`html: ${content}`);
  return (
    <Markdown
      components={components}
      className={cn("prose prose-invert max-w-none", className)}
    >
      {content}
    </Markdown>
  );
};
