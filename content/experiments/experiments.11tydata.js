module.exports = {
  eleventyComputed: {
    permalink: function(data) {
      if (!data.page || !data.page.filePathStem) return data.permalink;
      
      const filePathStem = data.page.filePathStem;
      const slugify = require('slugify');
      
      // Experiments: /experiments/[type-slug]/[experiment-slug]/
      if (data.type === 'experiment' && filePathStem.includes('/experiments/') && filePathStem.endsWith('/index')) {
        const experimentTypes = data.experimentTypes || [];
        const typeSlug = experimentTypes.length > 0 
          ? slugify(experimentTypes[0], { lower: true, strict: true }) 
          : 'uncategorized';
        const experimentSlug = filePathStem.split('/').slice(-2, -1)[0];
        return `/experiments/${typeSlug}/${experimentSlug}/`;
      }
      
      // Experiment logs: /experiment-logs/[slug]/
      if (data.type === 'experiment-log' && filePathStem.includes('/experiments/') && filePathStem.includes('/logs/')) {
        const logSlug = filePathStem.split('/').pop();
        return `/experiment-logs/${logSlug}/`;
      }
      
      return data.permalink;
    },
    autoDescription: function(data) {
      // Only generate if metaDescription and description are not set
      if (data.metaDescription || data.description) {
        return null;
      }
      
      // Try to get templateContent from the page, or read from file
      let templateContent = data.page?.templateContent;
      
      // If templateContent is not available, try reading from inputPath
      if (!templateContent && data.page?.inputPath) {
        try {
          const fs = require('fs');
          templateContent = fs.readFileSync(data.page.inputPath, 'utf8');
        } catch (e) {
          return null;
        }
      }
      
      if (!templateContent || typeof templateContent !== 'string') {
        return null;
      }
      
      // Helper function to generate description
      function generateMetaDescription(content, maxLength = 155) {
        if (!content || typeof content !== 'string') return '';
        
        let text = content
          .replace(/^---[\s\S]*?---\s*/m, '') // Remove frontmatter
          .replace(/\{%[\s\S]*?%\}/g, '') // Remove Nunjucks templating (shortcodes, includes, etc.)
          .replace(/\{\{[\s\S]*?\}\}/g, '') // Remove Nunjucks variables
          .replace(/!\[([^\]]*)\]\([^\)]*\)/g, '') // Remove markdown images (must come before links)
          .replace(/\[([^\]]*)\]\([^\)]*\)/g, '$1') // Remove markdown links, keep text
          .replace(/```[\s\S]*?```/g, '') // Remove code blocks
          .replace(/`[^`]*`/g, '') // Remove inline code
          .replace(/#{1,6}\s+/g, '') // Remove markdown headers
          .replace(/\*\*([^\*]*)\*\*/g, '$1') // Remove bold
          .replace(/\*([^\*]*)\*/g, '$1') // Remove italic
          .replace(/<[^>]*>/g, '') // Remove any HTML tags
          .replace(/&nbsp;/g, ' ') // Replace HTML entities
          .replace(/&[a-z]+;/gi, ' ') // Replace other HTML entities
          .replace(/!\s*/g, ' ') // Remove any remaining standalone exclamation marks
          .replace(/\n+/g, ' ') // Replace newlines with spaces
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .trim();
        
        if (text.length > maxLength) {
          text = text.substring(0, maxLength);
          const lastSpace = text.lastIndexOf(' ');
          if (lastSpace > 0) {
            text = text.substring(0, lastSpace);
          }
          text += '...';
        }
        
        return text;
      }
      
      return generateMetaDescription(templateContent, 155);
    }
  }
};

