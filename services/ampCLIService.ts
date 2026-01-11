/**
 * AMP CLI Integration Service
 * Handles website generation using AMP CLI
 */

import { BrandDNA } from '../types';

export interface AMPGenerateOptions {
  portfolio: BrandDNA;
  company: string;
  outputDir?: string;
  template?: 'portfolio' | 'landing' | 'corporate';
}

export class AMPCLIService {
  private outputDir: string = '/tmp/amp-generated';

  /**
   * Generate website using AMP CLI
   * In browser context, this communicates with a backend service
   */
  async generateWebsite(options: AMPGenerateOptions): Promise<{
    success: boolean;
    files: Record<string, string>;
    message: string;
  }> {
    try {
      console.log(`[AMP CLI] Generating website for: ${options.company}`);

      // Since we're in browser, call backend API that runs AMP CLI
      const response = await fetch('/api/amp/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          portfolio: options.portfolio,
          company: options.company,
          template: options.template || 'portfolio',
          outputDir: options.outputDir || this.outputDir
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`AMP generation failed: ${error.message}`);
      }

      const result = await response.json();
      console.log(`[AMP CLI] ✓ Website generated with ${Object.keys(result.files).length} files`);
      return result;
    } catch (error) {
      console.error('[AMP CLI] Error generating website:', error);
      throw error;
    }
  }

  /**
   * Generate website locally with full brand portfolio integration
   */
  async generateWebsiteLocal(options: AMPGenerateOptions): Promise<{
    success: boolean;
    files: Record<string, string>;
    message: string;
  }> {
    const { portfolio, company } = options;

    // Extract brand colors and styling
    const primaryColor = portfolio.colors[0]?.hex || '#3B82F6';
    const secondaryColor = portfolio.colors[1]?.hex || '#1F2937';
    const accentColor = portfolio.colors[2]?.hex || '#EC4899';
    const fontFamily = portfolio.fonts[0]?.family || 'Inter, sans-serif';

    // Generate comprehensive brand-driven website
    const files: Record<string, string> = {
      'package.json': JSON.stringify({
        name: company.toLowerCase().replace(/\s+/g, '-'),
        version: '1.0.0',
        description: portfolio.tagline,
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview'
        },
        dependencies: {
          'vite': '^5.0.0',
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          'tailwindcss': '^3.3.0'
        }
      }, null, 2),

      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${portfolio.description}">
  <title>${company} | ${portfolio.tagline}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --primary: ${primaryColor};
      --secondary: ${secondaryColor};
      --accent: ${accentColor};
      --text-primary: #1F2937;
      --text-secondary: #6B7280;
      --bg-light: #F9FAFB;
      --bg-white: #FFFFFF;
    }
    
    html { scroll-behavior: smooth; }
    
    body {
      font-family: ${fontFamily}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: var(--text-primary);
      background: var(--bg-light);
      line-height: 1.6;
    }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }
    
    /* Navigation */
    nav {
      position: sticky;
      top: 0;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 100;
      padding: 1rem 0;
    }
    
    nav .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    nav .logo { font-size: 1.5rem; font-weight: 800; color: var(--primary); }
    nav ul { list-style: none; display: flex; gap: 2rem; }
    nav a { text-decoration: none; color: var(--text-secondary); transition: color 0.3s; }
    nav a:hover { color: var(--primary); }
    
    /* Header Hero */
    header {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      padding: 6rem 2rem;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    header h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }
    
    header .tagline {
      font-size: 1.5rem;
      opacity: 0.95;
      margin-bottom: 1.5rem;
    }
    
    header .subtitle {
      font-size: 1.1rem;
      opacity: 0.85;
      max-width: 600px;
      margin: 0 auto 2rem;
    }
    
    .cta-button {
      display: inline-block;
      background: white;
      color: var(--primary);
      padding: 0.85rem 2.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 700;
      transition: all 0.3s ease;
      border: 2px solid white;
    }
    
    .cta-button:hover {
      background: transparent;
      color: white;
    }
    
    section {
      padding: 4rem 0;
    }
    
    section h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 2rem;
      color: var(--primary);
      text-align: center;
    }
    
    section p {
      font-size: 1.1rem;
      color: var(--text-secondary);
      line-height: 1.8;
      margin-bottom: 1.5rem;
    }
    
    .mission {
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(31, 41, 55, 0.1) 100%);
      padding: 3rem;
      border-radius: 12px;
      border-left: 4px solid var(--accent);
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .mission p {
      font-size: 1.2rem;
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin: 2rem 0;
    }
    
    .card {
      background: var(--bg-white);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      border-top: 3px solid var(--accent);
    }
    
    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .card h3 { font-size: 1.3rem; margin-bottom: 0.75rem; color: var(--primary); }
    .card ul { list-style: none; }
    .card li { padding: 0.4rem 0; padding-left: 1.5rem; position: relative; color: var(--text-secondary); }
    .card li:before { content: "✓"; position: absolute; left: 0; color: var(--accent); font-weight: bold; }
    
    .personas {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .persona {
      background: var(--bg-white);
      padding: 2rem;
      border-radius: 12px;
      border-bottom: 4px solid var(--primary);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .persona h4 { color: var(--primary); margin-bottom: 0.75rem; font-size: 1.1rem; }
    .persona p { font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
    .persona strong { color: var(--text-primary); }
    
    .swot {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .swot-item {
      background: var(--bg-white);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .swot-item h4 { font-weight: 700; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 2px solid var(--accent); }
    .swot-item ul { list-style: none; }
    .swot-item li { padding: 0.5rem 0; padding-left: 1.5rem; position: relative; color: var(--text-secondary); }
    .swot-item li:before { content: "▪"; position: absolute; left: 0; color: var(--primary); font-weight: bold; }
    
    .tone-section {
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      color: white;
      padding: 3rem;
      border-radius: 12px;
      margin: 2rem 0;
    }
    
    .tone-section h3 { font-size: 1.5rem; margin-bottom: 1rem; }
    .tone-section p { opacity: 0.95; margin-bottom: 0.75rem; }
    
    .competitors {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
    
    .competitor {
      background: var(--bg-white);
      padding: 2rem;
      border-radius: 12px;
      border-left: 4px solid var(--primary);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    .competitor h4 { color: var(--primary); margin-bottom: 0.75rem; }
    .competitor p { color: var(--text-secondary); font-size: 0.95rem; }
    
    .color-palette {
      display: flex;
      gap: 1rem;
      margin: 2rem 0;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .color-box {
      flex: 0 1 150px;
      padding: 2rem;
      border-radius: 8px;
      text-align: center;
      color: white;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .font-showcase {
      background: var(--bg-white);
      padding: 2rem;
      border-radius: 12px;
      margin: 1rem 0;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    
    footer {
      background: var(--secondary);
      color: white;
      padding: 3rem 0;
      text-align: center;
      margin-top: 4rem;
    }
    
    footer p { color: rgba(255, 255, 255, 0.8); margin-bottom: 0.5rem; }
    .footer-divider { height: 1px; background: rgba(255, 255, 255, 0.2); margin: 1rem 0; }
    
    @media (max-width: 768px) {
      header h1 { font-size: 2rem; }
      header .tagline { font-size: 1.1rem; }
      section h2 { font-size: 1.8rem; }
      nav ul { gap: 1rem; font-size: 0.9rem; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="container">
      <div class="logo">${company}</div>
      <ul>
        <li><a href="#mission">Mission</a></li>
        <li><a href="#values">Values</a></li>
        <li><a href="#messaging">Messaging</a></li>
        <li><a href="#visual">Visual</a></li>
        <li><a href="#audience">Audience</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <header>
    <h1>${company}</h1>
    <p class="tagline">${portfolio.tagline}</p>
    <p class="subtitle">${portfolio.description}</p>
    <a href="#contact" class="cta-button">Learn More</a>
  </header>

  <div class="container">
    <!-- Mission Section -->
    <section id="mission">
      <h2>Our Mission</h2>
      <div class="mission">
        <p>${portfolio.mission}</p>
      </div>
    </section>

    <!-- Brand Personality & Values -->
    <section id="values">
      <h2>Who We Are</h2>
      <div class="grid">
        <div class="card">
          <h3>Brand Personality</h3>
          <p>${portfolio.brandPersonality?.join(', ')}</p>
        </div>
        <div class="card">
          <h3>Our Core Values</h3>
          <ul>
            ${portfolio.values?.map(v => `<li>${v}</li>`).join('')}
          </ul>
        </div>
        <div class="card">
          <h3>What Drives Us</h3>
          <p><strong>Target Audience:</strong></p>
          <p>${portfolio.targetAudience}</p>
        </div>
      </div>
    </section>

    <!-- Key Messaging -->
    <section id="messaging">
      <h2>What We Communicate</h2>
      <p>Our key messages resonate with our audience through authentic, ${portfolio.toneOfVoice?.adjectives?.join(' and ')?.toLowerCase()} communication.</p>
      <div class="grid">
        ${portfolio.keyMessaging?.map(msg => `<div class="card"><p>${msg}</p></div>`).join('')}
      </div>
    </section>

    <!-- Visual Identity -->
    <section id="visual">
      <h2>Visual Identity</h2>
      
      <h3 style="font-size: 1.5rem; color: var(--text-primary); margin-top: 2rem; margin-bottom: 1rem;">Brand Colors</h3>
      <p>Our carefully selected color palette reflects our brand personality and values.</p>
      <div class="color-palette">
        ${portfolio.colors?.slice(0, 5).map((c, i) => `<div class="color-box" style="background: ${c.hex};" title="${c.name}">${c.name || 'Color ' + (i+1)}</div>`).join('')}
      </div>
      
      <h3 style="font-size: 1.5rem; color: var(--text-primary); margin-top: 3rem; margin-bottom: 1rem;">Typography</h3>
      <p>Our font selections ensure clarity and align with our brand voice.</p>
      <div>
        ${portfolio.fonts?.map(f => `
          <div class="font-showcase">
            <h4 style="font-family: '${f.family}'; font-size: 1.8rem; margin-bottom: 0.5rem;">${f.family}</h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">${f.description || f.usage}</p>
          </div>
        `).join('')}
      </div>
      
      <div class="card" style="margin-top: 2rem;">
        <h3>Visual Style</h3>
        <p><strong>Style:</strong> ${portfolio.visualStyle?.style}</p>
        <p><strong>Description:</strong> ${portfolio.visualStyle?.description}</p>
      </div>
    </section>

    <!-- Tone of Voice -->
    <section>
      <div class="tone-section">
        <h3>How We Sound</h3>
        <p><strong>Tone Adjectives:</strong> ${portfolio.toneOfVoice?.adjectives?.join(', ')}</p>
        <p><strong>Description:</strong> ${portfolio.toneOfVoice?.description}</p>
        <p style="margin-top: 1rem;"><em>"We communicate in a way that feels ${portfolio.toneOfVoice?.adjectives?.slice(0, 2).join(' and ')?.toLowerCase()} while staying true to our values."</em></p>
      </div>
    </section>

    <!-- Target Audience & Personas -->
    <section id="audience">
      <h2>Who We Serve</h2>
      <p><strong>Primary Audience:</strong> ${portfolio.targetAudience}</p>
      <div class="personas">
        ${portfolio.personas?.map(p => `
          <div class="persona">
            <h4>${p.name}</h4>
            <p><strong>Demographics:</strong> ${p.demographics}</p>
            <p><strong>Psychographics:</strong> ${p.psychographics}</p>
            <p><strong>Pain Points:</strong> ${p.painPoints?.join(', ')}</p>
            <p><strong>Behaviors:</strong> ${p.behaviors?.join(', ')}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- SWOT Analysis -->
    <section>
      <h2>Our Strategic Position</h2>
      <div class="swot">
        <div class="swot-item">
          <h4>💪 Strengths</h4>
          <ul>
            ${portfolio.swot?.strengths?.map(s => `<li>${s}</li>`).join('')}
          </ul>
        </div>
        <div class="swot-item">
          <h4>⚠️ Weaknesses</h4>
          <ul>
            ${portfolio.swot?.weaknesses?.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
        <div class="swot-item">
          <h4>🚀 Opportunities</h4>
          <ul>
            ${portfolio.swot?.opportunities?.map(o => `<li>${o}</li>`).join('')}
          </ul>
        </div>
        <div class="swot-item">
          <h4>🛡️ Threats</h4>
          <ul>
            ${portfolio.swot?.threats?.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
      </div>
    </section>

    <!-- Competitors -->
    <section>
      <h2>Competitive Landscape</h2>
      <p>We understand our competitive environment and how we differentiate in the market.</p>
      <div class="competitors">
        ${portfolio.competitors?.map(c => `
          <div class="competitor">
            <h4>${c.name}</h4>
            <p><strong>Our Differentiation:</strong></p>
            <p>${c.differentiation}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- CTA Section -->
    <section id="contact" style="text-align: center; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(31, 41, 55, 0.1) 100%); padding: 4rem 2rem; border-radius: 12px; margin: 3rem 0;">
      <h2>Ready to Connect with ${company}?</h2>
      <p style="font-size: 1.2rem; margin-bottom: 2rem;">Discover how we can make a difference in your life.</p>
      <a href="#" class="cta-button">Get Started Today</a>
    </section>
  </div>

  <footer>
    <div class="container">
      <p><strong>&copy; ${new Date().getFullYear()} ${company}. All rights reserved.</strong></p>
      <div class="footer-divider"></div>
      <p>Brand DNA Generated Portfolio Site | Created with AMP CLI</p>
      <p style="font-size: 0.85rem; margin-top: 1rem; opacity: 0.7;">${portfolio.description}</p>
    </div>
  </footer>
</body>
</html>`,

      'vite.config.js': `import { defineConfig } from 'vite';

export default defineConfig({
  server: { 
    port: 3000,
    open: true 
  },
  build: {
    outDir: 'dist',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});`,

      '.gitignore': `node_modules/
dist/
.env.local
*.log
.DS_Store
.env`,

      'README.md': `# ${company}

**${portfolio.tagline}**

## About

${portfolio.description}

## Brand DNA

### Core Identity
- **Mission:** ${portfolio.mission}
- **Vision:** ${portfolio.tagline}
- **Personality:** ${portfolio.brandPersonality?.join(', ')}

### Values
${portfolio.values?.map(v => `- ${v}`).join('\n')}

### Key Messaging
${portfolio.keyMessaging?.map(m => `- ${m}`).join('\n')}

### Target Audience
${portfolio.targetAudience}

## How We Sound

**Tone:** ${portfolio.toneOfVoice?.adjectives?.join(', ')}

${portfolio.toneOfVoice?.description}

## Visual Identity

- **Primary Color:** ${portfolio.colors?.[0]?.hex || '#3B82F6'} (${portfolio.colors?.[0]?.name})
- **Secondary Color:** ${portfolio.colors?.[1]?.hex || '#1F2937'} (${portfolio.colors?.[1]?.name})
- **Accent Color:** ${portfolio.colors?.[2]?.hex || '#EC4899'} (${portfolio.colors?.[2]?.name})
- **Primary Font:** ${portfolio.fonts?.[0]?.family || 'Inter'}
- **Visual Style:** ${portfolio.visualStyle?.style}

## Market Position

### Strengths
${portfolio.swot?.strengths?.map(s => `- ${s}`).join('\n')}

### Opportunities
${portfolio.swot?.opportunities?.map(o => `- ${o}`).join('\n')}

## Getting Started

### Development
\`\`\`bash
npm install
npm run dev
\`\`\`

### Build for Production
\`\`\`bash
npm run build
npm run preview
\`\`\`

### Deploy
Push to GitHub and connect to Vercel for automatic deployments.

---

**Generated by Brand DNA Portfolio | ${new Date().toLocaleDateString()}**
`
    };

    return {
      success: true,
      files,
      message: `Comprehensive brand-driven website generated for ${company}`
    };
  }
}

export const ampCLIService = new AMPCLIService();
