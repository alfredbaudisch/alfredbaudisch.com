---
layout: "layouts/post.njk"
title: "Day 134: Horde Catapult Shoot Animation"
date: "2021-07-22T23:00:34.000Z"
updated: "2021-07-22T23:00:35.000Z"
tags: ["3d", "animation", "blender", "ps1", "rigging"]
categories: ["Dailies"]
featuredImage: "/media/wp-content/2021/07/0134-catapult-shooting.gif"
featuredImageThumb: "/media/wp-content/2021/07/0134-catapult-shooting-300x300.gif"
featuredImageSmall: "/media/wp-content/2021/07/0134-catapult-shooting-300x300.gif"
type: "post"
---

With the lessons learned in the dailies [Day 132: Horde Catapult Rigged (Blender Linked Data Complexity)](https://alfredbaudisch.com/dailies/day-132-horde-catapult-rigged-blender-linked-data-complexity/) and [Day 133: Rigging Mechanism to Rotate Wheels](https://alfredbaudisch.com/dailies/day-133-rigging-mechanism-to-rotate-wheels/), today I managed to animate the catapult.

The wheels are rotated via a single controller, connected via a “Transformation” constraint. And this controller is connected to the root bone via another Transformation constraint. To animate the pushback, I moved the root bone 0.3m Y+, and then the wheels moved automagically, due to the root -> controller -> wheels connections.

## Process

[![](/media/wp-content/2021/07/0134-process-blender-1024x553.jpg)](/media/wp-content/2021/07/0134-process-blender.jpg)