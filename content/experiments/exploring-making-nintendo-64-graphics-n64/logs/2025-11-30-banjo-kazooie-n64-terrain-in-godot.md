---
layout: "layouts/experiment-log.njk"
title: "How to make a Banjo Kazooie (N64) style terrain shader in Godot (blended textures with vertex colors)"
date: "2025-11-30T09:30:00.000Z"
type: "experiment-log"
tags: ["3d", "banjo-kazooie", "blender", "environment", "material", "n64", "shaders", "terrain", "vertex colors", "godot", "shader"]
parentExperiment: "exploring-making-nintendo-64-graphics-n64"
logCategories: ["Texturing"]
projectStyles: ["Low Poly", "N64", "Photo Texture", "Shaders", "Vertex Colors"]
tools: ["Godot", "Blender"]
featuredImage: "/media/experiments/exploring-making-nintendo-64-graphics-n64/Nintendo64BanjoKazooieTerrainInGodot.jpg"
featuredImageThumb: "/media/experiments/exploring-making-nintendo-64-graphics-n64/Nintendo64BanjoKazooieTerrainInGodot-Thumb.jpg"
featuredImageSmall: "/media/experiments/exploring-making-nintendo-64-graphics-n64/Nintendo64BanjoKazooieTerrainInGodot-Thumb.jpg"
---

In this article, I explain how I created a Banjo-Kazooie (Nintendo 64) terrain and level material in Godot, with a Visual Shader, importing the [terrain created in Blender](/experiment-logs/how-to-make-a-banjo-kazooie-n64-style-terrain-material-in-blender-blended-textures-with-vertex-colors/), that makes use of two texture channels and blends them using the vertex color alpha and vertex colors for details and fake lighting and ambient occlusion.

## Prerequisites

Create [the level or terrain in Blender first](/experiment-logs/how-to-make-a-banjo-kazooie-n64-style-terrain-material-in-blender-blended-textures-with-vertex-colors/), blending textures with vertex color alpha and optionally painting vertex colors.

### gLTF Export Setup

In Blender, export the mesh to gLTF to be able to import it into Godot. Make sure "Use Vertex Color: Active" is set (in Data, Mesh, Vertex Colors):

<img src="/media/experiments/exploring-making-nintendo-64-graphics-n64/ExportBanjoTerrainGLTF-VertexColorActive.png" class="img-50" alt="Blender gLTF export settings showing 'Use Vertex Color: Active' option" />

Why not simply import the `.blend` file directly into Godot? Because I didn't find a way for it to correctly import the vertex colors.

## Godot Visual Shader

It's a pretty simple shader that mixes two textures, where the mix weight comes from the vertex color alpha. Then the shader multiplies the final color with the vertex colors:

![](/media/experiments/exploring-making-nintendo-64-graphics-n64/Nintendo64TerrainVertexAlphaGodotVisualShader.png)

I also disabled specularity:

<img src="/media/experiments/exploring-making-nintendo-64-graphics-n64/Nintendo64TerrainVertexAlphaGodotVisualShader-Specular.png" class="img-50" />

