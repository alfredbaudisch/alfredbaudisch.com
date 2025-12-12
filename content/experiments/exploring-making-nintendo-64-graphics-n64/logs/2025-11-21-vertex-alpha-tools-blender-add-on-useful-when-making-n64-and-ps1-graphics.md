---
layout: "layouts/experiment-log.njk"
title: "Vertex Alpha Tools: Blender add-on useful when making N64 and PS1 graphics"
date: "2025-11-21T02:56:44.000Z"
updated: "2025-11-21T03:03:16.000Z"
type: "experiment-log"
tags: ["3d", "addon", "banjo-kazooie", "blender", "n64", "ps1"]
parentExperiment: "exploring-making-nintendo-64-graphics-n64"
logCategories: ["Programming", "Texturing"]
projectStyles: ["N64", "PS1", "Vertex Colors"]
tools: ["Blender", "Python"]
---

I have [previously shown how to make Banjo-Kazooie](https://alfredbaudisch.com/experiment-logs/how-to-make-a-banjo-kazooie-n64-style-terrain-material-in-blender-blended-textures-with-vertex-colors/) (from the Nintendo 64) stylized terrain and environments with vertex colors and vertex color alpha.

But, there are a few annoyances and small roadblocks in that workflow:

1.  Painting the vertex color alpha to specific values can be difficult.
2.  It's very hard to replicate the same vertex color alpha value in different parts of the mesh (for example, in case you want to equally blend another texture in various sections of the mesh).
3.  It's cumbersome to visualize the vertex alpha itself.
4.  There's no way to know the exact value of the vertex alpha from a specific vertex.

To solve issue number 2 I found the free "[VertexAlphaSetter](https://github.com/Desayuno64/VertexAlphaSetter)" Blender add-on by [Desayuno64](https://github.com/Desayuno64/). This add-on lets you set specific alpha values to selected vertices.

But then I still had all the other 3 issues pending. For that, I created my own solution, "Vertex Alpha Tools" (free, [available on Github)](https://github.com/alfredbaudisch/VertexAlphaTools), with the following features:

![](/media/wp-content/2025/11/VertexAlphaToolsAddon.png)

-   Toggle vertex color alpha as a material overlay.
-   Visualize the specific vertex alpha values as 3D labels on top of each vertex.
-   And I unified the original "VertexAlphaSetter" add-on onto my add-on.

<figure class="wp-block-image">
  <a href="/media/wp-content/2025/11/example-VisualizeVertexColorAlphaValues.jpeg"><img src="/media/wp-content/2025/11/example-VisualizeVertexColorAlphaValues-1024x407.jpeg" alt="" loading="lazy"></a>
  <figcaption>Vertex alpha values on top of each vertex</figcaption>
</figure>
<figure class="wp-block-image">
  <a href="/media/wp-content/2025/11/example-VisualizeVertexColorAlpha.jpeg"><img src="/media/wp-content/2025/11/example-VisualizeVertexColorAlpha-1024x365.jpeg" alt="" loading="lazy"></a>
  <figcaption>Vertex alpha overlay</figcaption>
</figure>

This is useful when making both PlayStation 1 (PS1) and Nintendo 64 (N64) stylized graphics with Blender.