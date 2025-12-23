---
title: "Comments Enabled"
description: "You can now comment!"
image: "/img/pics/IMG_8039.jpg"
author: "Aathreya Kadambi"
date: "March 22, 2025"
category: ['cs', 'life']
---

Check it out! I finally got comments working on this Astro website. This means we're pretty much back to my Wordpress days, but now with a better understanding of what's going on under the hood!

I wanted to allow people to comment unanonmyously, but I also want to prevent identity theft. To do this, I added Google authentication too using `auth-astro`! That was honestly a bit of a pain, but hey, this is an amazing feature because I can now release protected posts and pages, which will allow me to go more public while simultaneously remaining more private.

One consideration I made was having comments be reverse chronological and replies be chronological. Let me know what you think of that below! :)

Finally, now that I have a database and forms and everything, I'm a bit worried about security. Let me know if you'd be down to stress test this website! ;)

One particular challenge with security on this blog will be that I want to keep it open source. As such, I anticipate that I will have to make security updates many times in the future. I'll keep track of security updates relating to this commenting system on this post!

## Comments Security Updates

**[March 24, 2025:]** (Thanks to Hunter Harling) Patched issue where users could manually edit name and email fields through HTML. Solved by passing in information through the Astro action instead of through the form.
<p class="text-sm">
- I'm not an expert, but I feel that it would have been nice to do it through middleware instead of passing in the whole Astro context into the action handler (feels more natural to have context information there). If you have an idea on how to improve on this, let me know!
</p>