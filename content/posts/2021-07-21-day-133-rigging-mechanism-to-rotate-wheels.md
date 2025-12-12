---
layout: "layouts/post.njk"
title: "Day 133: Rigging Mechanism to Rotate Wheels"
date: "2021-07-21T23:53:17.000Z"
updated: "2021-07-21T23:54:23.000Z"
tags: ["3d", "blender", "rigging"]
categories: ["Dailies"]
featuredImage: "/media/wp-content/2021/07/0133-rotate-wheel-constraint.gif"
featuredImageThumb: "/media/wp-content/2021/07/0133-rotate-wheel-constraint-300x300.gif"
featuredImageSmall: "/media/wp-content/2021/07/0133-rotate-wheel-constraint-300x300.gif"
type: "post"
---

After a lot of thinkering, I learned and managed a way to rotate a bone (for example, for a wheel), using another bone as the controller, by adding a Transformation constraint, which I've never used before. TL;DR; Blender Transformative constraint in a bone / armature to rotate/spin wheels.

Today's daily, also made me take a drastic decision: for 3D games I'll start using Unity. Unity handles those animations and 3D asset changes so much better than Godot. Also, Godot couldn't handle the rotate wheel animation correctly in any way, while Unity played it accordingly out of the box.

I love Godot, but it's not the first time that I've had a lot of trouble with its 3D workflow.

## Process

[![](/media/wp-content/2021/07/0133-process-blender-1024x851.jpg)](/media/wp-content/2021/07/0133-process-blender.jpg)