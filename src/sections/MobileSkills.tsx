"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { DOMAINS, NODES } from "@/lib/skills_data";
import { SKILL_DETAILS } from "@/lib/skill_details";

export function MobileSkills() {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const domains = DOMAINS.map((domain) => ({
    ...domain,
    skills: NODES.filter((node) => node.domainId === domain.id &&
      [node.label, domain.label, SKILL_DETAILS[node.id]?.title].some((value) => value?.toLowerCase().includes(query))),
  })).filter(({ skills }) => skills.length > 0);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8 lg:hidden">
      <h2 className="mb-5 text-sm font-mono uppercase tracking-widest text-text-muted">Skills landscape</h2>
      <label className="mb-6 flex items-center gap-3 border border-border bg-surface px-4 focus-within:border-text-muted">
        <Search aria-hidden="true" size={18} className="shrink-0 text-text-muted" />
        <span className="sr-only">Search skills</span>
        <input type="search" value={search} onChange={(event) => setSearch(event.target.value)}
          className="min-h-12 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-text-muted" placeholder="Search skills" />
      </label>
      <div className="divide-y divide-border border-y border-border">
        {domains.map(({ id, label, skills }) => (
          <details key={query ? `${id}-results` : id} open={query ? true : undefined} className="group/domain">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 text-base font-medium [&::-webkit-details-marker]:hidden">
              {label.split("// ")[1]}
              <ChevronDown aria-hidden="true" size={18} className="shrink-0 text-text-muted group-open/domain:rotate-180" />
            </summary>
            <ul className="mb-3 divide-y divide-border border border-border bg-surface px-4">
              {skills.map((skill) => {
                const detail = SKILL_DETAILS[skill.id];
                return (
                  <li key={skill.id}>
                    {detail ? (
                      <details className="group/skill">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 py-2 [&::-webkit-details-marker]:hidden">
                          {skill.label}
                          <ChevronDown aria-hidden="true" size={16} className="shrink-0 text-text-muted group-open/skill:rotate-180" />
                        </summary>
                        <div className="pb-4">
                          <p className="text-base leading-relaxed text-text-muted">{detail.description}</p>
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {detail.usedIn.map(({ label, href }) => (
                              <li key={label}>
                                {href ? <Link href={href} className="inline-flex min-h-11 items-center border border-border px-3 text-sm underline underline-offset-4">{label}</Link>
                                  : <span className="inline-flex min-h-11 items-center px-2 text-sm text-text-muted">{label}</span>}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </details>
                    ) : <span className="flex min-h-11 items-center py-2">{skill.label}</span>}
                  </li>
                );
              })}
            </ul>
          </details>
        ))}
        {domains.length === 0 && <p role="status" className="py-4 text-text-muted">No matching skills.</p>}
      </div>
    </div>
  );
}
