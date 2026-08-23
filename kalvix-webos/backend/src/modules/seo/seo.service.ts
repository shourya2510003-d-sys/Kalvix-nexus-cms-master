import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);
  private searchconsole: any;
  private isConfigured = false;
  private siteUrl = process.env.GSC_SITE_URL || 'https://divinecardinal.com/';

  constructor(private prisma: PrismaService) {
    this.initGSC();
  }

  private initGSC() {
    try {
      const clientEmail = process.env.GSC_CLIENT_EMAIL;
      const privateKey = process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!clientEmail || !privateKey) {
        this.logger.warn('GSC_CLIENT_EMAIL or GSC_PRIVATE_KEY is missing. Google Search Console API will be disabled.');
        return;
      }

      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      });

      this.searchconsole = google.searchconsole({ version: 'v1', auth });
      this.isConfigured = true;
      this.logger.log('Google Search Console API configured successfully.');
    } catch (error) {
      this.logger.error('Failed to initialize Google Search Console API', error);
    }
  }

  async getGscMetrics(credentials?: { clientEmail?: string, privateKey?: string, siteUrl?: string }) {
    const clientEmail = credentials?.clientEmail || process.env.GSC_CLIENT_EMAIL;
    const privateKey = credentials?.privateKey?.replace(/\\n/g, '\n') || process.env.GSC_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const siteUrl = credentials?.siteUrl || this.siteUrl;

    let isConfigured = this.isConfigured;
    let searchconsole = this.searchconsole;

    // If new credentials are provided, re-initialize just for this request
    if (credentials?.clientEmail && credentials?.privateKey) {
      try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: clientEmail,
            private_key: privateKey,
          },
          scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });
        searchconsole = google.searchconsole({ version: 'v1', auth });
        isConfigured = true;
      } catch (err) {
        this.logger.error('Failed to init dynamic GSC client', err);
      }
    }

    // If not configured, return graceful fallback or error
    if (!isConfigured) {
      this.logger.warn('GSC not configured, returning mock metrics');
      return {
        success: true,
        message: 'Mock data returned (Google Search Console is not configured)',
        data: {
          indexed: 142,
          notIndexed: 12,
          lcp: 'Good (1.2s)',
          cls: 'Good (0.01)',
          inp: 'Good (42ms)'
        }
      };
    }

    try {
      // Get today's date and the date 3 days ago (GSC data is often delayed by 2-3 days)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - 3);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days

      // Fetch search analytics data
      const analyticsResponse = await searchconsole.searchanalytics.query({
        siteUrl: siteUrl,
        requestBody: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          dimensions: ['date'],
          rowLimit: 1, // We just want an aggregated overview for now or a quick check
        },
      });

      // Get sitemaps to check indexing status broadly
      // Note: GSC API doesn't provide a direct "Total Indexed Pages" endpoint easily without iterating through Index Coverage report,
      // which is complex. For now, we fetch sitemap stats.
      let indexedCount = 0;
      let notIndexedCount = 0;
      try {
        const sitemapsResponse = await searchconsole.sitemaps.list({
          siteUrl: siteUrl,
        });
        
        if (sitemapsResponse.data.sitemap) {
          for (const sitemap of sitemapsResponse.data.sitemap) {
            indexedCount += parseInt(sitemap.contents?.[0]?.indexed || '0', 10);
            const submitted = parseInt(sitemap.contents?.[0]?.submitted || '0', 10);
            if (submitted > indexedCount) {
              notIndexedCount += (submitted - indexedCount);
            }
          }
        }
      } catch (err) {
        this.logger.warn('Failed to fetch sitemap stats', err);
      }

      return {
        success: true,
        data: {
          indexed: indexedCount,
          notIndexed: notIndexedCount,
          // Core Web Vitals would typically come from Chrome UX Report API (CrUX).
          // We include placeholders here as GSC API doesn't serve CWV directly via this simple endpoint.
          lcp: 'Requires CrUX API',
          cls: 'Requires CrUX API',
          inp: 'Requires CrUX API',
          analytics: analyticsResponse.data.rows || [],
        }
      };
    } catch (error: any) {
      this.logger.error('Error fetching GSC metrics', error.message);
      return {
        success: false,
        message: 'Failed to fetch metrics from Google Search Console API.',
        error: error.message
      };
    }
  }
}
