---
layout: "layouts/post.njk"
title: "Importing Unity Synty Characters and Animation Packs In Unreal Engine 5 (with Re-Targeting)"
date: "2023-02-09T20:53:42.000Z"
updated: "2023-03-19T19:59:35.000Z"
tags: ["3d", "animation", "rigging", "synty", "ue", "ue5", "unity", "unreal engine"]
categories: ["Unreal Engine"]
featuredImage: "/media/wp-content/2023/02/FromUnityToUERetargeting.jpg"
featuredImageThumb: "/media/wp-content/2023/02/FromUnityToUERetargeting-768x432.jpg"
featuredImageSmall: "/media/wp-content/2023/02/FromUnityToUERetargeting-300x169.jpg"
type: "post"
---

In this post, I show how I imported both character and animation asset packs from the Unity Asset Store into Unreal Engine, and shared animations between models with [UE’s IK Rigs Retargeting](https://docs.unrealengine.com/5.1/en-US/unreal-engine-ik-rig/), similarly to Unity’s Mecanim. Specifically, the focus are the packs: [Synty’s POLYGON Dungeon Characters](https://assetstore.unity.com/packages/3d/environments/dungeons/polygon-dungeons-low-poly-3d-art-by-synty-102677?utm_source=alfredbaudisch&aid=1011lu3e7&utm_campaign=ueretargetpost) and [Kevin Iglesias Basic Motions](https://assetstore.unity.com/packages/3d/animations/basic-motions-157744?utm_source=alfredbaudisch&aid=1011lu3e7&utm_campaign=ueretargetpost).

<figure>
<video controls="" src="/media/wp-content/2023/02/syntyInUE-Retarget01.mp4"></video>
<figcaption>The final result in UE 5.1. The purple model, the animations and the Synty characters all come from Unity.</figcaption>
</figure>

## Export Content from Unity and import into UE

-   Import the asset packs from the Asset Store into a Unity project.
-   Look for the FBX files and textures related to the meshes and animations that you want to import into UE.
-   If the FBX file has a single mesh and animations, import it as is into Unreal Engine. Do not forget to import as Skeletal Mesh and to also import animations.
-   For Synty characters, the FBX file must first be converted to GLTF. See below.

{% imageGallery [ { src: "/media/wp-content/2023/02/PolygonDungeonsSynty-1024x818.jpg", alt: "", caption: "" }, { src: "/media/wp-content/2023/02/BasicMotions-1024x825.jpg", alt: "", caption: "" } ] %}

### Synty Characters from Unity into Unreal Engine

Synty puts all character skins into a single FBX file:

![](/media/wp-content/2023/02/SyntyFBXCharactersUnified.png)

UE unfortunately always combine meshes from Skeletal Meshes FBX files. So if you try to import Synty’s `Characters.fbx` from Unity into UE, all meshes will be stacked on top of each other:

{% imageGallery [ { src: "/media/wp-content/2023/02/SyntyFBXCharactersStackedIntoUE.png", alt: "", caption: "", link: "/media/wp-content/2023/02/SyntyFBXCharactersStackedIntoUE.png" }, { src: "/media/wp-content/2023/02/SyntyFBXCharactersStackedIntoUE2.jpg", alt: "", caption: "", link: "/media/wp-content/2023/02/SyntyFBXCharactersStackedIntoUE2.jpg" } ] %}

-   Fortunately, UE’s GLTF importer allows splitting Skeletal Meshes (thanks to L.F.A from the [Epic Forums](https://forums.unrealengine.com/t/fbx-file-with-multiple-skeletal-meshes-ue-imports-them-combined-any-way-to-split-them/749057/4?u=alfredbaudisch) for letting me know about that).
-   The best way I found to convert from FBX to GLTF, was inside Unity.
-   Import the open-source Unity package [UniVRM](https://github.com/vrm-c/UniVRM), which has a FBX to GLTF converter and exporter.
-   Select your Synty’s `Characters.fbx` in the Unity Project view and then go to _UnitGLTF -> Export to GLB_, and export the file to `.glb`.

![](/media/wp-content/2023/02/imagen.png)

Now, when importing the file into Unreal Engine 5.1, uncheck _Combine Skeletal Meshes_ and then the meshes will be correctly imported separately:

{% imageGallery [ { src: "/media/wp-content/2023/02/UEGLTFImporterCombineMeshes-1.png", alt: "", caption: "", link: "/media/wp-content/2023/02/UEGLTFImporterCombineMeshes-1.png" }, { src: "/media/wp-content/2023/02/UEGLTFImportedSeparated-1024x860.jpeg", alt: "", caption: "", link: "/media/wp-content/2023/02/UEGLTFImportedSeparated.jpeg" } ] %}

## Create IK Rigs for all packs

In order to share animations between the packs in Unreal Engine, similarly to Unity’s Mecanim, you need to **manually create an IK Rig for each of the character and animation packs that you imported**. In my case, I created an IK Rig for BasicMotions and one for the Synty Characters (at least it’s one IK Rig per pack, not for each character).

It can be a time-consuming process, but it’s worth it, because it enables animation retargeting between Unity’s Asset Store packs just like Unity’s Mecanim.

[![](/media/wp-content/2023/02/imagen-2.png)](/media/wp-content/2023/02/imagen-2.png)

I won’t go into details on how to do that since it’s quite extensive. You can check the official tutorials:

-   [IK Rig](https://docs.unrealengine.com/5.1/en-US/unreal-engine-ik-rig/)
-   [Retargeting Bipeds with IK Rig](https://docs.unrealengine.com/5.1/en-US/retargeting-bipeds-with-ik-rig-in-unreal-engine/)

The important thing to notice is that all IK Rigs must share the same chains. As for goals, for the mentioned packs, only 4 goals are needed:

-   Arms: RightArm\_Goal and LeftArm\_Goal
-   Legs: LeftArm\_Goal and RightArm\_Goal

Check my final setup (click to expand):

{% imageGallery [ { src: "/media/wp-content/2023/02/IKRig1-1024x729.jpg", alt: "", caption: "", link: "/media/wp-content/2023/02/IKRig1.jpg" }, { src: "/media/wp-content/2023/02/IKRig2-1024x722.jpg", alt: "", caption: "", link: "/media/wp-content/2023/02/IKRig2.jpg" } ] %}

## IK Retargeter Profiles

To finally be able to retarget and share animations, you need to create IK Retargeter Profiles.

[![](/media/wp-content/2023/02/imagen-3.png)](/media/wp-content/2023/02/imagen-3.png)

The most important settings are the “Source” and “Target” assets. In this case, the animations come from BasicMotions, so its IKRig is the source. Then, I want to animate the Synty characters with those animations, so I set it as the target:

[![](/media/wp-content/2023/02/imagen-4.png)](/media/wp-content/2023/02/imagen-4.png)

Also make sure to setup the Chain Mapping:

![](/media/wp-content/2023/02/imagen-5.png)

You can now see the animations in action. If a bone seems wrong or weird, click the bone in the left bone browser and adjust angles, limits and more in the Details panel (click to expand):

[![](/media/wp-content/2023/02/imagen-6-1024x640.png)](/media/wp-content/2023/02/imagen-6.png)