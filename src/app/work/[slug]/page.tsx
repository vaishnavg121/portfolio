import Link from "next/link";
import Image from "next/image";
import { MoveLeft, ExternalLink } from "lucide-react";
import { PROJECT_ASSETS } from "@/lib/assets";

export default function ProjectDetail({ params }: { params: { slug: string } }) {
  // Mock data, in a real app fetch from data based on params.slug
  const project = {
    title: params.slug.toUpperCase(),
    category: "SYSTEMS / ARCHITECTURE",
    description: "This is a placeholder description for the project detail page. It explains the high level overview.",
    tags: ["React", "TypeScript", "Next.js"],
    assets: PROJECT_ASSETS[params.slug],
  };

  return (
    <main className="min-h-screen bg-background pt-32 pb-24 selection:bg-accent-soft selection:text-accent">
      <div className="container mx-auto px-6 md:px-12 max-w-4xl">
        
        <Link href="/#work" className="inline-flex items-center gap-2 text-text-muted hover:text-text-primary font-mono text-sm tracking-widest uppercase mb-16 group transition-colors">
          <MoveLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
          Back to Work
        </Link>

        {/* Hero */}
        <div className="mb-24">
          <div className="font-mono text-accent text-sm mb-4 tracking-widest">{project.category}</div>
          <h1 className="text-5xl md:text-7xl font-display font-medium mb-8 uppercase tracking-tighter">{project.title}</h1>
          <p className="text-xl md:text-2xl text-text-muted font-light leading-relaxed mb-12">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-4 font-mono text-sm">
            <a href="#" className="flex items-center gap-2 border border-border px-4 py-2 hover:bg-surface-elevated transition-colors">
               [GITHUB] Repository
            </a>
            <a href="#" className="flex items-center gap-2 bg-text-primary text-background px-4 py-2 hover:bg-white transition-colors">
              <ExternalLink className="w-4 h-4" /> Live Demo
            </a>
          </div>
        </div>

        {/* Visual Header Placeholder */}
        {project.assets?.hero ? (
          <div className="w-full aspect-video mb-24 border border-border overflow-hidden relative">
            <Image 
              src={project.assets.hero} 
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
          <section>
            <h2 className="text-sm font-mono text-text-muted mb-6 tracking-widest uppercase border-b border-border pb-4">The Problem</h2>
            <div className="prose prose-invert prose-p:text-text-primary prose-p:leading-relaxed prose-p:font-light">
              <p>
                A detailed explanation of the core problem. This section sets the context for why the system was necessary and what constraints existed initially.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-mono text-text-muted mb-6 tracking-widest uppercase border-b border-border pb-4">System Architecture</h2>
            {project.assets?.diagram ? (
              <div className="w-full mb-8 relative aspect-video">
                <Image 
                  src={project.assets.diagram} 
                  alt={`${project.title} Architecture Diagram`} 
                  fill 
                  className="object-contain drop-shadow-2xl" 
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-surface border border-border flex flex-col items-center justify-center gap-4 mb-8">
                 <div className="font-mono text-xs text-text-muted">[ ARCHITECTURE DIAGRAM PLACEHOLDER ]</div>
                 <div className="flex items-center gap-4 text-xs font-mono">
                   <div className="px-3 py-1 border border-accent text-accent">CLIENT</div>
                   <div className="w-8 h-[1px] bg-border" />
                   <div className="px-3 py-1 border border-text-muted">API</div>
                   <div className="w-8 h-[1px] bg-border" />
                   <div className="px-3 py-1 border border-text-muted">DATABASE</div>
                 </div>
              </div>
            )}
            
            {project.assets?.gallery && project.assets.gallery.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {project.assets.gallery.map((img, i) => (
                  <div key={i} className="relative aspect-video border border-border">
                    <Image 
                      src={img} 
                      alt={`${project.title} screenshot ${i+1}`} 
                      fill 
                      className="object-cover" 
                    />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-mono text-text-muted mb-6 tracking-widest uppercase border-b border-border pb-4">Engineering Decisions</h2>
            <div className="prose prose-invert prose-p:text-text-primary prose-p:leading-relaxed prose-p:font-light">
              <p>
                Discussing the trade-offs, tech stack selection, and interesting technical hurdles encountered during implementation.
              </p>
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
        </div>

      </div>
    </main>
  );
}
