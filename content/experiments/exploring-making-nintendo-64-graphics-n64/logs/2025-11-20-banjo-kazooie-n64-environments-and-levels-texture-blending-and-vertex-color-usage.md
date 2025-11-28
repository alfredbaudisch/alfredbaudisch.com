---
layout: "layouts/experiment-log.njk"
title: "Banjo-Kazooie (N64) environments and levels: texture blending and vertex color usage"
date: "2025-11-20T04:19:17.000Z"
updated: "2025-11-20T02:08:21.000Z"
type: "experiment-log"
tags: ["3d", "banjo-kazooie", "environment", "n64", "terrain", "texture"]
parentExperiment: "exploring-making-nintendo-64-graphics-n64"
logCategories: ["Brainstorming", "Texturing"]
projectStyles: ["Gamedev", "Hand-Painted Texture", "N64", "Photo Texture"]
featuredImage: "/media/wp-content/2025/11/BanjoKazooieEnvironmentNintendo64-N64-scaled.jpeg"
featuredImageThumb: "/media/wp-content/2025/11/BanjoKazooieEnvironmentNintendo64-N64-768x425.jpeg"
featuredImageSmall: "/media/wp-content/2025/11/BanjoKazooieEnvironmentNintendo64-N64-300x166.jpeg"
---

Banjo-Kazooie from the Nintendo 64 had environment and terrain details with blended textures (it is also called [decal blending](https://tcrf.net/Prerelease:Banjo-Kazooie/Banjo_Kazoo#Technology) in some sources):

[![](/media/wp-content/2025/11/n64-banjoenvironment-01-BanjoKazooie-BlendedTextures-1024x603.jpeg)](/media/wp-content/2025/11/n64-banjoenvironment-01-BanjoKazooie-BlendedTextures.jpeg)

This contrasts with Super Mario 64 where there was a clear separation between each texture:

[![](/media/wp-content/2025/11/n64-banjoenvironment-02SuperMario64-AbruptTextures-1024x735.jpg)](/media/wp-content/2025/11/n64-banjoenvironment-02SuperMario64-AbruptTextures.jpg)

Banjo Kazooie environments and levels also faked light, shadow and ambient occlusion with vertex colors:

<figure class="wp-block-image">
  <a href="/media/wp-content/2025/11/SCR-20251119-ryjg.jpeg"><img src="/media/wp-content/2025/11/SCR-20251119-ryjg-1024x538.jpeg" alt="" loading="lazy"></a>
  <figcaption>Banjo Kazooie’s Dingpot Teleport Room with vertex colors (from noclip.website)</figcaption>
</figure>
<figure class="wp-block-image">
  <a href="/media/wp-content/2025/11/SCR-20251119-rykl.jpeg"><img src="/media/wp-content/2025/11/SCR-20251119-rykl-1024x541.jpeg" alt="" loading="lazy"></a>
  <figcaption>Banjo Kazooie’s Dingpot Teleport Room without vertex colors (from noclip.website). Notice how everything looks flat without vertex colors.</figcaption>
</figure>

## How did they achieve texture blending?

In Banjo Kazooie, surfaces might have two texture channels, and the blending factor between them is decided by the vertex color alpha.

When disabling vertex colors from the same scene from the first screenshot, this is what the scene looks like:

<figure class="wp-block-image">
  <a href="/media/wp-content/2025/11/n64-banjoenvironment-03-BanjoKazooie-DisabledVertexColors.jpeg"><img src="/media/wp-content/2025/11/n64-banjoenvironment-03-BanjoKazooie-DisabledVertexColors-1024x576.jpeg" alt="" loading="lazy"></a>
  <figcaption>Banjo Kazooie’s Spiral Mountain, vertex colors disabled. You can see the texture blending between the road, the terrain and the farm plot is gone. The path (which is also painted with vertex colors) is also gone.</figcaption>
</figure>

[noclip.website](https://noclip.website/#bk/01;ShareData=ASKuP9oEUGUFA+H9u^1eWmP;{QUSUaUnOqPUms{KV^ky]UgFD+UOsHx9h_gu+^) allows inspecting the vertex color alpha. This is what it looks like for the same scene:

[![](/media/wp-content/2025/11/n64-banjoenvironment-04-BanjoKazooie-VertexColorAlpha-1024x498.png)](/media/wp-content/2025/11/n64-banjoenvironment-04-BanjoKazooie-VertexColorAlpha.png)

Now for a comparison of everything side by side. Notice how the vertex alpha blends the farm plot texture and the terrain texture:

[![](/media/wp-content/2025/11/n64-banjoenvironment-05-BanjoKazooie-VertexColorAlphaBlendedSideBySide-1024x510.jpg)](/media/wp-content/2025/11/n64-banjoenvironment-05-BanjoKazooie-VertexColorAlphaBlendedSideBySide-scaled.jpg)

## Vertex Colors: details, fake light, shadow and ambient occlusion

An inspection of the vertex colors reveals the grass color and the yellow path, as well faked lights, shadows and ambient occlusion (again, thanks to [noclip.website](https://noclip.website/#bk/72;ShareData=ALEeIUY6e5UPE*j97~Pz=t?\(UPz5V6UV^M^T*,P/V!jc?Uc!lp8]OC1UsDbWV[)):

[![](/media/wp-content/2025/11/SCR-20251119-sdzf-1024x546.png)](/media/wp-content/2025/11/SCR-20251119-sdzf.png)

In a closed environment, this is what the vertex color looks like:

[![](/media/wp-content/2025/11/SCR-20251119-sedd-1024x525.png)](/media/wp-content/2025/11/SCR-20251119-sedd.png)

## Textures

Banjo Kazooie makes use of all the Nintendo 64’s [texture capabilities](https://n64squid.com/homebrew/n64-sdk/textures/image-formats/) and [formats](https://youtu.be/xwls5SpNn1s?si=Y7lcHdTwm1x2xFzb&t=103), but from my quick observations, the majority of textures used in the game’s environments are:

-   32×32 (32-bit)
-   64×64 (16 colors)
-   32×64

In order to show more details, it also makes heavy usage of multi-segment 64×64 textures:

<figure class="wp-block-image">
  <a href="/media/wp-content/2025/11/n64-banjoenvironment-06-BanjoKazooie-MultiSegmentedTextures.png"><img src="/media/wp-content/2025/11/n64-banjoenvironment-06-BanjoKazooie-MultiSegmentedTextures-1024x424.png" alt="" loading="lazy"></a>
  <figcaption>Source: The Cutting Room Floor</figcaption>
</figure>

There’s also the usage of noise and alpha textures. If we go back again to the first screenshot example, the game uses a 32×32 noise texture for most of Spiral Mountain:

[![](/media/wp-content/2025/11/SCR-20251119-sgsw-1024x618.jpeg)](/media/wp-content/2025/11/SCR-20251119-sgsw.jpeg)

And then it makes heavy use of vertex colors to shape the path:

[![](/media/wp-content/2025/11/SCR-20251119-shjl-1024x607.jpeg)](/media/wp-content/2025/11/SCR-20251119-shjl.jpeg)
<figure class="wp-block-image">
  <a href="/media/wp-content/2025/11/SCR-20251119-siww.png"><img src="/media/wp-content/2025/11/SCR-20251119-siww-1024x613.png" alt="" loading="lazy"></a>
  <figcaption>Some terrain and environment textures extracted from Banjo Kazooie</figcaption>
</figure>

[In the next post](https://alfredbaudisch.com/experiment-logs/how-to-make-a-banjo-kazooie-n64-style-terrain-material-in-blender-blended-textures-with-vertex-colors/), I show how to create environments like this with Blender, replicating the same techniques.

## Sources and Additional Resources

[noclip.website](https://noclip.website)

[Why Banjo-Kazooie looked too good for a 90s game – kbrecordzz](https://kbrecordzz.com/2022/12/17/banjokazooie/)

[The Cutting Room Floor: Banjo-Kazooie](https://tcrf.net/Prerelease:Banjo-Kazooie/Banjo_Kazoo#Technology)

[Colour and image format types for the N64 – N64 Squid](https://n64squid.com/homebrew/n64-sdk/textures/image-formats/)

[How we BEAT the Limitations that defined the N64s Artstyle – YouTube](https://youtu.be/xwls5SpNn1s?si=Y7lcHdTwm1x2xFzb&t=103)

<iframe width="750" height="422" src="https://www.youtube.com/embed/w72kj20YNA0" title="Rare Revealed: A Rare Look at Dream" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>