---
layout: "layouts/experiment-log.njk"
title: "Devlog 01: Camera System and Grid Based Building"
date: "2022-05-22T17:43:59.000Z"
updated: "2022-05-22T19:43:39.000Z"
type: "experiment-log"
tags: ["ue5"]
parentExperiment: "dog-spa-game-with-unreal-engine"
logCategories: ["Programming"]
projectStyles: ["Gamedev", "Software Development"]
tools: ["Blueprint", "C++", "Unreal Engine"]
featuredImage: "/media/wp-content/2022/05/DogSpa-DevLog1-UnrealEngine5-BuildingSystem.jpg"
featuredImageThumb: "/media/wp-content/2022/05/DogSpa-DevLog1-UnrealEngine5-BuildingSystem-768x419.jpg"
featuredImageSmall: "/media/wp-content/2022/05/DogSpa-DevLog1-UnrealEngine5-BuildingSystem-300x164.jpg"
metaDescription: "Third person camera system, grid and tile based building inspired by Harvest Moon - Devlog of my Dog Spa game with Unreal Engine 5."
---

The project started officially on 10th of May, I only worked on it for a few days on the weekends.

## Camera System

![](/media/wp-content/2022/05/UESeeThrough.gif)

**Developed a 3rd person camera system**, that makes object in front of the camera transparent and has multiple zoom levels. [I wrote an article about it](https://alfredbaudisch.com/blog/gamedev/unreal-engine-ue/unreal-engine-actors-transparent-block-camera-occlusion-see-through/) and I even shared the source-code for the see through mechanism.

## Grid Base Building System without the Mouse

<video controls="" src="/media/wp-content/2022/05/DogGame-GridBasedBuilding-UnrealEngine.mp4"></video>

**Implemented a grid and tile based building mechanism**. You can place buildings of different sizes in the grid. It all works with moving the character, without using the mouse, similarly to Harvest Moon.

It detects overlaps, needed amount of tiles for a building and also supports separate grids (i.e. the game does not have to be grid based, I can have a landscape with grids spread over the level).

## C++, Blueprints, Crashes and Corruptions

Everything that is related to architecture, game core, business logic is being made with C++. Anything that involves assets or custom properties are being made with Blueprint.

I was having a lot of trouble with Unreal Engine 5 C++ Live Coding. The Editor would crash constantly and my Blueprints would get corrupted, where I had to redo the work multiple times. See details and how I solved [on my topic on the Unreal Engine forums](https://forums.unrealengine.com/t/excessive-crashes-and-blueprint-corruption-when-using-live-coding-how-to-fix-that/558177).

I'm using JetBrains Rider and it's a lot of fun to write C++ with it.

<figure class="wp-block-image">
  <a href="/media/wp-content/2022/05/image-5.png"><img src="/media/wp-content/2022/05/image-5-1024x657.png" alt="" loading="lazy"></a>
  <figcaption>My project in JetBrains Rider.</figcaption>
</figure>

## Next Steps

-   Building behaviors:
    -   Factory Buildings (i.e. produce resources for the SPA)
    -   Occupancy Buildings
-   Level and currency system
-   Dogs coming in and triggering their requirements over time

I am going to start making art and other assets only after I finish the gameplay systems – I have to validate whether the gameplay loop will be fun or not.