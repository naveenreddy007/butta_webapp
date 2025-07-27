# Deployment Guide - Butta Convention Client Website

## Pre-Deployment Checklist

### Environment Configuration
- [ ] Copy `.env.example` to `.env` and fill in all required values
- [ ] Set up Google Analytics account and get measurement ID
- [ ] Configure EmailJS for contact form submissions
- [ ] Set up business contact information
- [ ] Configure CDN URLs for image optimization

### Build Optimization
- [ ] Run `npm run build` to ensure clean build
- [ ] Check bundle size with `npm run build -- --analyze`
- [ ] Optimize images and compress assets
- [ ] Verify all environment variables are properly set

### Testing
- [ ] Run all tests: `npm run test`
- [ ] Run accessibility tests
- [ ] Test on multiple devices and browsers
- [ ] Verify form submissions work correctly
- [ ] Test offline functionality

### SEO & Performance
- [ ] Verify meta tags are properly set
- [ ] Check structured data with Google's Rich Results Test
- [ ] Run Lighthouse audit (aim for 90+ scores)
- [ ] Test Core Web Vitals
- [ ] Verify sitemap.xml is generated

### Security
- [ ] Ensure no sensitive data in client-side code
- [ ] Verify HTTPS is enforced
- [ ] Check Content Security Policy headers
- [ ] Validate form inputs and sanitize data

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Deploy to Hosting Platform

#### Netlify Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

#### Manual Deployment
1. Upload `dist/` folder contents to your web server
2. Configure web server for SPA routing
3. Set up HTTPS certificate
4. Configure caching headers

### 3. Post-Deployment Verification
- [ ] Verify website loads correctly
- [ ] Test all navigation and forms
- [ ] Check Google Analytics is tracking
- [ ] Verify contact form submissions
- [ ] Test mobile responsiveness
- [ ] Check page load speeds

## Environment Variables

### Required Variables
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_BUSINESS_PHONE=+91 88018 86108
VITE_BUSINESS_EMAIL=info@buttaconvention.com
VITE_BUSINESS_WHATSAPP=918801886108
```

### Optional Variables
```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_API_BASE_URL=https://api.buttaconvention.com
VITE_CDN_BASE_URL=https://cdn.buttaconvention.com
VITE_ENABLE_ANALYTICS=true
```

## Performance Optimization

### Image Optimization
- Use WebP format with JPEG fallbacks
- Implement lazy loading for all images
- Compress images to appropriate sizes
- Use responsive images with srcset

### Caching Strategy
- Set up service worker for offline functionality
- Configure browser caching headers
- Use CDN for static assets
- Implement resource preloading

### Bundle Optimization
- Code splitting for better loading performance
- Tree shaking to remove unused code
- Minification and compression
- Critical CSS inlining

## Monitoring & Analytics

### Performance Monitoring
- Set up Google Analytics 4
- Monitor Core Web Vitals
- Track user interactions and conversions
- Set up error tracking (e.g., Sentry)

### SEO Monitoring
- Submit sitemap to Google Search Console
- Monitor search rankings
- Track organic traffic
- Monitor page indexing status

## Maintenance

### Regular Updates
- Keep dependencies updated
- Monitor security vulnerabilities
- Update content and images regularly
- Review and update SEO metadata

### Backup Strategy
- Regular database backups (if applicable)
- Version control for all code changes
- Document all configuration changes
- Maintain staging environment for testing

## Troubleshooting

### Common Issues
1. **White screen on deployment**: Check console for JavaScript errors
2. **Images not loading**: Verify image paths and CDN configuration
3. **Forms not working**: Check EmailJS configuration and API keys
4. **Analytics not tracking**: Verify Google Analytics ID and implementation

### Debug Mode
Enable debug mode by setting `VITE_DEBUG_MODE=true` to see detailed logs.

## Support

For technical support or questions about deployment:
- Check the project documentation
- Review error logs and console messages
- Test in development environment first
- Contact the development team if issues persist