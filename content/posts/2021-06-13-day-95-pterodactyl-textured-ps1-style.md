---
layout: "layouts/post.njk"
title: "Day 95: Pterodactyl Textured PS1 Style"
date: "2021-06-13T17:25:47.000Z"
updated: "2021-06-13T18:06:08.000Z"
tags: ["3d", "blender", "lowpoly", "ps1"]
categories: ["Dailies"]
featuredImage: "/media/wp-content/2021/06/0095-pterodactyl-textured.png"
featuredImageThumb: "/media/wp-content/2021/06/0095-pterodactyl-textured-768x432.png"
featuredImageSmall: "/media/wp-content/2021/06/0095-pterodactyl-textured-300x169.png"
type: "post"
---

Textured [yesterday’s Petrodactyl](https://alfredbaudisch.com/dailies/day-94-pterodactyl-low-poly/), using alligators and iguanas’ photos. This was a lot of fun!

A low poly dinosaur / Pterodactyl, PS1 style modeled, UV unwrapped and textured with Blender.

## Process

[![](/media/wp-content/2021/06/0095-process-blender-1024x560.jpg)](/media/wp-content/2021/06/0095-process-blender.jpg)

-   Create a 1024×1024 texture with a collage of photos that will be the model’s texture.
-   Create 2 UV Maps: the first one is the “main UV” and the second one is the “projected UV”. Activate the projected UV.
-   UV project the model onto the photo collage.
-   Activate the main UV and create the final UV (seams, unwrap, etc).
-   Create a new 1024×1024 empty image file inside Blender and assign it to the model’s material.
-   Go to Texture Paint, and clone the “projected UV” onto the “main UV”, using the photo collage as the source and the new empty image as the destination. Choose “Closest” when painting.
-   After finishing cloning, use the clone tool to fix visible seams.
-   After finishing everything, save the painted texture and resize it externally to 512×512 or 256×256 using Cubic interpolation.