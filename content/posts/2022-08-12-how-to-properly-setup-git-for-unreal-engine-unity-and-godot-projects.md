---
layout: "layouts/post.njk"
title: "How to Properly Setup Git for Unreal Engine, Unity and Godot Projects"
date: "2022-08-12T22:00:00.000Z"
updated: "2022-09-12T20:32:31.000Z"
tags: ["git", "godot", "godot engine", "ue", "unity", "unreal engine"]
categories: ["Gamedev"]
featuredImage: "/media/wp-content/2022/08/GitLFS.jpg"
featuredImageThumb: "/media/wp-content/2022/08/GitLFS-768x449.jpg"
featuredImageSmall: "/media/wp-content/2022/08/GitLFS-300x176.jpg"
type: "post"
---

In order to have a Git repository for a game development project, the repository must be properly set with [Git LFS](https://git-lfs.github.com/), otherwise Git is going to make full copies of binary files. With Git LFS you can also version control huge files (in the size of GBs).

But it can be tricky to understand the correct workflow to setup Git LFS, also it's common to add LFS to a repository but incorrectly track binary files with the normal Git workflow instead of LFS (due to wrong setup order and incorrect `lfs track`).

Before we move forward, understand that **when I talk about "binary files" I mean "assets" (meshes, textures, sounds, etc.), anything that is not source-code**. In the case of Unreal Engine, everything is an asset, including Blueprints (because BP files are binaries) – with the exception of C++ files, of course.

> When using Git LFS, your commits will point to a lightweight reference object instead of pointing back to the binary file (you're actually pushing the original binary file to an LFS repo).
> 
> [Save Time with Git LFS](https://www.gitkraken.com/learn/git/git-lfs)

## Setup

If you still don't have a Git repository set in your project folder, initialize the repository and install LFS.

```
git init
git lfs install
```

Track the folders and subfolders that will contain binary assets. To track a parent folder and all of its children and subfolders recursively add two "**":

```
\# Unreal Engine:
git lfs track "Content/**"

# Godot (as long as you keep only binary files
# inside the folder "Assets" and its subfolders. Adjust accordingly):
git lfs track "Assets/**"

# Unity: check the special section below in the article, grab
# Unity's .gitattributes template instead of calling lfs track manually
```

If you are going to have source-code files in any of the sub-folders of your Assets/Content folder, then you have to manually call `git lfs track` for each of the binary folders (ex: `Assets/Meshes/**`) or binary file types (ex: `*.fbx`).

In this case, instead of doing this, which can be error prone, I recommend keeping source-code files in another root folder, away from the assets root folder. Check [Tracking files with Git LFS](https://www.atlassian.com/git/tutorials/git-lfs#tracking-files) for more options.

Example:

```
Project/
-- Content/
---- Assets/ (track with LFS: git lfs track "Content/Assets/**")
---- Scripts/ (Non-LFS, normal Git)
```

Then **before adding any other file, you must add and commit the `.gitattributes` file** (this is where it's common to mess up):

```
git add .gitattributes
git commit -m "LFS attributes"
```

<figure class="wp-block-image">
  <a href="https://www.gitkraken.com/learn/git/git-lfs"><img src="/media/wp-content/2022/08/image-1.png" alt="" loading="lazy"></a>
  <figcaption>Image by GitKraken.</figcaption>
</figure>

## Adding Binary Files and Tracking LFS Status

Add files normally, for example: `git add .` or `git add Content/Specific/File.fbx`.

Then you can track whether they are being treated as LFS or not with:

```
git lfs status
```

Files tracked as LFS will have their paths appended by `(LFS: <id>)`.

You can also list LFS files with:

```
git lfs ls-files
```

If a binary file does not appear in these lists, they are going to be incorrectly treated in the main Git workflow, not taking advantage of LFS.

## Git GUI Clients and LFS

After LFS is set, you can normally use Git GUI Clients in your workflow, no need to further use the command line. I personally use [SmartGit](https://www.syntevo.com/smartgit/), which has [LFS support](https://docs.syntevo.com/SmartGit/Latest/Git-LFS.html).

## Special Unity Setup

Unity offers a special tool to merge scene and prefab files, "[Smart Merge](https://docs.unity3d.com/Manual/SmartMerge.html)".

Open your global `.gitconfig` file or your project's `.git` file and add (see [the docs](https://docs.unity3d.com/Manual/SmartMerge.html) to find out where `UnityYAMLMerge` is located):

```
[merge]
    tool = unityyamlmerge

[mergetool "unityyamlmerge"]
    trustExitCode = false
    cmd = '<path to UnityYAMLMerge>' merge -p "$BASE" "$REMOTE" "$LOCAL" "$MERGED"
```

-   [Get Unity's .gitignore template](https://github.com/github/gitignore/blob/main/Unity.gitignore)
-   [Get Unity's .gitattributes template](https://gist.github.com/alfredbaudisch/bc8f204420d0862fd8c869ff77783017)

Project Settings:

![](/media/wp-content/2022/09/image.png)

![](/media/wp-content/2022/09/image-1.png)

## Further Info

-   [Official website](https://git-lfs.github.com/)
-   [Detailed LFS guide from Atlassian](https://www.atlassian.com/git/tutorials/git-lfs)
-   [How to use Git LFS](https://www.gitkraken.com/learn/git/git-lfs)

> Because git LFS hashes the file to determine its identity, identical files in multiple repos will all point to the same place in memory, like a symbolic link/fancier shortcut.  
>   
> It makes a huge difference, \*especially\* if you're indie and parched for disk space.
> 
> — 🐑🐑🐑🐑🐑🐑🐑 (@GorduneDelaine) [August 13, 2022](https://twitter.com/GorduneDelaine/status/1558275902114504704?ref_src=twsrc%5Etfw)