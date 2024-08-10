---
layout: ../../layouts/BlogPostLayout.astro
title: "Grafting and GPUs"
description: "Things to consider when growing limes and lemons, and thinking about my GPU limitations."
image: "/img/pics/IMG_3880.jpg"
author: "Aathreya Kadambi"
slug: "grafting-and-gpus"
date: "May 18, 2024"
---

I'm currently writing to you from SFO Terminal 1, as I wait for my flight to Texas! I can't wait to learn about PDEs this summer.

## Grafting

There's no Wi-Fi in tunnels, so on the train ride to the airport, I decided to think about the prospects of becoming a hobby horticulturist in my new apartment. I recently saw a reel on Instagram about how adding lemon juice to smoothies containing spinach can activate the spinach and improve its health benefits. Thinking about it, I wonder if doing this also reduces the probabilities of developing kidney stones. And that thought let me slip into the following rabbit hole of a question: "Would it be feasible to grow limes or lemons at my new apartment?"

Well, I started with the prospects of lemons; after all, this blog is called lemonade. As a side note, this blog is called lemonade and not limeade despite the fact that I like limes more than lemons! Anyway, I looked into it, but it turns out that lemons aren't "true to seed". What that means is supposedly that if I plant a lemon seed, because of how large the genetic diversity of lemons is, the lemon might not even taste good! In fact, it will probably taste pretty bad! I would hate to grow a lemon tree for a year (or even five) only to find that the lemons it made weren't what I was expecting! I can't even grow many of them because I simply don't have the space. Additionally, according to Google's AI, it apparently isn't possible to tell if a lemon seed will produce good fruit! 😭 I wonder if there's a way to reduce the genetic variation to make limes easier to grow from seeds?

Luckily, key limes, sweet oranges, and basically all of those yummy varieties that we love and enjoy are a different story. I can't wait to try growing a key lime.

That being said, how do we get a consistent supply of yummy lemons if they're so genetically diverse? I would hate as a farmer to have to grow 100 trees to only sell lemons from a handful of them. I haven't looked into it so thoroughly yet, but one way a Reddit user mentioned was grafting! Apparently, you can just take plants and merge them together into sort of "hybrid" plants, and they can even have the best parts of both of the original plants! One use of this method is to provide better rooting systems to plants with naturally insufficient rooting systems.

This has to be the coolest technique I've ever heard of. Does this mean we could plant something with an immaculate rooting system, and then graft five or six different plants of other types to it, and have, for example, a banana-orange-lime-apple-pear tree?! There's no way that could be true... could it? I need to do some more research on this.

## GPUs

On the other hand, some things you unfortunately can't graft together apparently are RAM! I learned that from an entertaining YouTube video by Linus Tech Tips. I've recently been trying to improve my hardware situation... limited support for building things with my M2 chip has caused me to consider whether maybe it would be a good idea to set up a better system. Google Colab doesn't seem to be too much help, since it has pretty strict limits on GPU usage and I can barely run one CV notebook (if even one) before I hit my limit. Maybe I could "graft" together a bunch of different low-end GPUs?

Interestingly, it turns out that HuggingFace is now working on a project called ZeroGPU, a project dedicated to democratizing GPU access! I can't wait for that. For some other updates, today I read about rotary embeddings (RoPE): a type of position encoding from [this article by EleutherAI](https://blog.eleuther.ai/rotary-embeddings/). This was super cool, reading about how they thought of implementing the use of complex numbers in reaction to the geometry of their problem was pretty insightful. I also read about a few other things:
1. ChuXin, a 1.6B parameter language model (that actually uses RoPE)
2. SQLCoder-8B: a model for generating SQL based on Llama 3
3. Stable LM 2: a 1.6B model that doesn't have as large hardware requirements
4. [Are GPTs Good Embedding Models](https://towardsdatascience.com/are-gpts-good-embedding-models-28d8ef6f3f63): an article highlighting the benefits of fine-tuning with contrastive loss
5. [This article about some research at UC Berkeley!](https://www.marktechpost.com/2024/05/11/uc-berkeley-researchers-introduce-learnable-latent-codes-as-bridges-lcb-a-novel-ai-approach-that-combines-the-abstract-reasoning-capabilities-of-large-language-models-with-low-level-action-policies/)

and I'm looking forward to reading the paper *EE-LLM: Large-Scale Training and Inference of Early-Exit Large Language Models with 3D Parallelism* by Yanxi Chen, Xuchen Pan, Yaling Li, Bolin Ding, and Jingren Zhou at some point on my flight (assuming I don't fall asleep).

Until tomorrow!
