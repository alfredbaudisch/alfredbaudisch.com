---
layout: "layouts/post.njk"
title: "Day 43: IK Refresher"
date: "2021-04-22T21:22:49.000Z"
updated: "2021-04-22T21:32:12.000Z"
tags: ["3d", "animation", "blender", "rigging"]
categories: ["Dailies"]
featuredImage: "/media/wp-content/2021/04/0043-ik-refreshment.gif"
featuredImageThumb: "/media/wp-content/2021/04/0043-ik-refreshment-300x300.gif"
featuredImageSmall: "/media/wp-content/2021/04/0043-ik-refreshment-300x300.gif"
type: "post"
---

In ancitipation to Ludum Dare this Saturday. This was frustrating. Hopefully, I won't forget it anymore.

## Process

{% imageGallery [ { src: "/media/wp-content/2021/04/0043-process-blender.png", alt: "", caption: "", link: "/media/wp-content/2021/04/0043-process-blender.png" }, { src: "/media/wp-content/2021/04/frustration.png", alt: "This painting is called FRUSTRATION", caption: "This painting is called FRUSTRATION", link: "/media/wp-content/2021/04/frustration.png" } ] %}

-   Extend from the tail of the leg bone
-   Clear parent (ALT+P)
-   Add pole target (add 3D cursor and then SHIFT+A to add a bone)

![](/media/wp-content/2021/04/image-1.png)

-   Uncheck Deform from Pole Target
-   Go to Pose Mode, select FIRST the IK bone, then the leg bone
-   Then SHIFT+CONTROL+C and choose IK
-   Select the leg bone and adjust the IK constraint values  
    

![](/media/wp-content/2021/04/image-2.png)

![](/media/wp-content/2021/04/image-3.png)

-   If the bones are not rotating when moving the IK, reset the chain length.

### Parenting and Assigning Bones

-   Symmetrize the armature in edit mode (select all bones first)
-   Object mode, select the mesh/human/whatever, then shift+click armature
-   CTRL+P and choose with weights or empty groups