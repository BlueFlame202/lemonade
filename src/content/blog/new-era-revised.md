---
title: "New Era Revised"
description: "My Vision"
image: "/img/pics/IMG_0448.jpg"
author: "Aathreya Kadambi"
date: "December 23, 2025"
category: ['cs', 'life', 'philosophy']
---

Not too long ago, I made <a href="https://aathreyakadambi.vercel.app/blog/a-new-era">a post</a> that I wanted to make my posts on this blog less "esoteric" and more approachable. I also wanted to organize my posts more to be more focused. It all stemmed from a few questions:
1. What do I want to write/speak about?
2. What will others be interested in reading/hearing/discussing?
3. How can I be organized and focused while not writing about only one thing?

At the time, I was doing research and slowly becoming anxious about graduate school and my lack of publications. I was also realizing that many readers of my blog might not not be interested in mathematical details, but might find beauty in unconventional or insightful results. In that post, I attempted to change the character of Lemonade itself. This confused me because it meant discontinuing or changing the character of posts I was looking forward to.

At the time, I incorrectly conflated the answers to 1 and 2. I thought that I could only write about the intersection of 1 and 2, and I also made the mistake of assuming I knew what the answer to each of those questions was.

One thing I realized is that the separation I was looking for could be aided by a better UI. I've made several changes to my blog to address this.

## Categories

![pagination](/img/pics/categories.png)

The first thing to notice is the new categories! This way, I can organize my writing into topics, so that interested readers can better find what they are looking for. This handles question 2 above, while also allowing for a broad answer to 1. Additionally, by thinking about which category I'd like to focus on in my life at the moment, it also helps answer 3. Right now, we take a union of posts from each category selected, but in the future I may consider supporting intersection, which could be interesting.

With the above changes, I added some categories which will be targeted towards certain audiences. For example, after taking a creative writing class this fall, I hope to add creative writing posts to "artistic", and "ml" might be a topic of interest to an undergraduate reading group I joined.

## Pagination

![pagination](/img/pics/pagination.png)

The second thing to notice is the use of pagination. This is a feature I've been meaning to implement for a while. This way, images can load faster (though lazy image loading was already enabled). It's symbolic of an effort to be focused and see less at one time, and also a way of reducing the half-life of my incorrect statements.

## `posts.ts`

![poststx](/img/pics/integrating_posts.png)

On the implementation side of things, I was doing a silly thing where I was adding each post manually, so that I could also include posts from our SAAS education blog and my old posts. This was in part because originally, I didn't know how Astro schemas worked. I started using Astro schemas a while ago for updating the News widget, but was still thinking about how to integrate reposts and old posts. I've finally done it by creating a file called `posts.ts` along with better cross-file types in `types/blog.ts`. `posts.ts` just includes the old posts and reposts, and then I can integrate them via logic in `blog.astro`. This slightly reduces the barrier to posting because to be honest, the growing list was getting out of hand! I kept the full list at this point in time in `posts.ts` for the memories. In the future, I plan to move towards having all types in `types/`; I haven't done it so far because while it feels nice programmatically, it won't really have any forseeable impact on the website aside from code readability.

With all these changes, I'm looking forward to getting back to writing about what I enjoy! :)