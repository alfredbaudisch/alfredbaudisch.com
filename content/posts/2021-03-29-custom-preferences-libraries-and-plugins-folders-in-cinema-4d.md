---
layout: "layouts/post.njk"
title: "Custom Preferences, Libraries, and Plugins Folders in Cinema 4D"
date: "2021-03-29T14:33:58.000Z"
updated: "2021-03-29T14:34:00.000Z"
tags: ["3d", "art", "c4d", "cinema 4d", "tutorial"]
categories: ["Blog"]
featuredImage: "/media/wp-content/2021/03/cinema4d-custom-folders.png"
featuredImageThumb: "/media/wp-content/2021/03/cinema4d-custom-folders-768x344.png"
featuredImageSmall: "/media/wp-content/2021/03/cinema4d-custom-folders-300x134.png"
type: "post"
---

All folders used by Cinema 4D can be pointed to a custom path, even the Preferences and Default libraries/browser directories, this is possible by adding some Environment Variables and adding a single parameter to the Cinema 4D shortcut (this is how you can move away from the C:/ hard drive and away from the AppData directory).

## Browser, Plugins and Scripts Paths

In Windows, right-click “This PC” (or “My PC”), go to _Properties_ and choose _Advanced system settings_, then click _Environment Variables_.

[![](/media/wp-content/2021/03/image-15.png)](/media/wp-content/2021/03/image-15.png)

In “System variables”, click “New…” and in “Variable name” put one of the 3 values below. For the “Variable value” click “Browse Directory…” and go to the directory related to the variable name. Repeat this step three types, one for each of variable names below.

[![](/media/wp-content/2021/03/image-16.png)](/media/wp-content/2021/03/image-16.png)

All the variables that you have to add:

```
C4D_BROWSERLIBS
C4D_PLUGINS_DIR
C4D_SCRIPTS_DIR
```

Source: [https://www.youtube.com/watch?v=pyrEevPPtRM](https://www.youtube.com/watch?v=pyrEevPPtRM)

## Custom Preferences Folder (Windows)

You have to add a custom parameter to your Cinema 4D shortcut. Before doing so, first copy your current Preferences folder to the new desired location (for example, another Hard Drive).

### Copy Current Folder

In Cinema 4D, go to Edit, Preferences. Then click “Open Preferences Folder…” at the bottom.

[![](/media/wp-content/2021/03/image-17.png)](/media/wp-content/2021/03/image-17.png)

When the folder opens in Windows Explorer, copy all the contents and paste into your desired new folder. Close Cinema 4D.

### Make Cinema 4D use the new custom Preferences Folder Path

-   Right-click a Cinema 4D shortcut and go to Properties.
-   In “Target”, inside double-quotes, you will have the path to the Cinema 4D executable.
-   After the quotes, add a space and then **`-g_prefspath`\=[custom preferences folder]**, example:

```
"C:\Program Files\Cinema 4D\Cinema 4D.exe" -g_prefspath=F:\Cinema4D\preferences
```
[![](/media/wp-content/2021/03/cinema4d-custom-preferences-folder-shortcut.gif)](/media/wp-content/2021/03/cinema4d-custom-preferences-folder-shortcut.gif)

You can now delete the previous preferences folder. But, remember to always open the software from this shortcut.

[Source](https://www.reddit.com/r/Cinema4D/comments/b01a4b/how_to_move_preferences_folder/).

## Coffee, Coins and Thumbs Up

If you like my content or if you learned something from it, [buy me a coffee](https://ko-fi.com/alfredbaudisch) ☕, [be my Patreon](https://www.patreon.com/alfredbaudisch) or simply check [all of my links](https://linktr.ee/alfredbaudisch) 🔗 and follow me/subscribe/star my repositories/whatever you prefer. If you want to learn Godot, be sure to check [my courses](https://alfredbaudisch.com/projects/education/dynamic-inventory-system-and-user-interfaces-with-godot-course/) 📚!

**Or you can simply add [my game to your Steam Wishlist](https://store.steampowered.com/app/2125110/?utm_source=alfredbaudisch&utm_campaign=coffee_block) – that helps GREATLY and it’s easy and free 🙂**