---
layout: ../../layouts/BlogPostLayout.astro
title: "USD Scripting"
description: "Thank You Pixar"
image: "/img/pics/20240902-ghee-and-ethics.jpg"
author: "Aathreya Kadambi"
date: "December 30, 2024"
---

<div><img src="https://people.eecs.berkeley.edu/~kanazawa/img/new_animated.gif" /> </div>

Recently, I've been involved with a few projects that involve scripting using "OpenUSD", relating to NVIDIA Omniverse, Isaac Sim, etc....  It's been great (here, the word great is used to mean very very exciting but simultaneously very painful), but to be honest, I probably went backwards in my path of learning how to work with it! I became confused with the different C++ and Python documentation, and what Xforms and Prims and all the other random things were (writing from the perspective of a newbie). 

The primary qualm I had with the documentation (in hindsight, maybe an invalid one, but it was mainly a feeling) was that it felt hard to figure out where to start just by looking at the Python docs: https://docs.omniverse.nvidia.com/kit/docs/pxr-usd-api/latest/pxr.html. There isn't really a flow, you kind of just have to look up what you want to find, which is fine, but gets confusing at some point.

To be honest with myself though, the real pain comes from the fact that going in, I didn't have any understanding of USD! And for that, there are good references. Instead of searching for these, I kind of just rushed into the code, confident that I would be able to do a good job with just my coding skills (a false assumption). I was reluctant to learn something from scratch, which is what I should have done.

In hindsight, especially as someone who claims to love 3D art, animation, games, etc., that was all probably pretty naïve of me (this post is my apology 😀). <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.tenor.com%2FKOUB7pyGZ_cAAAAM%2Femoji-face.gif&f=1&nofb=1&ipt=82292519a3135a1aacea075e781f37d03b67de6c0232f32d839a299baf9f729b&ipo=images" height="20px" width="20px" /> <- I would give attributions to this but I don't know where it's from actually, the src link is in the HTML, seems to be from some sus website. 

So that's what this post is about. :-)

## Pixar's Gift to the World: Universal Scene Description

Universal Scene Description (USD) is a great way to set a 3D scene up hierarchically. 

In USD, there is one fundamental encapsulation, called a **prim**, which is kind of like a shell for anything else. Prims all have data, and can reference other prims (leading to hierarchy). For example, Prim A could have some data for itself, and then reference Prim B, which would then be "a part of Prim A". For those who are familiar with HTML, I like to think about prims as being like `div` tags: ***they're simply containers***. 

So what kinds of data generally go into prims? Anything, but examples could include things like geometry, lighting, cameras, etc..

Another important feature is the **stage**. The stage consists of several "layer stacks" which are essentially hierarchies of prims.

Also, we have **schemas**. Schemas are essentially ways to lay out the structure of some data in a prim. There are two types of schemas: IsA schemas (literally stands for "is a"), and API schemas. The former are kind of like class inheritance in code, and there are abstract and concrete versions of them. The latter is more like class composition in code, where we give additional properties to an object.

Prims have a list of API schemas, and when we give an object an API schema, they just add that schema to their list!

On top of this, they have things like Xforms, which are important to read on.

## To be continued?

I have to go for now actually, but I'm putting some good references below on USD! Some other things I thought were cool were that NVIDIA and Apple joined together to make physics schemas, which are particularly useful in things like Omniverse. At the startup I was working in last semester, we used the Physics schema, which was super interesting. Additionally, Blender has USD functionality (I like Blender)!


## References
1. https://openusd.org/release/glossary.html
2. https://docs.blender.org/manual/en/latest/files/import_export/usd.html
3. https://developer.apple.com/documentation/realitykit/creating-usd-files-for-apple-devices
4. https://github.com/PixarAnimationStudios/OpenUSD
5. https://github.com/uxlfoundation/oneTBB
6. https://github.com/uxlfoundation/foundation/tree/main?tab=readme-ov-file#working-groups
7. https://en.wikipedia.org/wiki/Universal_Scene_Description
8. https://lucascheller.github.io/VFX-UsdSurvivalGuide/pages/introduction/motivation.html
