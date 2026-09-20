---
layout: "layouts/project-log.njk"
title: "Pixel Art Studio v1.3.0!"
date: "2026-09-30T09:00:00.000Z"
type: "project-log"
draft: true
parentProject: "pixel-art-studio"
logCategories: ["Update", "New Release"]
projectStyles: ["Gamedev", "Hand-Painted Texture", "PS1", "Pixel Art", "N64"]
tools: ["Blender", "Aseprite"]
tags: ["N64", "PS1", "Blender", "Aseprite", "Plugin", "Tools", "Pixel Art", "Gamedev", "Texturing", "Texture", "Texture Painting"]
featuredImage: "/media/projects/pixel-art-studio/changelogs/v1.2.0/pixel-art-studio-1.2.0-cover.png"
featuredImageThumb: "/media/projects/pixel-art-studio/changelogs/v1.2.0/pixel-art-studio-1.2.0-cover-thumb.jpg"
metaDescription: "Pixel Art Studio for Blender now has transforms, masks, blending modes, adjustments, custom brushes, text tool and much more! See all the new features."
---

{% projectLinks %}

{% toc %}

## v1.3.0 Changelog

- **New feature:** Multiple new UV tools and new options to "Pixel Art Unwrap".
- **New feature:** Fill Patterns and Dithering Patterns for all drawing tools (including brush, shapes, eraser, bucket fill, etc), inspired by [Graphics Gale](https://github.com/PardallTools/pixel-art-studio-docs/issues/61). The patterns can be filled with 2 colors or with primary color + transparency.
- **New feature:** Custom pattern management.
- **New feature:** Show active tool icon at mouse position, so you know which tool is currenty active without having to look at the toolbar. The icon follows the brush size radius.
- **New feature:** Show color being picked with the eyedropper, at the cursor's position, over the viewport (inspired by Krita).
- **New feature:** Tiled Mode in the Image Editor (ported from [Pixelorama](https://github.com/orama-interactive/pixelorama)).
- **New feature:** Shading brush (ported from [Pixelorama](https://github.com/orama-interactive/pixelorama)).
- **New feature:** Density Zones is now usable with new models (not only pre-existing models). You can select faces and assign a Density Zone to them while making the model, on the fly.
- **Improvement:** Density Zones management UI and tools revamped.
- **Improvement:** Increased performance of when drawing with brushes bigger than 36px.
- **Improvement:** Disable the Pixel Perfect button and algorithm for bigger brush sizes, as it cause performance issues and the algorithm does not make a difference past a size of 12px.
- **Improvement:** The gradient tool is mirrored when symmetry is active in the 3D viewport.
- **Improvement:** THIRD-PARTY-LICENSES updated with the additions from Pixelorama.
- **Bug fix:** When the temporary eyedropper or eyedropper on hold is active, do not show the brush preview alongside the eyedropper.
- **Bug fix:** When activating the temporary eyedropper or eyedropper on hold shortcut, show them and pick the colors even if the mouse does not move.

{% projectLinks %}