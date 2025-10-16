/**
 * Technical SEO Audit Script
 * Runs automated checks for technical SEO issues
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname } from 'path';

interface AuditResult {
  timestamp: string;
  passed: number;
  failed: number;
  warnings: number;
  issues: AuditIssue[];
  recommendations: string[];
  score: number;
}

interface AuditIssue {
  severity: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  file?: string;
  fix?: string;
}

class TechnicalSEOAuditor {
  private issues: AuditIssue[] = [];
  private recommendations: string[] = [];
  private srcDir: string;
  private publicDir: string;

  constructor() {
    this.srcDir = join(process.cwd(), 'src');
    this.publicDir = join(process.cwd(), 'public');
  }

  /**
   * Run complete audit
   */
  async runAudit(): Promise<AuditResult> {
    console.log('🔍 Starting Technical SEO Audit...\n');

    // Run all checks
    this.checkMetaTags();
    this.checkStructuredData();
    this.checkImages();
    this.checkRobotsTxt();
    this.checkSitemaps();
    this.checkCanonicals();
    this.checkInternalLinks();
    this.checkPerformance();

    // Calculate score
    const passed = this.issues.filter((i) => i.severity === 'info').length;
    const warnings = this.issues.filter((i) => i.severity === 'warning').length;
    const errors = this.issues.filter((i) => i.severity === 'error').length;
    const totalChecks = passed + warnings + errors;
    const score = totalChecks > 0 ? Math.round(((passed + warnings * 0.5) / totalChecks) * 100) : 100;

    return {
      timestamp: new Date().toISOString(),
      passed,
      failed: errors,
      warnings,
      issues: this.issues,
      recommendations: this.recommendations,
      score,
    };
  }

  /**
   * Check meta tags in pages
   */
  private checkMetaTags() {
    console.log('Checking meta tags...');
    const pages = this.findPageFiles(join(this.srcDir, 'app'));

    pages.forEach((page) => {
      const content = readFileSync(page, 'utf-8');

      // Check for metadata export
      if (!content.includes('export const metadata') && !content.includes('export async function generateMetadata')) {
        this.issues.push({
          severity: 'error',
          category: 'Meta Tags',
          message: 'Missing metadata export',
          file: page,
          fix: 'Add metadata export with title and description',
        });
      }

      // Check title length
      const titleMatch = content.match(/title:\s*['"`]([^'"`]+)['"`]/);
      if (titleMatch) {
        const title = titleMatch[1];
        if (title.length < 30) {
          this.issues.push({
            severity: 'warning',
            category: 'Meta Tags',
            message: `Title too short (${title.length} chars, recommended 50-60)`,
            file: page,
          });
        } else if (title.length > 60) {
          this.issues.push({
            severity: 'warning',
            category: 'Meta Tags',
            message: `Title too long (${title.length} chars, recommended 50-60)`,
            file: page,
          });
        } else {
          this.issues.push({
            severity: 'info',
            category: 'Meta Tags',
            message: 'Title length optimal',
            file: page,
          });
        }
      }

      // Check description length
      const descMatch = content.match(/description:\s*['"`]([^'"`]+)['"`]/);
      if (descMatch) {
        const desc = descMatch[1];
        if (desc.length < 120) {
          this.issues.push({
            severity: 'warning',
            category: 'Meta Tags',
            message: `Description too short (${desc.length} chars, recommended 150-160)`,
            file: page,
          });
        } else if (desc.length > 160) {
          this.issues.push({
            severity: 'warning',
            category: 'Meta Tags',
            message: `Description too long (${desc.length} chars, recommended 150-160)`,
            file: page,
          });
        } else {
          this.issues.push({
            severity: 'info',
            category: 'Meta Tags',
            message: 'Description length optimal',
            file: page,
          });
        }
      }
    });
  }

  /**
   * Check structured data implementation
   */
  private checkStructuredData() {
    console.log('Checking structured data...');
    const pages = this.findPageFiles(join(this.srcDir, 'app'));

    pages.forEach((page) => {
      const content = readFileSync(page, 'utf-8');

      if (content.includes('StructuredData')) {
        this.issues.push({
          severity: 'info',
          category: 'Structured Data',
          message: 'Schema markup implemented',
          file: page,
        });
      } else if (page.includes('/services/') || page.includes('/locations/')) {
        this.issues.push({
          severity: 'warning',
          category: 'Structured Data',
          message: 'Missing schema markup for service/location page',
          file: page,
          fix: 'Add StructuredData component with appropriate schema',
        });
      }
    });
  }

  /**
   * Check images optimization
   */
  private checkImages() {
    console.log('Checking images...');
    const images = this.findImageFiles(this.publicDir);

    let unoptimizedCount = 0;
    images.forEach((image) => {
      const ext = extname(image).toLowerCase();
      const stats = statSync(image);
      const sizeKB = stats.size / 1024;

      if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        unoptimizedCount++;
        if (sizeKB > 500) {
          this.issues.push({
            severity: 'warning',
            category: 'Images',
            message: `Large image file (${Math.round(sizeKB)}KB), consider WebP conversion`,
            file: image,
          });
        }
      } else if (ext === '.webp') {
        this.issues.push({
          severity: 'info',
          category: 'Images',
          message: 'Image optimized (WebP format)',
          file: image,
        });
      }
    });

    if (unoptimizedCount > 0) {
      this.recommendations.push(`Convert ${unoptimizedCount} images to WebP format for better performance`);
    }
  }

  /**
   * Check robots.txt
   */
  private checkRobotsTxt() {
    console.log('Checking robots.txt...');
    const robotsPath = join(this.publicDir, 'robots.txt');

    try {
      const content = readFileSync(robotsPath, 'utf-8');

      if (content.includes('User-agent')) {
        this.issues.push({
          severity: 'info',
          category: 'Robots.txt',
          message: 'robots.txt found and configured',
        });
      }

      if (content.includes('Sitemap:')) {
        this.issues.push({
          severity: 'info',
          category: 'Robots.txt',
          message: 'Sitemap reference found in robots.txt',
        });
      } else {
        this.issues.push({
          severity: 'warning',
          category: 'Robots.txt',
          message: 'Missing sitemap reference in robots.txt',
          fix: 'Add "Sitemap: https://repairconnect.ae/sitemap.xml"',
        });
      }
    } catch (error) {
      this.issues.push({
        severity: 'error',
        category: 'Robots.txt',
        message: 'robots.txt not found',
        fix: 'Create robots.txt in public directory',
      });
    }
  }

  /**
   * Check sitemaps
   */
  private checkSitemaps() {
    console.log('Checking sitemaps...');
    const sitemapPath = join(this.publicDir, 'sitemap.xml');

    try {
      readFileSync(sitemapPath, 'utf-8');
      this.issues.push({
        severity: 'info',
        category: 'Sitemaps',
        message: 'Main sitemap found',
      });
    } catch (error) {
      this.issues.push({
        severity: 'error',
        category: 'Sitemaps',
        message: 'Main sitemap not found',
        fix: 'Run "npm run generate-sitemaps" to create sitemaps',
      });
    }
  }

  /**
   * Check canonical tags
   */
  private checkCanonicals() {
    console.log('Checking canonical tags...');
    const pages = this.findPageFiles(join(this.srcDir, 'app'));

    pages.forEach((page) => {
      const content = readFileSync(page, 'utf-8');

      if (content.includes('canonical:') || content.includes('alternates')) {
        this.issues.push({
          severity: 'info',
          category: 'Canonicals',
          message: 'Canonical URL configured',
          file: page,
        });
      } else if (page.includes('/services/') || page.includes('/locations/')) {
        this.issues.push({
          severity: 'warning',
          category: 'Canonicals',
          message: 'Missing canonical URL',
          file: page,
          fix: 'Add alternates.canonical to metadata',
        });
      }
    });
  }

  /**
   * Check internal linking
   */
  private checkInternalLinks() {
    console.log('Checking internal links...');
    this.recommendations.push('Implement automated internal linking between service and location pages');
    this.recommendations.push('Add breadcrumb navigation to all pages');
  }

  /**
   * Check performance considerations
   */
  private checkPerformance() {
    console.log('Checking performance...');
    this.recommendations.push('Run Lighthouse audit for Core Web Vitals');
    this.recommendations.push('Implement lazy loading for images below the fold');
    this.recommendations.push('Consider implementing code splitting for larger components');
  }

  /**
   * Find all page.tsx files recursively
   */
  private findPageFiles(dir: string, files: string[] = []): string[] {
    try {
      const items = readdirSync(dir);

      items.forEach((item) => {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          this.findPageFiles(fullPath, files);
        } else if (item === 'page.tsx' || item === 'page.ts') {
          files.push(fullPath);
        }
      });
    } catch (error) {
      // Directory doesn't exist or can't be read
    }

    return files;
  }

  /**
   * Find all image files
   */
  private findImageFiles(dir: string, files: string[] = []): string[] {
    try {
      const items = readdirSync(dir);

      items.forEach((item) => {
        const fullPath = join(dir, item);
        const stat = statSync(fullPath);

        if (stat.isDirectory() && !item.startsWith('.')) {
          this.findImageFiles(fullPath, files);
        } else {
          const ext = extname(item).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
            files.push(fullPath);
          }
        }
      });
    } catch (error) {
      // Directory doesn't exist
    }

    return files;
  }
}

/**
 * Main execution
 */
async function main() {
  const auditor = new TechnicalSEOAuditor();
  const result = await auditor.runAudit();

  // Display results
  console.log('\n' + '='.repeat(60));
  console.log('📊 TECHNICAL SEO AUDIT RESULTS');
  console.log('='.repeat(60));
  console.log(`Score: ${result.score}/100`);
  console.log(`✅ Passed: ${result.passed}`);
  console.log(`⚠️  Warnings: ${result.warnings}`);
  console.log(`❌ Failed: ${result.failed}`);
  console.log('='.repeat(60));

  // Display issues grouped by category
  const categories = [...new Set(result.issues.map((i) => i.category))];
  categories.forEach((category) => {
    const categoryIssues = result.issues.filter((i) => i.category === category);
    console.log(`\n${category}:`);
    categoryIssues.forEach((issue) => {
      const icon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : '✅';
      console.log(`  ${icon} ${issue.message}`);
      if (issue.file) {
        console.log(`     File: ${issue.file}`);
      }
      if (issue.fix) {
        console.log(`     Fix: ${issue.fix}`);
      }
    });
  });

  // Display recommendations
  if (result.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    result.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }

  // Save report
  const reportPath = join(process.cwd(), 'seo', 'technical_audit_report.json');
  writeFileSync(reportPath, JSON.stringify(result, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

// Run if called directly
if (require.main === module) {
  main();
}

export { TechnicalSEOAuditor };
