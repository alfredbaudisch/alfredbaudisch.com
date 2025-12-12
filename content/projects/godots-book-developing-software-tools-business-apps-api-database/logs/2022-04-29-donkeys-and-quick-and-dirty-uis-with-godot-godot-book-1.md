---
layout: "layouts/project-log.njk"
title: "Donkeys and Quick and Dirty UIs with Godot – Update #1 - Book: Godot Software Development (Education Projects)"
date: "2022-04-29T09:40:02.000Z"
updated: "2022-04-29T10:04:17.000Z"
type: "project-log"
tags: ["book"]
parentProject: "godots-book-developing-software-tools-business-apps-api-database"
logCategories: ["Brainstorming", "Programming"]
projectStyles: ["Software Development"]
tools: ["GDScript", "Godot"]
metaDescription: "Of Starvation, Donkeys and Quick and Dirty UIs and Prototypes with Godot. Idea for the first chapter for the Godot Software Develoment Book."
---

As the **first update related to the Godot Software Development book**, this is just a quick post to show something that I did yesterday with Godot: it's been 3 months that I'm trying to decide a game idea to make, but I get lost forever in a cycle of indecision due to having too many ideas all the time, then I end up choosing none of the ideas and then I starve due to my indecision, there's even a name for that, called **the parable of [Buridan's Ass](https://alfredbaudisch.us14.list-manage.com/track/click?u=0039aa18bf16e51da03c6af99&id=87e57b8cb5&e=12afac9e9a)**.

I got tired of it and decided to make a quick idea generator that mixes what I have in mind for a game.  
  
It took me around 10 minutes to throw a very quick and dirty UI and write the logic for the idea generator, with a bunch of data sets with my preferences. After some tweaking, it generated a bunch of ideas that I'm satisfied with. I normally write these as console applications using [Elixir](https://elixir-lang.org) or Python, but using Godot allows for a quicker visual iteration. Is it ugly? Yes. Is it adjustable for screen-sizes? Absolutely not. But it got the work done.

<figure class="wp-block-image">
  <img src="/media/wp-content/2022/04/IdeaGeneratorGodot.png" alt="" loading="lazy">
  <figcaption>This is not the idea I chose, but thinking about it… maybe I should change my mind again and pick this crazy mix? 😛</figcaption>
</figure>

And then I decided that this is what the **first chapter of the [Godot Software Development book](https://alfredbaudisch.com/projects/education/godots-book-developing-software-tools-business-apps-api-database/) will be: using Godot as a way to create quick and dirty software prototypes**. This is not only for personal prototypes. The idea is specially in a **business situation where you need to validate something, in a few minutes you can prototype it with Godot**, due to the stupidly easy to use UI system and lightweight environment.  
  
On other news, **I released my [Inventory System and UI](https://alfredbaudisch.us14.list-manage.com/track/click?u=0039aa18bf16e51da03c6af99&id=3206a581a9&e=12afac9e9a) as open-source yesterday**, check it out on [Github](https://alfredbaudisch.us14.list-manage.com/track/click?u=0039aa18bf16e51da03c6af99&id=abedb83e1f&e=12afac9e9a), for another complex UI project with Godot (my other one is [Godello, the clone of Trello](https://alfredbaudisch.com/projects/open-source/godello/)).