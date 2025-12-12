---
layout: "layouts/project.njk"
title: "PardallMarkdown"
date: "2021-09-17T20:57:55.000Z"
type: "project"
projectStatus: ["Active", "Completed", "Personal / Hobby"]
projectTypes: ["Open-source"]
tools: ["Elixir", "Phoenix"]
featuredImage: "/media/wp-content/2021/09/pardallmarkdown-demo-and-tutorial.jpg"
featuredImageThumb: "/media/wp-content/2021/09/pardallmarkdown-demo-and-tutorial-768x432.jpg"
featuredImageSmall: "/media/wp-content/2021/09/pardallmarkdown-demo-and-tutorial-300x169.jpg"
links:
  - name: "GitHub"
    url: "https://github.com/alfredbaudisch/pardall_markdown"
  - name: "Demo Phoenix LiveView Website"
    url: "https://github.com/alfredbaudisch/pardall_markdown_phoenix_demo"
  - name: "Video demo and 1h tutorial"
    url: "https://www.youtube.com/watch?v=FdzqToe3dug"
---

**P[ardallMarkdown](https://github.com/alfredbaudisch/pardall_markdown)** is a reactive publishing framework and engine written in Elixir. Instant websites and documentation websites.

**As opposed to static website generators** (such as Hugo, Docusaurs and others), with PardallMarkdown, **you don't need to recompile and republish your application every time you write or modify new content**. The application can be kept running indefinitely in production, while it **watches a content folder for changes** and **the new content re-actively gets available for consumption** by your application.

<iframe width="750" height="422" src="https://www.youtube.com/embed/FdzqToe3dug" title="Build a reactive real-time Markdown-based website with  Phoenix LiveView and PardallMarkdown" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## Features

-   Filesystem-based, with **Markdown** and static files support.
    -   Markdown files are parsed as HTML.
-   FileWatcher, that **detects new content and modification of existing content**, which then **automatically re-parses and rebuilds the content**.
    -   There is **no need to recompile** and redeploy the application nor the website, the **new content is available immediately** (depends on the interval set via `:recheck_pending_file_events_interval`, see below).
    -   Created with [Phoenix LiveView](https://hexdocs.pm/phoenix_live_view/Phoenix.LiveView.html) and Phoenix Channels in mind: **create or modify a post** or a whole new **set of posts** and they are **immediately published in a website**. Check out [the demo](https://github.com/alfredbaudisch/pardall-markdown-phoenix-demo) repository.
-   Support for the content folders outside of the application, this way, **new content files can be synced immediately from a source location** (for example, your computer), and then picked up by the FileWatcher.
-   Automatic creation of **table of contents** from Markdown headers.
-   **Infinite content hierarchies** (categories and sub-categories, sections and sub-sections).
    -   Different **sets of custom hierarchies** and post sets. For example, a website with _Documentation_, _Blog_, _News_ and a _Wiki_, which in turn, have their own sub-hierarchies.
    -   **Custom sorting rules** per hierarchy set. For example, posts in the _Documentation_ hierarchy can be sorted by priority, _Blog_ posts by date and _Wiki_ posts by title.
-   Automatic creation of **taxonomy trees and content tress**.
    -   Separate content trees, per root hierarchy are also created. For example, a content tree for the _Documentation_ hierarchy, which contains links to all sub-hierarchies and posts.
-   Automatic creation of **post navigation links** (next and previous posts).
-   Freely embeddable **metadata into posts** as Elixir maps.
-   Hierarchy **archive lists**.
-   All the content and indexes are kept in an **in-memory cache (Elixir's ETS)**.

## [](https://github.com/alfredbaudisch/pardall_markdown#use-cases)Use cases

-   Blogs
-   Documentation websites
-   Wikis
-   FAQs
-   Any kind of website actually? Even e-commerce websites, where you can use PardallMarkdown's parsed content as product pages, and more.
-   Any application that needs content?