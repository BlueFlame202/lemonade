---
layout: ../../layouts/BlogPostLayout.astro
title: "Roses and Radiance Fields"
description: "I visited Berkeley Horticultural! I've also been thinking about NeRFs...."
image: "/img/pics/20240427-berkeley-hort.jpg"
author: "Aathreya Kadambi"
slug: "roses-and-radiance-fields"
date: "April 27, 2024"
---

On Thursday, I happened to get 3 stems (two from a rose, and one from some other unrecognizable flower) because of an event on the glade at Berkeley. Since I've adopted so many succulents recently, I decided it couldn't hurt to try re-planting them also, to give my plant collection a bit more variety. But after consulting my mom and the internet, I found that actually, I probably needed a "root hormone", so today, I went to the Berkeley Horticultural Nursery for the first time to get some.

Berkeley Hort
-------------

Walking down the straight road to Berkeley Hort, I was at first uninterested in my surroundings and instead had my face buried in _System Theory_ by Zadeh and Polak (and other authors). After all, every road looked the same: a residential house encircled by a colorful assortment of succulents and flowering plants, and the ocassional toys sprawled across a small patch of grass. But as I got closer and closer to the nursery, I started to notice a change in scenery. Elderly people walked down the sidewalks, smiling and greeting me despite being strangers. A couple eagerly discussed what plants to take cuttings of. I started to see more vibrant plants, although perhaps I just hadn't noticed them before.

The Berkeley Hort was full of people when I arrived. Walking through the paths between plants, I paid special attention to an amazing collection of _Echeveria_s and _Aloe_s (the only plants I could identify at a glance) until I arrived the section for food. There, I found fairly inexpensive basil plants, as well as tomatoes, blueberries, cilantro, and anything else one could think of.

Walking through the section of edible plants, I heard the sound of a band playing, and at first I thought it was probably just a radio. But as I got closer, I stood in awe as I saw a group of kids playing music together, with a large crowd of children and their parents watching. I loved the music, and I thought it was pretty cool that this garden wasn't just a nursery for plants; it also fosters an amazing community.

After enjoying the music and the plants, I went to the front desk. Despite stumbling on my sentences to the point where I thought the lady at the front desk would never be able to understand me, I managed to procure my root hormone. Leaving the nursery, even with my irritating pollen and grass allergies, I felt refreshed. Walking back to the nearest bus stop, I took the 52 line back to Victory Point Cafe.

NeRFs
-----

Like I said in the last post, I've been meaning to get into some graphics/ML research, since I imagine it would naturally have a very geometric flavor. As such, I decided to finally figure out what the recent buzzword among my fellow undergraduate ML-obsessed friends, "NeRF", really meant. What is a "radiance field"? Actually, I couldn't get this from the paper (oops). Instead, I looked at reference 16: a paper on ray tracing by Kajiya and Herzen, as well as [a blog post by _Nathan Reed_](https://www.reedbeta.com/blog/the-radiance-field/).

It seems that a radiance field is a description of the radiance or light energy passing through a given point in space in a certain direction. In other words, we can describe it with a map from a five dimensional space (three for position, two two specify the angle) to an RGB value at each point and a volume density (with the volume density representing the chance that the light ray would simply stop at that point). In the paper behind NeRFs, they essentially used a multi-layered perceptron to approximate this map, and then approximated another integral to obtain the expected color of a ray passing through the frustum imposed by a camera viewing the scene. With two other optimizations (positional encoding and hierarchical volume sampling), they were able to get amazing results. I was especially intrigued by the positional encoding; it's pretty cool how the encoding function which just has a bunch of different sine and cosine transformations of various frequencies allows one to capture more "high-frequency variation" in the image.

That's a good summary of some of the major things I did today. Before I go to bed, I have to finish up some computer science homework (approximating metric TSP), do some differential geometry, and a lot of grading. So that's a wrap.