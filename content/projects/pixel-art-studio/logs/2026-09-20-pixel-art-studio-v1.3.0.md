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
- **New feature:** New "Colors and Palettes" section with Blender's color wheel embedded into Pixel Art Studio's panel (it follows Blender's global Color Picker Type preference). The wheel can be hidden in the add-on preferences.
- **New feature:** Tiled Mode in the Image Editor (ported from [Pixelorama](https://github.com/orama-interactive/pixelorama)).
- **New feature:** Shading brush (ported from [Pixelorama](https://github.com/orama-interactive/pixelorama)).
- **New feature:** Pixel art Spray Can tool.
- **New feature:** Density Zones is now usable with new models (not only pre-existing models). You can select faces and assign a Density Zone to them while making the model, on the fly.
- **New feature:** Integration with Godot, Unity and Unreal Engine, a game engine pipeline to easily import and auto-update models and textures painted with Pixel Art Studio into game engines (auto-export when savin in Blender, as well auto create pixel art materials into the game project).
- **New feature:** Auto-export to GLTF and FBX on save.
- **New feature:** Brush and line tools bleed (UV dilation) like the paint bucket and gradient tools.
- **New feature:** The Eraser has the brush's line shortcuts: CTRL+SHIFT erases a straight line from the last stroke, and CTRL+SHIFT+ALT an angled one. It also has its own Bleed setting.
- **Improvement:** Pixel Art Unwrap relaxes curved Joined Faces instead of projecting them flat, tilted faces no longer lose pixels.
- **Improvement:** Much faster painting with Pixel Perfect on low poly models where every face is its own UV island. Long strokes across many small faces no longer get slower the longer you paint.
- **Improvement:** Density Zones management UI and tools revamped.
- **Improvement:** Increased performance of when drawing with brushes bigger than 36px.
- **Improvement:** Holding SHIFT when using the Line tool and moving the mouse now also draws isometric angled lines (straight, 45 degrees, and the 2:1 / 1:2 isometrics, the quarter turn cut at 18, 36, 54 and 72 degrees).
- **Improvement:** Holding CTRL+SHIFT+ALT when using the Brush tool and moving the mouse now also draws isometric angled lines (straight, 45 degrees, and the 2:1 / 1:2 isometrics, the quarter turn cut at 18, 36, 54 and 72 degrees).
- **Improvement:** Disable the Pixel Perfect button and algorithm for bigger brush sizes, as it cause performance issues and the algorithm does not make a difference past a size of 12px.
- **Improvement:** The gradient tool is mirrored when symmetry is active in the 3D viewport.
- **Improvement:** THIRD-PARTY-LICENSES updated with the additions from Pixelorama.
- **Bug fix:** Brushes that even sized (2, 4, 6, etc) correctly mirror to the other side when a symmetry tool is active, without leaving a 1px offset anymore.
- **Bug fix:** When the temporary eyedropper or eyedropper on hold is active, do not show the brush preview alongside the eyedropper.
- **Bug fix:** When activating the temporary eyedropper or eyedropper on hold shortcut, show them and pick the colors even if the mouse does not move.
- **Bug fix:** Fixed the brush preview (brush ghosting) for brushes bigger than 3px hovering faces with diagonal UVs.
- **Bug fix:** Big brushes no longer leak onto faces you cannot see. A stroke close to the edge of a thin or diagonal face used to spill onto a hidden face, into another UV island or into the empty space of the texture. It now paints only the faces it can reach on the surface from where you clicked, and stops where the surface turns away from you (for example under the brim of a hat).
- **Bug fix:** A big brush stroke at the edge of a face no longer paints a second copy, at an offset, of the part that was cut off at the edge.
- **Bug fix:** The brush paints the same texels whichever direction the stroke started from, fixes UV and face leaks.
- **Bug fix:** The brush no longer paints texels that are fully outside the UV of the face under it. To reach the half covered texels along a UV edge, use Bleed 0.5.
- **Bug fix:** Fixed Curved Path segments that go from the cap of a cylinder over its rim onto the side stay on their points.


{% projectLinks %}