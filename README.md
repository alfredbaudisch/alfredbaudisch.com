# Alfred Reinold Baudisch - Personal Website

A static website built with [11ty (Eleventy)](https://www.11ty.dev/) static site generator, migrated from WordPress.

## Features

- **Content Types**: [Blog posts](https://alfredbaudisch.com/blog), [Projects](https://alfredbaudisch.com/projects), Project Logs, [Experiments](https://alfredbaudisch.com/experiments), Experiment Logs
- **Custom Taxonomies**: Project Styles, Project Status, Tools, Project Types, Log Categories, Experiment Types, Tags, Categories.
  - See [example post](content/experiments/154-blender-geometry-nodes/index.md) with taxonomy usage.
- **Archives**: post and taxonomies archive pages, as well [sitemap](https://alfredbaudisch.com/sitemap), [sitemap.xml](https://alfredbaudisch.com/sitemap.xml) and [RSS feed](https://alfredbaudisch.com/feed.xml).
- **Image Galleries**: Lightbox functionality with keyboard and touch navigation
- **SEO optimized**
- **Syntax Highlighting**: Code blocks with copy-to-clipboard
- **Responsive Design**: Mobile-first, lightweight CSS
- **Automated Deployment**: GitHub Actions to Ubuntu VPS

## Project Structure

```
alfredbaudisch/
├── content/              # Content files (markdown)
│   ├── posts/          # Blog posts
│   ├── projects/       # Projects and project logs
│   ├── experiments/    # Experiments and experiment logs
│   ├── pages/          # Static pages (About, Contact)
│   └── media/          # Images and media files
├── _includes/          # Templates and components
│   ├── layouts/       # Page layouts
│   ├── components/     # Reusable components
│   └── macros/         # Nunjucks macros
├── _data/             # Site data (JSON)
├── public/             # Static assets (CSS, JS)
├── scripts/           # Migration and utility scripts
└── .eleventy.js       # 11ty configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd alfredbaudisch
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:8080`

### Build

Build the site for production (includes JavaScript bundling and minification):
```bash
npm run build
```

This will:
1. Bundle and minify all JavaScript files (including Prism.js) into a single `main.js` file
2. Build the static site with Eleventy

The built site will be in the `_site` directory.

**Development build** (unminified, with source maps):
```bash
npm run build:js:dev && npm run serve
```

**Production build** (minified, optimized):
```bash
npm run build
```

**Deployment**:
```bash
npm run deploy
```

## WordPress Migration

### Step 0: Configuration
Use WordPress Application Passwords (recommended for WordPress 5.6+).

Generate an Application Password in WordPress:
- Log into WordPress admin
- Go to Users → Your Profile (or Users → All Users → Edit your user)
- Scroll to "Application Passwords"
- Enter a name (e.g., "Migration Script")
- Click "Add New Application Password"
- Copy the generated password (shown once)

Use these credentials:

```
const config = {
    url: 'https://alfredbaudisch.com',
    output: path.join(__dirname, 'data'),
    username: 'wordpress-username',
    password: 'xxxx xxxx xxxx xxxx xxxx xxxx'  // WordPress Application Password (with spaces)
};
```

Or via command line:
```
node scripts/migrate/export-wp.js --url=https://alfredbaudisch.com  --username=wordpress-username --password="xxxx xxxx xxxx xxxx xxxx xxxx"
```

#### WordPress Configuration
- Ensure REST API is enabled (default in WordPress 4.7+)
- Test: Visit https://alfredbaudisch.com/wp-json/wp/v2/posts
- You should see JSON data

For custom post types, ensure REST API support is enabled:
```
// In the theme's functions.php or plugin
register_post_type('projects',
  array(
    'public' => true,
    'show_in_rest' => true, // This enables REST API
    // ... other args   
  )
);
```

For custom taxonomies:
```
register_taxonomy('project_styles', 'project',
  array(
    'public' => true,
    'show_in_rest' => true,
    // ... other args
  )
);
```

##### Testing the Connection
- Test without auth (public posts): `curl https://alfredbaudisch.com/wp-json/wp/v2/posts`
- Test with auth (all post types): `curl -u "username:password" https://alfredbaudisch.com/wp-json/wp/v2/projects`

If you see JSON data, the REST API is working. If you get authentication errors, check that Application Passwords are enabled.

### Step 1: Export WordPress Content

Export the WordPress content using the provided script:

```bash
node scripts/migrate/export-wp.js --url=https://alfredbaudisch.com --username=user --password=application-password
```

### Step 2: Process Content

Process the exported content:

```bash
# Process posts
node scripts/migrate/process-posts.js
# Process pages
node scripts/migrate/process-pages.js
# Process projects and project logs
node scripts/migrate/process-projects.js
# Process experiments and experiment logs
node scripts/migrate/process-experiments.js
```

### Step 3: Migrate Media

Download and organize media files:

```bash
WP_URL=https://alfredbaudisch.com node scripts/migrate/process-media.js
```

Note: The media script downloads featured images. For full media migration, it's necessary to manually download `wp-content/uploads` from the WordPress server.

### Step 4: Review and Adjust

- Review the generated markdown files in `content/`
- Adjust frontmatter as needed
- Update image paths if necessary
- Test the site locally: `npm run dev`

## Deployment

### VPS Setup

1. Run the VPS setup script on the server:
```bash
bash scripts/deploy/vps-setup.sh
```

2. Update the Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/alfredbaudisch.com
```

3. Set up SSL with Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d alfredbaudisch.com -d www.alfredbaudisch.com
```

### GitHub Actions Configuration

Configure the following secrets in the GitHub repository:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`: Private SSH key

### Deployment Flow

#### GitHub
1. Push changes to the `master` branch
2. GitHub Actions automatically:
   - Builds the site
   - Deploys to VPS
   - Updates the symlink
   - Reloads Nginx

#### Locally
To deploy from the development machine simply call `npm run deploy`

## Content Management

### Creating a New Blog Post

Create a markdown file in `content/posts/`:

```markdown
---
title: "My Blog Post"
date: 2024-01-15
tags: ["tag1", "tag2"]
featuredImage: "/media/posts/my-post/featured.jpg"
---

Content here...
```

### Creating a New Project or Experiment

1. Create a directory: `content/projects/my-project/`
2. Create `index.md`:

```markdown
---
layout: project.njk
title: "My Project"
date: 2024-01-15
type: project
projectStyles: ["Modern"]
projectStatus: "active"
projectTypes: ["Web Development"]
tools: ["11ty", "JavaScript"]
featuredImage: "/media/projects/my-project/featured.jpg"
---

Project description...
```

3. Create project logs in `content/projects/my-project/logs/`:

```markdown
---
layout: project-log.njk
title: "Log Entry"
date: 2024-01-20
type: project-log
parentProject: my-project
logCategories: ["Development"]
---

Log content...
```

### Image Galleries

Use the `imageGallery` shortcode:

```markdown
{% imageGallery [
  { src: "/media/image1.jpg", caption: "Caption 1" },
  { src: "/media/image2.jpg", caption: "Caption 2", link: "https://example.com" }
] %}
```

### Code Blocks

Use standard markdown code fences:

````markdown
```javascript
function hello() {
  console.log("Hello, World!");
}
```
````

### Taxonomies
Each post type has a different set of taxonomies.

- **Posts**: `categories`, `tags`
- **Projects**: `tools`, `projectTypes`, `projectStyles`, `projectStatus`, `tags`
- **Experiments**: `tools`, `experimentTypes`, `projectStyles`, `projectStatus`, `tags`

### Properties
- **Post image**: `featuredImage`, `featuredImageThumb`, `featuredImageSmall`. All of them are optional, but you cannot provide a `thumb` or `small` image when `featuredImage` is not set.
- `processImage`
- `links`

Example post frontmatter that uses them all ([see it live on the website](https://alfredbaudisch.com/experiments/3d-art/154-blender-geometry-nodes/)):

```yaml
---
layout: "layouts/experiment.njk"
title: "154: Re-learning Blender 3.0 Geometry Nodes"
date: "2022-01-13T23:44:08.000Z"
updated: "2022-01-14T00:00:00.000Z"
type: "experiment"
tags: ["geometry nodes"]
experimentTypes: ["3D Art"]
tools: ["Blender"]
featuredImage: "/media/wp-content/2022/01/154-blender-geometry-nodes-learning12.gif"
featuredImageThumb: "/media/wp-content/2022/01/154-blender-geometry-nodes-learning12-768x421.gif"
featuredImageSmall: "/media/wp-content/2022/01/154-blender-geometry-nodes-learning12-300x165.gif"
processImage: "/media/wp-content/2022/01/155-process-blender1.jpg"
projectStyles: ["Procedural"]
links:
  - name: "Easy Geometry Nodes PLANTS - Blender 3.0"
    url: "https://www.youtube.com/watch?v=VTkUVtWbjoE"
  - name: "Blender 3.0 New Geometry Nodes Tutorial"
    url: "https://www.youtube.com/watch?v=UqRVxosrnGc"
  - name: "Geometry Nodes Blender 3.0 Tutorial - Make A Trash Dump Fast"
    url: "https://www.youtube.com/watch?v=M14iZxkUUAQ"
  - name: "What are Fields? - Geometry Nodes 101"
    url: "https://www.youtube.com/watch?v=8FCHcbpnFss"
  - name: "Create and Animate a Procedural Castle in Blender"
    url: "https://skl.sh/3Fqlcqw"
---
```

## Customization

### Updating Site Metadata

Edit [content/_data/site.json](content/_data/site.json):

### Updating Navigation

Edit [content/_data/navigation.json](content/_data/navigation.json).

## Development

### Available Scripts

- `npm run build` - Build the site for production
- `npm run serve` - Build and serve locally
- `npm run dev` - Build, serve, and watch for changes
- `npm run deploy` - Build for production and deploy into the VPS server

### Adding New Collections

Edit `.eleventy.js` to add new collections (aka "post type"):

```javascript
eleventyConfig.addCollection("myCollection", function(collectionApi) {
  return collectionApi.getFilteredByGlob("content/my-collection/*.md");
});
```

## License

MIT License - Copyright (c) 2025 Alfred Reinold Baudisch

## Author

Alfred Reinold Baudisch