---
layout: "layouts/post.njk"
title: "Day 132: Horde Catapult Rigged (Blender Linked Data Complexity)"
date: "2021-07-20T23:36:45.000Z"
updated: "2021-07-20T23:39:27.000Z"
tags: ["3d", "blender", "rig", "wow"]
categories: ["Dailies"]
featuredImage: "/media/wp-content/2021/07/0132-horde-catapult-rigged.jpg"
featuredImageThumb: "/media/wp-content/2021/07/0132-horde-catapult-rigged-768x516.jpg"
featuredImageSmall: "/media/wp-content/2021/07/0132-horde-catapult-rigged-300x202.jpg"
type: "post"
---

This is probably the hardest time I've had with a rig so far. It's so simple, yet so complex. Reasons and steps taken:

-   The catapult was assembled with multiple copies of Linked objects and all of them had Modifiers.
-   Each object (wheel, spike, body, arm and basket) were separate, with their own UV map and material. I parented them to the body, but still, they are not joined, only parented.
-   How to assign the armature to the whole object? When I tried to assign it, it would go only to one individual object, not to the whole catapult itself.
-   I had to create a copy of the .blend file, make the objects unique (remove linked data), apply all modifiers, then parent then all to the catapult body.
-   Then I had to select ALL objects and then finally parent them to the armature.
-   How to keep working with modifiers and linked data while having them parented to and weighted to an armature?
-   Are Blender Linked Data and Parenting useless? Or do I always have to apply them all when the object is done? What if I have to make changes? Without the applied data, I'd have to repeat the changes accross all duplicated objects. What a pain in the arse.