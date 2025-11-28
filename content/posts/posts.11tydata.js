module.exports = {
  eleventyComputed: {
    permalink: function(data) {
      if ((data.type === 'post' || !data.type) && data.page && data.page.filePathStem) {
        const categories = data.categories || [];
        const categorySlug = categories.length > 0 
          ? require('slugify')(categories[0], { lower: true, strict: true }) 
          : 'uncategorized';
        const postSlug = data.page.filePathStem.split('/').pop();
        return `/${categorySlug}/${postSlug}/`;
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

