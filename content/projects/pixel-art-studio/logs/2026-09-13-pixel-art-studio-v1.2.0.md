---
layout: "layouts/project-log.njk"
title: "Pixel Art Studio v1.2.0"
date: "2026-09-13T09:00:00.000Z"
type: "project-log"
draft: true
parentProject: "pixel-art-studio"
logCategories: ["Update", "New Release"]
projectStyles: ["Gamedev", "Hand-Painted Texture", "PS1", "Pixel Art", "N64"]
tools: ["Blender", "Aseprite"]
tags: ["N64", "PS1", "Blender", "Aseprite", "Plugin", "Tools", "Pixel Art", "Gamedev", "Texturing", "Texture", "Texture Painting"]
metaDescription: "<TODO META>"
---

## v1.2.0 Changelog

- **New feature:** Custom brushes. Custom brushes are created in the Image Editor, and can be persisted in the .blend file, marked as asset (to be shared in the Asset Browser) and persisted in the add-on preferences (for reuse in all .blend files).
- **New feature:** Transform layers and selections (scale, rotate, skew)
- **New feature:** Text tool
- **New feature:** Layer blending modes
- **New feature:** Layer adjustments
- **New feature:** Layer masks and clipping masks (like Photoshop and Krita)
- **New feature:** Bucket tool bleed (UV dilation)
- **New feature:** Import PNG as layer and Export layer as PNG
- **New feature:** Paste external image as layer
- **New feature:** Path and Polygon tool
- **New feature:** Flip selections horizontally and vertically
- **New feature:** hold CTRL+SHIFT while using the Brush tool to draw connecting lines and polygons
- **New feature:** Customize the selection marquee (transparent by default)
- **New feature:** New selection engine called Paper Fold, that allows for pixel selection and movement even in the most complex UV scenarios, like triangulated cylinder caps.
- **New feature:** Show the brush and the eraser shape, color and opacity under the cursor (brush ghosting)
- **New feature:** Bindable shortcuts for layer and group operations (Photoshop's like keybindings)
- **New feature:** Manage custom density presets
- **New feature:** The symmetry tools in the 3D viewport now have 4 modes: aligned with view (the only previous mode), centered aligned with the object, aligned with view at the 3D cursor, aligned with the object at the 3D cursor.
- **New feature:** The selection tools have a new selection method: "Select by Topology" (only for the 3D viewport), to select the whole contour of the topology, to allow for painting and filling half and corner pixels.
- **New feature:** A new temporary color picker has been added, "Eyedropper on Hover" to pickup colors without clicking, with customizable shortcuts. Default: SHIFT+ALT+X (the other temporary color picker with ALT+Left Click is still present).
- **New feature:** Pick colors from any object and from any area of the Blender viewport
- **Improvement:** The rectangle and ellipse drawing tools can now be filled with either the primary or secondary color. When filled with the secondary color, it gets an outline with the primary color.
- **Improvement:** Selection marching ants are smaller and faster
- **Improvement:** Bucket fill fills enclosed areas that are split across multiple UV islands (ex: draw a shape on a cylinder cap that has been poked with triangles, the bucket fill is going to fill the shape and distribute each slice in each triangle's UV island).
- **Improvement:** Selection tools are faster in the Image Editor
- **Improvement:** The rectangle and ellipse tools now project straight between faces
- **Improvement:** The default shortcut for the temporary colorpicker is ALT+left mouse button click, aligned with other painting tools. Users that need the ALT key free (such as to rotate the viewport), can still customize the shortcut to something else (Preferences > Add-ons > Pixel Art Studio > Shortcuts > customize "Eyedropper (hold and click)").
- **Improvement:** The temporary colorpicker keeps picking colors as long as you hold the shortcut and move the mouse (ALT+left mouse click by default).
- **Improvement:** The bucket fill tool has 2 clear methods of filling with 2 toggle buttons: Fill by Pixels and Fill by Selected Faces.
- **Improvement:** The bucket fill method fill by face now fill the whole topology of the selected faces (including half-pixels).
- **Improvement:** When making a selection with the Wand Selection tool, then adjusting parameters (Tolerance, Contiguous), and clicking on top of the active selection again while the tool is still active, a new selection is performed with the new paramaters.
- **Improvement:** Hold SHIFT while placing a gradient to place straight gradients. Move to increment by 45 degrees.
- **Improvement:** When you have the Image Editor and 3D viewport side by side, colors picked in one viewport automatically are picked into the other.
- **Improvement:** Performance improvements when painting textures higher than 1024x1024 (validated and tested in a mesh with 2 4096x4096 textures).
- **Bug fix:** using the Activator Shortcut in the Image Editor does not steal the focus from the shortcut from the 3D viewport (when having both viewports side by side, like with the Pixel Art Studio workspace).
- **Bug fix:** fixed a critical issue where the texture file would be replaced by stale layers when a blend file that previously had a Pixel Art Studio canvas was saved as another file. Now the file watcher conflict popup is triggered on file load when the file saved separately is opened.
- **Bug fix:** merge layer down correctly makes the destination layer the active layer, instead of the layer below it
- **Bug fix:** merging into the generated Pixel Art Grid layer, correctly merges the layer instead of deleting it.