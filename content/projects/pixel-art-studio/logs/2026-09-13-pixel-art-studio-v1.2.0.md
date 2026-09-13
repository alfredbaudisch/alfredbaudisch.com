---
layout: "layouts/project-log.njk"
title: "Pixel Art Studio v1.2.0"
date: "2026-09-13T09:00:00.000Z"
type: "project-log"
parentProject: "pixel-art-studio"
logCategories: ["Update", "New Release"]
projectStyles: ["Gamedev", "Hand-Painted Texture", "PS1", "Pixel Art", "N64"]
tools: ["Blender", "Aseprite"]
tags: ["N64", "PS1", "Blender", "Aseprite", "Plugin", "Tools", "Pixel Art", "Gamedev", "Texturing", "Texture", "Texture Painting"]
metaDescription: "<TODO META>"
---

## Clipping Layers and Transparency Masks

In the new layer options menu, you can now Clip a Layer with the Layer Below (same functionality like Photoshop), as well add a Mask, which works like Krita's transparency masks and Photoshop masks. You can also toggle the masks on and off.

To open the layer options menu, click the arrow button to the right of the layers list (see the GIF below).

![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-v1.2.0-01-01-clipping-masks.gif)

## New selection engine: Paper Fold

The Paper Fold engine "folds" pixels and selections even in the most complex UV scenarios, for example, such as selections made on triangulated cylinder caps, which crosses over dozens of UV islands.

![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-v1.2.0-12-12-paper-fold.gif)

## Realtime Brush Preview and Brush Line

The viewport now displays the realtime preview of the brush and the eraser (size, shape, opacity and color). You can now also hold a shortcut to draw a line (and keep drawing it) with the brush tool. Place a pixel, then press the default shortcut CTRL+SHIFT+Click and move the mouse (shortcut customizable: _"Line from brush (hold and click)"_).

![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-v1.2.0-02-02-brush-preview-line.gif)

## Select by Topology and Fill by Topology

One of the biggest issues of 3D pixel art texture painting: sub-texels (aka half-pixels, UV fringes, diagonal UVs, etc). To solve this, all selection tools now have the option to select by Topology (default shortcut: CTRL+SHIFT+T), which selects all pixels (including the half-pixels). The Bucket Fill now also fills by Topology.

![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-v1.2.0-03-03-select-topology.gif)

## Bucket Fill and Gradient Bleed

Another tool to help counter half-pixels is the _Bleed_ option now available for both the Bucket Fill and the Gradient tools. This is also a kind of UV dilation and fill expansion.

![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-v1.2.0-04-04-bleed.gif)

## Layer Blending Modes

Layers and Groups can now be assigned a blending mode (Pixel Art Studio comes with most common blending modes, such as Multiply, Overlay, Screen, Color Dodge, etc), they are available under the list of layers.

![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-v1.2.0-05-05-blending-modes.gif)

## Non-destructive Layer Adjustments

You can now adjust the Brightness and Contrast, HSL (Hue, Saturation and Lightness) and Color Curves of layers. The adjustments can be stacked per layer and they can be re-adjusted and removed anytime (non-destructive). Adjustments are available in the new _Layer Extras_ panel.

![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-v1.2.0-06-06-layer-adjustments.gif)

## Flip and Transform (Move, Rotate, Scale, Skew) in 2D and 3D

You can now Flip selections and layers horizontally (SHIFT+H) and vertically (SHIFT+V). There's also a Transform tool (CTRL+T) with the Move, Rotate, Scaling and Skew operations both for layers and selections. Everything works in 3D on top of the model (3D transformations were _REALLY hard_ to implement) and in the Image Editor. 

Press ENTER to confirm the transform or ESC to cancel.

You have 3 options of pixel rotation algorithms when rotating transformations: Clean Rotation ([cleanEdge](https://torcado.com/cleanEdge/) by torcado, this one provides the cleanest results), Fast Rotation ([aseprite](https://github.com/aseprite/aseprite/blob/main/src/doc/algorithm/rotate.cpp)) and [RotSprite](https://en.wikipedia.org/wiki/Pixel-art_scaling_algorithms#RotSprite).

![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-v1.2.0-07-07-transform-flip.gif)

## Symmetry anchored by the Object in the 3D Viewport

It's now possible to anchor the 3D symmetry in the 3D viewport by the Object's Center or by the 3D Cursor. For that, when activating any of the symmetry tools, click _Object_ and then optionally _Mirror at 3D Cursor_.

![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-v1.2.0-08-08-symmetry-object.gif)

## Custom Brushes (local or global)

To create a custom brush:
- Draw in the Image Editor, with only black pixels
- Select the pixels and any extra transparent pixels that you want part of the brush
- Activate the Brush tool again
- In the _Shape_ dropdown (where it says _Circle_ or _Square_), select _Custom_.
![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-brush-shapes.png)

- Click the _+_ button, set a name for the brush and select whether you want to mark the brush as an asset (so it's accessible in Blender's Asset Browser) and whether you want the brush available globally in Blender (_Save into the add-on preferences_).
![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-add-custom-brush.png)

You can use the custom brush in the Image Editor and in the 3D Viewport. To select a custom brush, go to the same spot as before, select _Custom_ and choose the custom brush.
![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-custom-brush.png)

If you saved into the add-on preferences, it's available in Edit > Preferences > Add-ons > Pixel Art Studio > Presets, and it's going to be available every time you use Pixel Art Studio, in any .blend file.

![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-v1.2.0-09-09-custom-brushes.gif)

## Text tool

Add text with the new Text tool both in the Image Editor or 3D Viewport projected onto the model:
- Input the text in the input text box (this is due to the complexity of text operations (select text, move cursor, etc), so I added a native Blender's input box) 
- Click the viewport to place the text
- You can now move and do transform operations with the text transformation
- You can also change the text options (bold, italic, font size and font face)
- Once done, press ENTER

![](/media/projects/pixel-art-studio/changelogs/v1.2.0/pixelartstudio-v1.2.0-10-10-text-tool.gif)

## Bucket Fill by Face or by Pixel toggles


## v1.2.0 Changelog

- **New feature:** New selection engine called "Paper Fold".
- **New feature:** Custom brushes. Custom brushes are created in the Image Editor, and can be persisted in the .blend file, marked as asset (to be shared in the Asset Browser) and persisted in the add-on preferences (for reuse in all .blend files).
- **New feature:** Transform layers and selections (scale, rotate, skew)
- **New feature:** Text tool
- **New feature:** Layer blending modes
- **New feature:** Layer adjustments
- **New feature:** Layer masks and clipping masks (like Photoshop and Krita)
- **New feature:** Bucket fill and gradient bleed (aka fill expansion, UV dilation)
- **New feature:** Import PNG as layer and Export layer as PNG
- **New feature:** Paste external image as layer
- **New feature:** Path and Polygon tool
- **New feature:** Flip selections horizontally and vertically
- **New feature:** _[TODO]_ Customize the selection marquee (transparent by default)
- **New feature:** hold CTRL+SHIFT while using the Brush tool to draw connecting lines and polygons
- **New feature:** Show the brush and the eraser shape, color and opacity under the cursor (brush ghosting)
- **New feature:** _[TODO]_ Bindable shortcuts for layer and group operations (Photoshop's like keybindings)
- **New feature:** _[TODO]_ Manage custom density presets
- **New feature:** The symmetry tools in the 3D viewport now have 4 modes: aligned with view (the only previous mode), centered aligned with the object, aligned with view at the 3D cursor, aligned with the object at the 3D cursor.
- **New feature:** The selection tools have a new selection method: "Select by Topology" (only for the 3D viewport), to select the whole contour of the topology, to allow for painting and filling half and corner pixels.
- **New feature:** _[TODO]_ A new temporary color picker has been added, "Eyedropper on Hover" to pickup colors without clicking, with customizable shortcuts. Default: SHIFT+ALT+X (the other temporary color picker with ALT+Left Click is still present).
- **New feature:** _[TODO]_ Pick colors from any object and from any area of the Blender viewport
- **New feature:** _[TODO]_ Translation (i18n) framework. Every public facing text is now an extracted string living in a single file, which can allow for translations in the future, making Pixel Art Studio multi-language.
- **Improvement:** _[TODO]_ The rectangle and ellipse drawing tools can now be filled with either the primary or secondary color. When filled with the secondary color, it gets an outline with the primary color.
- **Improvement:** _[TODO]_ Selection marching ants are smaller and faster, making them more readable.
- **Improvement:** _[TODO]_ Bucket fill fills enclosed areas that are split across multiple UV islands (ex: draw a shape on a cylinder cap that has been poked with triangles, the bucket fill is going to fill the shape and distribute each slice in each triangle's UV island).
- **Improvement:** _[TODO]_ Selection tools are faster in the Image Editor
- **Improvement:** _[TODO]_ The rectangle and ellipse tools now project straight between faces
- **Improvement:** _[TODO]_ The default shortcut for the temporary colorpicker is ALT+left mouse button click, aligned with other painting tools. Users that need the ALT key free (such as to rotate the viewport), can still customize the shortcut to something else (Preferences > Add-ons > Pixel Art Studio > Shortcuts > customize "Eyedropper (hold and click)").
- **Improvement:** _[TODO]_ The temporary colorpicker keeps picking colors as long as you hold the shortcut and move the mouse (ALT+left mouse click by default).
- **Improvement:** _[TODO]_ The bucket fill tool has 2 clear methods of filling with 2 toggle buttons: Fill by Pixels and Fill by Selected Faces.
- **Improvement:** _[TODO]_ The bucket fill method fill by face now fill the whole topology of the selected faces (including half-pixels).
- **Improvement:** _[TODO]_ When making a selection with the Wand Selection tool, then adjusting parameters (Tolerance, Contiguous), and clicking on top of the active selection again while the tool is still active, a new selection is performed with the new paramaters.
- **Improvement:** _[TODO]_ Hold SHIFT while placing a gradient to place straight gradients. Move to increment by 45 degrees.
- **Improvement:** _[TODO]_ When you have the Image Editor and 3D viewport side by side, colors picked in one viewport automatically are picked into the other.
- **Improvement:** _[TODO]_ Performance improvements when painting textures higher than 1024x1024 (validated and tested in a mesh with 2 4096x4096 textures).
- **Improvement:** _[TODO]_ Changes made with and within selections are now mirrored when a symmetry tool is active.
- **Bug fix:** _[TODO]_ using the Activator Shortcut in the Image Editor does not steal the focus from the shortcut from the 3D viewport (when having both viewports side by side, like with the Pixel Art Studio workspace).
- **Bug fix:** _[TODO]_ fixed a critical issue where the texture file would be replaced by stale layers when a blend file that previously had a Pixel Art Studio canvas was saved as another file. Now the file watcher conflict popup is triggered on file load when the file saved separately is opened.
- **Bug fix:** _[TODO]_ merge layer down correctly makes the destination layer the active layer, instead of the layer below it
- **Bug fix:** _[TODO]_ merging into the generated Pixel Art Grid layer, correctly merges the layer instead of deleting it.