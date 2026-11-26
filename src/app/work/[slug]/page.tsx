import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, MoveLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { PROJECT_ASSETS } from "@/lib/assets";
import { projects } from "@/lib/profile";
import { ImdPuneCaseStudy } from "@/sections/work/ImdPuneCaseStudy";
import { SwaNeetiCaseStudy } from "@/sections/work/SwaNeetiCaseStudy";
import { WindyCaseStudy } from "@/sections/work/WindyCaseStudy";
import { SpenzaCaseStudy } from "@/sections/work/SpenzaCaseStudy";

export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const project = projects.find(p => p.slug === slug);
  if (!project) {
    notFound();
  }
  
  if (slug === 'imdpune') {
    return <ImdPuneCaseStudy />;
  }
  
  if (slug === 'swaneeti') {
    return <SwaNeetiCaseStudy />;
  }
  
  if (slug === 'windy') {
    return <WindyCaseStudy />;
  }
  
  if (slug === 'spenza') {
    return <SpenzaCaseStudy />;
  }
  
  const assets = PROJECT_ASSETS[slug];

  return (
    <main className="case-page min-h-screen bg-background pt-12 lg:pt-32 pb-24 selection:bg-accent-soft selection:text-accent">
      <div className="mobile-gutter container mx-auto lg:px-12 max-w-4xl">
        
        <Link href="/#work" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-mono text-sm tracking-widest uppercase mb-16 group transition-colors">
          <MoveLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Work
        </Link>

        {/* Hero */}
        <div className="mb-24">
          
          <div className="font-mono text-accent text-sm mb-4 tracking-widest">{project.category} {"//"} {project.year} {"//"} {project.status}</div>
          <h1 className="text-5xl md:text-7xl font-display font-medium mb-8 uppercase tracking-tighter">{project.title}</h1>
          <p className="text-xl md:text-2xl text-text-muted font-light leading-relaxed mb-12">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-4 font-mono text-sm">
            {project.github ? (
              <a href={project.github} target="_blank" rel="noopener noreferrer" className="portfolio-text-link">
                <span className="portfolio-link-label">[GITHUB] View Source</span><ArrowUpRight className="portfolio-link-arrow" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Visual Header Placeholder */}
        {assets?.hero ? (
          <div className="w-full aspect-video mb-24 border border-border overflow-hidden relative">
            <Image 
              src={assets.hero} 
              alt={`${project.title} Hero`} 
              fill 
              className="object-cover" 
            />
          </div>
        ) : (
          <div className="w-full aspect-video bg-surface-elevated border border-border mb-24 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a), linear-gradient(45deg, #1a1a1a 25%, transparent 25%, transparent 75%, #1a1a1a 75%, #1a1a1a)", backgroundSize: "20px 20px", backgroundPosition: "0 0, 10px 10px" }} />
             <span className="font-mono text-text-muted tracking-widest z-10">[ SYSTEM VISUALIZATION ]</span>
          </div>
        )}

        {/* Content Structure */}
        <div className="space-y-24">
          
          {project.problem && (
            <section>
              <h2 className="text-sm font-mono text-text-muted mb-6 tracking-widest uppercase border-b border-border pb-4">The Problem</h2>
              <div className="prose prose-invert prose-p:text-text-primary prose-p:leading-relaxed prose-p:font-light">
                {project.problem.split('\n\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
            </section>
          )}

          
          {project.idea && (
            <section>
              <h2 className="text-sm font-mono text-text-muted mb-6 tracking-widest uppercase border-b border-border pb-4">The Idea</h2>
              <div className="prose prose-invert prose-p:text-text-primary prose-p:leading-relaxed prose-p:font-light">
                {project.idea.split('\n\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-sm font-mono text-text-muted mb-6 tracking-widest uppercase border-b border-border pb-4">System Architecture</h2>
            {assets?.diagram ? (
              <div className="w-full mb-8 relative aspect-video">
                <Image 
                  src={assets.diagram} 
                  alt={`${project.title} Architecture Diagram`} 
                  fill 
                  className="object-contain drop-shadow-2xl" 
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-surface border border-border flex flex-col items-center justify-center gap-4 mb-8">
                 <div className="font-mono text-xs text-text-muted">[ ARCHITECTURE DIAGRAM ]</div>
                 <div className="flex items-center gap-4 text-xs font-mono flex-wrap justify-center px-4">
                   {project.architecture.map((archNode, idx) => (
                     <div key={idx} className="flex items-center gap-4">
                       <div className="px-3 py-1 border border-text-muted text-text-muted whitespace-nowrap">{archNode}</div>
                       {idx < project.architecture.length - 1 && <div className="w-8 h-[1px] bg-border hidden sm:block" />}
                     </div>
                   ))}
                 </div>
              </div>
            )}
            
            {assets?.gallery && assets.gallery.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {assets.gallery.map((img: string, i: number) => (
                  <div key={i} className="relative aspect-video border border-border bg-[#050505]">
                    <Image 
                      src={img} 
                      alt={`${project.title} screenshot ${i+1}`} 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          
          {project.engineering && (
            <section>
              <h2 className="text-sm font-mono text-text-muted mb-6 tracking-widest uppercase border-b border-border pb-4">Engineering Decisions</h2>
              <div className="prose prose-invert prose-p:text-text-primary prose-p:leading-relaxed prose-p:font-light">
                {project.engineering.split('\n\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
            </section>
          )}

          
          {project.challenges && (
            <section>
              <h2 className="text-sm font-mono text-text-muted mb-6 tracking-widest uppercase border-b border-border pb-4">Challenges & Learnings</h2>
              <div className="prose prose-invert prose-p:text-text-primary prose-p:leading-relaxed prose-p:font-light">
                {project.challenges.split('\n\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-sm font-mono text-text-muted mb-6 tracking-widest uppercase border-b border-border pb-4">Current State</h2>
            <div className="prose prose-invert prose-p:text-text-primary prose-p:leading-relaxed prose-p:font-light">
              {(project.currentState || project.description).split('\n\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-mono text-text-muted mb-6 tracking-widest uppercase border-b border-border pb-4">Tech Stack</h2>
            <div className="flex flex-wrap gap-3">
              {project.tags.map(tag => (
                <span key={tag} className="px-4 py-2 bg-surface text-text-primary border border-border font-mono text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </section>
          
          <div className="pt-24 pb-8 flex justify-end border-t border-border">
            <Link 
              
              href={`/work/${projects[(projects.findIndex(p => p.slug === project.slug) + 1) % projects.length]?.slug || ''}`}
              className="group flex items-center gap-4 text-xl font-mono uppercase tracking-widest hover:text-accent transition-colors"
            >
              <span>Next Project</span>
              <MoveLeft className="w-6 h-6 rotate-180 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
