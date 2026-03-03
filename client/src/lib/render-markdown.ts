import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import yaml from "highlight.js/lib/languages/yaml";
import powershell from "highlight.js/lib/languages/powershell";
import sql from "highlight.js/lib/languages/sql";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import plaintext from "highlight.js/lib/languages/plaintext";
import "highlight.js/styles/atom-one-dark.css";

hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("shell", bash);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("powershell", powershell);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("plaintext", plaintext);
hljs.registerLanguage("text", plaintext);

export { hljs };

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

function parseTables(text: string): string {
  const lines = text.split("\n");
  const result: string[] = [];
  let i = 0;

  while (i < lines.length) {
    if (
      i + 1 < lines.length &&
      lines[i].trim().startsWith("|") &&
      lines[i].trim().endsWith("|") &&
      /^\|[\s\-:]+(\|[\s\-:]+)+\|$/.test(lines[i + 1].trim())
    ) {
      const headerCells = lines[i]
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      i += 2;

      const bodyRows: string[][] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        bodyRows.push(
          lines[i]
            .trim()
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim())
        );
        i++;
      }

      let table = `<table class="w-full border-collapse border border-zinc-700 my-4 text-sm">`;
      table += `<thead><tr class="bg-zinc-800/50">`;
      for (const cell of headerCells) {
        table += `<th class="border border-zinc-700 px-3 py-2 text-left text-zinc-300 font-semibold">${cell}</th>`;
      }
      table += `</tr></thead><tbody>`;
      for (const row of bodyRows) {
        table += `<tr class="border-b border-zinc-700/50 hover:bg-zinc-800/30">`;
        for (const cell of row) {
          table += `<td class="border border-zinc-700 px-3 py-2 text-zinc-400">${cell}</td>`;
        }
        table += `</tr>`;
      }
      table += `</tbody></table>`;
      result.push(table);
    } else {
      result.push(lines[i]);
      i++;
    }
  }

  return result.join("\n");
}

export function renderMarkdown(content: string): string {
  let text = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) => {
    const langClass = lang ? `hljs language-${lang}` : "hljs";
    const dataAttr = lang ? ` data-language="${lang}"` : "";
    return `<pre class="bg-zinc-900 border border-zinc-700 rounded-lg p-4 overflow-x-auto my-4"><code class="${langClass} text-sm font-mono"${dataAttr}>${code.trim()}</code></pre>`;
  });

  text = text.replace(
    /`([^`]+)`/g,
    '<code class="bg-zinc-800 text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
  );

  text = parseTables(text);

  text = text.replace(
    /^(?:&gt;) (.+)$/gm,
    '<blockquote class="border-l-4 border-orange-500 bg-zinc-800/50 pl-4 py-2 my-3 italic text-zinc-300">$1</blockquote>'
  );

  text = text.replace(
    /^---$/gm,
    '<hr class="border-zinc-700 my-6" />'
  );
  text = text.replace(
    /^\*\*\*$/gm,
    '<hr class="border-zinc-700 my-6" />'
  );

  const slugCounts: Record<string, number> = {};
  const uniqueSlug = (text: string) => {
    let slug = generateSlug(text);
    if (slugCounts[slug] !== undefined) {
      slugCounts[slug]++;
      slug = `${slug}-${slugCounts[slug]}`;
    } else {
      slugCounts[slug] = 0;
    }
    return slug;
  };

  text = text
    .replace(
      /^### (.+)$/gm,
      (_m: string, t: string) => `<h3 id="${uniqueSlug(t)}" class="text-lg font-bold text-white mt-6 mb-2">${t}</h3>`
    )
    .replace(
      /^## (.+)$/gm,
      (_m: string, t: string) => `<h2 id="${uniqueSlug(t)}" class="text-xl font-bold text-white mt-8 mb-3">${t}</h2>`
    )
    .replace(
      /^# (.+)$/gm,
      (_m: string, t: string) => `<h1 id="${uniqueSlug(t)}" class="text-2xl font-bold text-white mt-8 mb-4">${t}</h1>`
    );

  text = text.replace(
    /\*\*(.+?)\*\*/g,
    '<strong class="text-white font-semibold">$1</strong>'
  );
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  text = text.replace(/~~(.+?)~~/g, '<del class="text-zinc-500">$1</del>');

  text = text.replace(
    /^\- (.+)$/gm,
    '<li class="ml-4 text-zinc-300">• $1</li>'
  );
  text = text.replace(
    /^\d+\. (.+)$/gm,
    '<li class="ml-4 text-zinc-300">$1</li>'
  );

  text = text.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_m: string, alt: string, url: string) => {
      const safeUrl = /^https?:\/\//i.test(url) ? url : "";
      if (!safeUrl) return "";
      return `<img src="${safeUrl}" alt="${alt}" class="max-w-full rounded-lg my-4 border border-zinc-700" />`;
    }
  );

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, linkText, url) => {
    const safeUrl = /^https?:\/\//i.test(url) ? url : "#";
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-orange-400 hover:text-orange-300 underline">${linkText}</a>`;
  });

  text = text.replace(
    /^(?!<[hpuol]|<li|<pre|<code|<a|<strong|<em|<block|<hr|<table|<img|<del)(.*\S.*)$/gm,
    '<p class="text-zinc-300 leading-relaxed mb-3">$1</p>'
  );

  return text;
}

export function highlightCodeBlocks(containerRef?: React.RefObject<HTMLElement | null>) {
  const root = containerRef?.current || document;
  const blocks = root.querySelectorAll("pre > code[class*='hljs']");
  blocks.forEach((block) => {
    if (!(block as HTMLElement).dataset.highlighted) {
      hljs.highlightElement(block as HTMLElement);
    }
  });
}
