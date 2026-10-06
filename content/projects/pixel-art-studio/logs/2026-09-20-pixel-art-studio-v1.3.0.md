---
layout: "layouts/project-log.njk"
title: "Pixel Art Studio for Blender v1.3.0!"
date: "2026-09-30T09:00:00.000Z"
type: "project-log"
draft: true
parentProject: "pixel-art-studio"
logCategories: ["Update", "New Release"]
projectStyles: ["Gamedev", "Hand-Painted Texture", "PS1", "Pixel Art", "N64"]
tools: ["Blender", "Aseprite"]
tags: ["N64", "PS1", "Blender", "Aseprite", "Plugin", "Tools", "Pixel Art", "Gamedev", "Texturing", "Texture", "Texture Painting", "UV"]
featuredImage: "/media/projects/pixel-art-studio/changelogs/v1.2.0/pixel-art-studio-1.2.0-cover.png"
featuredImageThumb: "/media/projects/pixel-art-studio/changelogs/v1.2.0/pixel-art-studio-1.2.0-cover-thumb.jpg"
metaDescription: "Now with one-click UV tools, shared UVs, joined faces, fill patterns, tiled mode, shading, spray can, game engine integrations and more! See all the new features."
---

{% projectLinks %}

{% toc %}

## v1.3.0 Changelog

- **New feature:** Multiple new UV tools and new options to "Pixel Art Unwrap".
  - New _UV Tools_ section in the UV panel. Pixel Art Unwrap options are now in their own _Unwrap Options_ section.
  - _Share UVs_: stacks the selected faces on the same UV spot, so they paint the same pixels (ex: the 8 sides of a cylinder painted only once). The last selected face is the source, and _Match Size_ also resizes the other faces to the source's size. Click the X button to unshare.
  - _Keep Together (Join)_: neighbouring faces stay connected as one UV island when running Pixel Art Unwrap (to preserve the shape of the mesh, like a character's face), instead of each face becoming its own island. Click the X button to release them.
  - _Select Linked UV Faces_: selects every face that is shared or joined with the selected faces.
  - _Flip Islands H_ and _Flip Islands V_: flips UV islands in place.
  - _Quick Unwrap Model_: unwraps the whole model from any mode (Object, Edit, Sculpt, Paint) and goes back to the mode and selection you had, so you don't have to manually go to Edit Mode > select all faces > Unwrap > and back again to where you were at.
  - New _Shared Faces_ and _Joined Faces_ lists: every group gets a name and a color, and can be selected and removed from the list. Selecting a face in Edit Mode also selects its group in the list, and the group is highlighted in the 3D Viewport and in the UV Editor.
  - Each joined group can choose how Pixel Art Unwrap unwraps it: _Relax_, _Keep Aspect_ (keeps the proportions of the current UVs) or _Keep Shape_ (keeps the island exactly as drawn, only scaled to the texel density). A group can also be a single face, to keep the shape or aspect of just that face.
  - Pixel Art Unwrap now lays each face flat in its own plane, keeping its exact shape and pixel density.
  - New Unwrap Options:
    - _Margin (px)_: whole pixels between islands.
    - _Avoid Shearing and Diagonal Pixels_: faces keep their exact shape and pixel density. When turned off, every corner goes onto a pixel corner, there are no partial pixels, but faces that are not rectangles bend a little.
    - _Snap Corners Within_: faces that are already almost on the pixel grid are snapped onto it, and the others keep their exact shape.
    - _Keep Pinned UVs_: pinned UVs stay where they are, other faces are packed around them.
    - _Keep Density Zones_: each face is scaled by the density of its zone, instead of one density for the whole model.
    - _Keep Pixel Aspect_: each face keeps the pixel aspect measured for its zone, the unwrap keeps the proportions of the original UVs.
    - _Joined Faces Layout_: _Unfold_ (every face keeps its exact shape), _Relax_ (one piece, for curved surfaces), _Project_ (seen from one direction) or _Auto_ (unfolds when the faces can lie flat, relaxes when they are curved).
- **New feature:** New Density Zones tools and algorithms. Management UI and tools revamped.
  - Density zones now also have a pixel aspect (pixels taller than they are wide, or the other way around, which is common in PS1 models). _Detect Density Zones_ measures it and splits a zone when its islands have different aspects (very thin islands, under 4 pixels, are ignored for the aspect).
  - _Measure Aspect_: measures the aspect of existing zones and keeps their names and densities (useful for zones made or renamed by hand).
  - Each zone's _Pixel Aspect_ can be edited below the list.
  - Pixel Art Unwrap respects the zones and their aspect with _Keep Density Zones_ and _Keep Pixel Aspect_ (ex: a character's face now unwraps with the same proportions as the face topology).
  - _Apply to Faces_: Density Zones is now usable with new models (not only pre-existing models). You can select faces and assign a Density Zone to them while making the model, on the fly. Gives the selected faces the zone picked in the list and scales their UV islands to its density, it's how you can assign different pixel sizes for the same model.
  - _Clear Zones_ now asks for confirmation before clearing.
  - The canvas setup wizard also has _Keep Density Zones_, and the texture size it suggests takes the zones into account.
- **New feature:** Fill Patterns and Dithering Patterns for all drawing tools (including brush, shapes, eraser, bucket fill, etc), inspired by [Graphics Gale](https://github.com/PardallTools/pixel-art-studio-docs/issues/61). The patterns can be filled with 2 colors or with primary color + transparency.
- **New feature:** Custom pattern management.
- **New feature:** New _Brushes and Patterns_ section, with galleries for the brush shapes and the patterns.
- **New feature:** Show active tool icon at mouse position (tool cursor), so you know which tool is currently active without having to look at the toolbar. The icon follows the brush size radius.
  - The selection cursor shows + or - when SHIFT adds to or ALT removes from a selection.
- **New feature:** Show color being picked with the eyedropper, at the cursor's position, over the viewport (inspired by Krita).
- **New feature:** New "Colors and Palettes" section with Blender's color wheel embedded into Pixel Art Studio's panel (it follows Blender's global Color Picker Type preference). The wheel can be hidden in the add-on preferences.
  - New swap button for the two colors (same as the X shortcut).
- **New feature:** Tiled Mode in the Image Editor (ported from [Pixelorama](https://github.com/orama-interactive/pixelorama)).
- **New feature:** Shading brush (ported from [Pixelorama](https://github.com/orama-interactive/pixelorama)).
- **New feature:** Pixel art Spray Can tool.
- **New feature:** Integration with Godot, Unity and Unreal Engine, a game engine pipeline to easily import and auto-update models and textures painted with Pixel Art Studio into game engines (auto-export when saving in Blender, as well auto create pixel art materials into the game project).
- **New feature:** Auto-export to GLTF and FBX on save.
- **New feature:** Every glTF export out of Blender, including a plain File > Export, writes the canvas as unlit pixel art (nearest filtering, alpha cutout). It can be turned off with the _Unlit Pixel Art in glTF_ switch.
- **New feature:** Brush and line tools bleed (UV dilation) like the paint bucket and gradient tools.
- **New feature:** The Eraser has the brush's line shortcuts: CTRL+SHIFT erases a straight line from the last stroke, and CTRL+SHIFT+ALT an angled one. It also has its own Bleed setting.
- **Improvement:** Pixel Art Unwrap relaxes curved Joined Faces instead of projecting them flat, tilted faces no longer lose pixels.
- **Improvement:** Much faster painting with Pixel Perfect on low poly models where every face is its own UV island. Long strokes across many small faces no longer get slower the longer you paint.
- **Improvement:** Increased performance when drawing with brushes bigger than 36px.
- **Improvement:** Holding SHIFT when using the Line tool and moving the mouse now also draws isometric angled lines (straight, 45 degrees, and the 2:1 / 1:2 isometrics, the quarter turn cut at 18, 36, 54 and 72 degrees).
- **Improvement:** Holding CTRL+SHIFT+ALT when using the Brush tool and moving the mouse now also draws isometric angled lines (straight, 45 degrees, and the 2:1 / 1:2 isometrics, the quarter turn cut at 18, 36, 54 and 72 degrees).
- **Improvement:** Disable the Pixel Perfect button and algorithm for bigger brush sizes, as it cause performance issues and the algorithm does not make a difference past a size of 12px.
- **Improvement:** The gradient tool is mirrored when symmetry is active, in the 3D viewport and in the Image Editor.
- **Improvement:** Painting in the 3D viewport stays instant over models with many thin faces.
- **Bug fix:** Brushes that are even sized (2, 4, 6, etc) correctly mirror to the other side when a symmetry tool is active, without leaving a 1px offset anymore.
- **Bug fix:** When the temporary eyedropper or eyedropper on hold is active, do not show the brush preview alongside the eyedropper.
- **Bug fix:** When activating the temporary eyedropper or eyedropper on hold shortcut, show them and pick the colors even if the mouse does not move.
- **Bug fix:** Fixed the brush preview (brush ghosting) for brushes bigger than 3px hovering faces with diagonal UVs.
- **Bug fix:** Big brushes no longer leak onto faces you cannot see. A stroke close to the edge of a thin or diagonal face used to spill onto a hidden face, into another UV island or into the empty space of the texture. It now paints only the faces it can reach on the surface from where you clicked, and stops where the surface turns away from you (for example under the brim of a hat).
- **Bug fix:** A big brush stroke at the edge of a face no longer paints a second copy, at an offset, of the part that was cut off at the edge.
- **Bug fix:** The brush paints the same texels whichever direction the stroke started from, fixes UV and face leaks.
- **Bug fix:** The brush no longer paints texels that are fully outside the UV of the face under it. To reach the half covered texels along a UV edge, use Bleed 0.5.
- **Bug fix:** Fixed Curved Path segments that go from the cap of a cylinder over its rim onto the side stay on their points.
- **Bug fix:** Selections on models with a Mirror modifier: the marquee, lasso and wand select where you drag, the marching ants show on the half you selected, and the selection can now be moved, as well when the UVs run past the texture's edge. The Magic Wand no longer crashes with a face selected in Edit Mode.
- **Bug fix:** The brush preview shows at every view angle and on faces with flipped normals, and big brushes in perspective are no longer speckled.
- **Bug fix:** A selection dragged on the model and quickly brought back no longer leaves a ghost (or copy) behind. Also it doesn't lose pixels along the way anymore.
- **Bug fix:** With a tool active in the UV Editor, G, R and S stay Blender's UV move, rotate and scale.
- **Bug fix:** Density Zones: _Setup Viewport_ no longer turns red after CTRL+Z, and the pixel grid stays on the zone's density.
- **Bug fix:** Section headers are readable on the Blender Light theme.
- **Bug fix:** Activating Pixel Art Studio in a workspace or view do not cause it to create a "zombie" activation onto another workspace or view. Example when you have the UV Editor and 3D Viewport side by side or when you jump between the Layout workspace and another workspace. Fixes https://github.com/PardallTools/pixel-art-studio-docs/issues/80.


{% projectLinks %}
