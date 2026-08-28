---
layout: "layouts/project.njk"
title: "Pixel Art Studio"
date: "2026-08-26T18:00:00.000Z"
type: "project"
projectStatus: ["Active", "Completed"]
projectTypes: ["Software"]
projectStyles: ["Gamedev", "Hand-Painted Texture", "PS1", "Pixel Art", "N64"]
tools: ["Blender", "Aseprite"]
tags: ["N64", "PS1", "Blender", "Aseprite", "Plugin", "Tools", "Pixel Art", "Gamedev", "Texturing", "Texture", "Texture Painting"]
featuredImage: "/media/projects/pixel-art-studio/pixel-art-studio-cover.png"
featuredImageThumb: "/media/projects/pixel-art-studio/pixel-art-studio-cover-thumb.jpg"
links:
  - name: "itch.io"
    url: "https://alfredbaudisch.itch.io/pixel-art-studio"
  - name: "Documentation"
    url: "https://pardalltools.github.io/pixel-art-studio-docs/"
---

Pixel Art Studio is a Blender add-on for **pixel perfect pixel art texture painting**. It supports drawing and painting **pixel art inside Blender**, in the 3D Viewport on top of the model (in Object and Edit modes) and in 2D in the Image Editor. It has tools for drawing and painting (including colors, palettes, layers, pressure sensitivity, bucket fill, gradients), selecting and moving pixels, and quickly setting up the model and the viewport for pixel art. The plugin also helps with setting up and managing multiple texture densities per mesh, allowing for **uniform pixel sizes across the whole mesh or per face pixel size variation**.

<video controls="" src="/media/projects/pixel-art-studio/showcasepixelart-studio-better-start-small.mp4"></video>

## Summary of Features

- **Pixel perfect drawing and painting pixel art tools**: brush / pencil, eraser, line, rectangle, ellipse, bucket fill (by pixels, by selected faces, by color), blur, gradient (with dithering options), opacity, color picker, pressure sensitivity.
   - All tools have pixel perfect line handling algorithms.
- Pixel selection: rectangle, ellipse, lasso, magic wand, invert selection.
   - The selection tools work on the 2D and 3D viewports, and you can drag selected pixels across the faces of the model.
- 2D and 3D viewport **pixel grid overlay**.
- **Mirror and symmetry drawing** on the 2D and 3D viewports.
- **Color swatches and color palettes** (and a palette library with more than 500 predefined palettes).
- **Layers** and layer management with locking, grouping, merging and visibility toggling, similar to painting programs.
- One-click pixel size and **pixel density** setup with predefined presets, as well texel density detection for existing meshes (you can have chunky pixels and fine, detailed pixels).
- One-click setup buttons to **setup the viewport for pixel art** (grid size and snapping adjusted to the pixel size) and to UV unwrap the model for instant pixel art painting (*notice: auto UV unwrapping is very basic, for the majority of models you are still going to need to manually unwrap UVs*).
- **Density Zones** (*optional*): assign and manage texel density values per face, allowing for **uniform pixel size across the whole mesh or different pixel sizes per face**.
   - Different density zones **automatically resizes Blender's grid on the fly**, when you hover different faces of the model, in the 3D viewport.

{% projectLinks %}

## Pixel Art Studio features in details

Every drawing, selection and layer tool works in the **3D Viewport and in the Image Editor**, in **perspective and orthographic** views, so you can move the camera around freely while painting.

- **Drawing and painting tools**

  - All tools are directly inspired by [Aseprite](https://www.aseprite.org/), so you are going to feel right at home.
  - All tools have **pixel perfect line handling** algorithms (with the brush and line tool, it removes the doubled L corners, with the ellipse, it creates pixel perfect circles and ellipses).  
  - **Brush** (<kbd>B</kbd>): freehand painting as a `Circle` or `Square` brush, free size selection as well presets for `1 2 3 4`, <kbd>[</kbd> <kbd>]</kbd> to increase/decrease the size on the viewport.
  - **Eraser** (<kbd>E</kbd>): erases to transparent, with opacity control.
  - **Adjustable opacity, applied stroke-relative**: like [Aseprite](https://www.aseprite.org/), dragging over the same texels twice inside one stroke applies the opacity **once**.
  - **Line** (<kbd>L</kbd>): pixel perfect stair steps. <kbd>Shift</kbd> snaps to 45 degrees.
  - **Rectangle** (<kbd>U</kbd>) and **Ellipse** (<kbd>O</kbd>): outlined (stamped with the current brush) or filled, <kbd>Shift</kbd> constrains to a square or a circle (the preview is the final pixels).
  - **Bucket fill** (<kbd>G</kbd>), two modes:

    - `Fill by Pixels`: flood fill the active layer or the active selection with an adjustable **tolerance**. When `Contiguous` is off it is a global/selection color replace.
    - `Mesh Faces`: fills the UV area of the selected faces (or every face if nothing is selected).

  - **Blur** (<kbd>H</kbd>): box blur, pixel aware (it never makes sub-pixels).
  - **Gradient** (<kbd>D</kbd>): two color gradient, `Linear` or `Radial`, with **ordered dithering** (`Bayer 2x2`, `4x4`, `8x8`) or `Smooth` (fills selection or whole canvas).
  - **Eyedropper** (<kbd>I</kbd>) and <kbd>Alt+click</kbd>.
  - **Move** (<kbd>V</kbd>): drags a layer or a selection around.
  
    - `Auto Select Layer`: auto selects the layer at click position.

  - **Tablet pressure**: pressure toggles for `Size` and `Opacity`.
  - **Pixel grid** overlay in the Image Editor and in 3D Viewport overlayed on top of the model (color and thickness configurable).
  - **Mirror and symmetry drawing**: `Horizontal`, `Vertical`, `45` and `135` (they can be combined for multi-axis symmetry).

- **Pixel selection**

  - **Marquee** (<kbd>M</kbd>), **Ellipse** (<kbd>Shift+M</kbd>), **Lasso** (<kbd>Q</kbd>) and **Magic Wand** (settings: `Tolerance` and `Contiguous`) (while a selection is active, tools affect only the selected pixels).

    - <kbd>Shift</kbd> adds to selection, <kbd>Alt</kbd> removes from selection (with any of the drag tools).

  - **Drag and move selections**: directly in the texture in the Image Editor and on the model in 3D, across the faces. <kbd>Ctrl</kbd> while dragging duplicates the selection instead of moving it.
  - **Copy, cut and paste across layers** (<kbd>Ctrl+C</kbd> / <kbd>Ctrl+X</kbd> / <kbd>Ctrl+V</kbd>).
  - **Selecting in 3D is per texel**: it uses a depth buffer, which causes selection to affect only the texels you are truly selecting.

- **Colors, swatches and palettes**

  - **Primary and secondary color**: <kbd>X</kbd> to alternate between 2 colors and <kbd>Shift+X</kbd> to walk swatches from your palette.
  - **Custom palettes** by adding swatches (add colors clicking the `+` and remove with <kbd>Ctrl+click</kbd>) or by **importing PNG palettes** (for example, palettes from **Lospec**).
  - **Lospec palette library**: 500 palettes bundled with the add-on.

- **Layers and Groups**

  - **Layers** like in painting programs: add, remove, duplicate, move up and down, merge down and merge selected, lock, visibility, opacity.
  - **Groups**: group and ungroup layers, group opacity and visibility (affects all layers inside the group).

- **Pixel size and pixel density (texel density)**

  - **One-click pixel size setup**: this solves one of the biggest pain points of doing pixel art in Blender, it makes pixels uniform across the model or per face (see `Density Zones` below). 
  - **Density presets**: `Low Density` (chunky pixels), `Medium Density` (default), `High Density`, `Very High Density` and `Custom`.
  - `Apply Texel Density`: scales the UVs of the selected objects so every texel is the same size, then snaps them to the texel grid.
  - `Detect Texel Density`: detects the pixel size of the model.

    - **Auto pixel size detection for pre-existing textured models**

- **Viewport and scene setup**

  - `Setup Viewport`: one click button to setup Blender's grid and snapping so that **one grid square is exactly one texel** at the current density / current pixel size.
  - `Setup Pixel Art Canvas`: the wizard to create the texture, with a dimensions for the current texture density.
  - **Pixel Art workspace**: `Image Editor` on the left and the `3D Viewport` on the right. 

- **Pixel Art Unwrap**

  - Basic UV unwrap made for pixel art.

  > **Note:** Auto UV unwrapping is very basic. For the majority of models you are still going to need to manually unwrap the UVs, and then use Pixel Art Studio's density tools on top of your own layout.

- **Density Zones** (*optional, advanced*, multiple pixel sizes per model):

  - Assign and manage **texel density values per face**, for **uniform pixel size across the whole mesh or different pixel sizes per face** (a character's head drawn at twice the density of the legs, for example, which means smaller and more pixels for the head).
  - `Detect Density Zones` measures the model island by island and **clusters** them into zones automatically.
  - Build zones **from selected faces**, with custom names and densities.
  - `Grid Follows the Face`: while you paint in the 3D Viewport, **Blender's grid is resized and re-pointed on the fly** at the density of the face under the cursor, **to keep one grid square at the size of one pixel for that specific face**.

- **Extras and Blender integration**

  - Undo history (you can undo and redo everything alongside Blender).
  - **Tools and settings popup**: press <kbd>F</kbd> over either editor for a floating panel with the tools and their settings.
  - Painting on the model works in **Object and in Edit mode**, and you can alternate between Pixel Art Studio's tools and Blender's own tools on the fly.
  - The canvas is a normal Blender image: it's packed into the .blend, and it renders and exports like any other texture.

> **Note:** Pixel Art Studio requires **Blender 5.1 or higher**

{% projectLinks %}