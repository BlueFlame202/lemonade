---
layout: ../../layouts/BlogPostLayout.astro
title: "SLAHMR and New Years Updates"
description: "Investigations"
image: "/img/pics/000084_001.png"
author: "Aathreya Kadambi"
date: "January 7, 2025"
---

## Table of Contents
- [Blog Updates](#blog-updates)
- [Experiments with SLAHMR](#experiments-with-slahmr)
    - [Bike Race](#bike-race)
    - [Shoveling Snow](#shoveling-snow)
    - [Blue Angels](#blue-angels)
    - [Other Videos](#other-videos)
- [January Planned Posts](#january-planned-posts)

Blog Updates
-----------------------

Happy New Year! I'm a bit late... unforunately. My backlog of blog posts has grown astonishingly, all because I got slightly stuck on my second ladder operators post! I'm really close to being done, but the proof of the result is evading me. But now I have to make this one, which makes me feel guilty about the other planned ones which are nearly done but not ready yet... maybe at the end of this post I'll sketch out some of the posts I plan to finish up and release in this next week. :-)

In any case, in the last two days, I was playing around with this thing called SLAHMR! It's a model for pose detection and tracking, but it's especially cool because it also models the motion of the camera itself, along with a ground plane!

In this post, I mainly want to discuss a few features I noticed of the SLAHMR model:
- **Covers Bodies Accurately**
- **Slight Foot Skating Can Still Occur** (e.g. if there are multiple people in the scene, and there is a complicated tradeoff in the losses by fixing a ground plane which allows for greater joint stiffness elsewhere)
- **Joint Stiffness** (likely due to the optimization on the shape and pose priors)
- **Increased Stability** (due to modeling the camera, we can adjust view much better)

Experiments with SLAHMR
-------------------------

For my experiments, I used three 3-second clips: one with my mom recording me shoveling snow, one of my brother and dad coming back from my brother's bike race, and one of a crowd of people in SF enjoying the Fleet Week air show.

<center><video width="45%" controls muted>
    <source src="/img/pics/slahmr-pics/IMG_6743.mov" type="video/quicktime">
    <source src="/img/pics/slahmr-pics/IMG_6743.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video></center>

<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/IMG_7143.mov" type="video/quicktime">
    <source src="/img/pics/slahmr-pics/IMG_7143.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<video width="35%" controls muted>
    <source src="/img/pics/slahmr-pics/IMG_6145.mov" type="video/quicktime">
    <source src="/img/pics/slahmr-pics/IMG_6145.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
</div>

After runnnig SLAHMR, we get the following:

<center><video width="45%" controls muted>
    <source src="/img/pics/slahmr-pics/IMG_6743_motion_chunks_grid.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video></center>

<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/IMG_7143_motion_chunks_grid.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<video width="35%" controls muted>
    <source src="/img/pics/slahmr-pics/IMG_6145_motion_chunks_grid.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
</div>

The first two look pretty good! 🔥 The third one is a bit wacky though. I'll discuss each video in a bit more detail below.

Bike Race
--------------------------
This one is very good! Let's take a closer look at the input PHALP videos in comparison to the resulting ones:
<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<video width="45%" controls muted>
    <source src="/img/pics/slahmr-pics/bike-race/IMG_6743_input_final_000000_above.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<video width="45%" controls muted>
    <source src="/img/pics/slahmr-pics/bike-race/IMG_6743_motion_chunks_final_000220_above.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
</div>
<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<video width="45%" controls muted>
    <source src="/img/pics/slahmr-pics/bike-race/IMG_6743_input_final_000000_src_cam.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<video width="45%" controls muted>
    <source src="/img/pics/slahmr-pics/bike-race/IMG_6743_motion_chunks_final_000220_src_cam.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
</div>

The left videos are the PHALP inputs and the right ones are the output ones (you can tell by the presence of the ground plane). Here are some things I'm noticing:

**Overall, Cover's Bodies!** Overall, the SMPL body models seem to line up with the people in the video, which is great!

**Slight Foot Skating:** You can see the biker (my brother) seems to experience some foot skating in the upper right video, while my dad seems to be standing still. The PHALP input seems to capture the motion of both people slightly better, although the joints seem to be bent more unnaturally. That being said, the videos on the right seem to be making good contact with the ground plane. It appears that maybe the energy penalty from the foot skating was counteracted by the better stability from my dad's feet being stuck to the ground plane.

**Joint Stiffness:** It seems to me that compared to the PHALP input, the SLAHMR results tend to have stiffer leg joints. We see that here with my dad's legs. I believe this makes sense based on the shape/pose priors and optimization.

Here are some other plots:
<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<img src="/img/pics/slahmr-pics/bike-race/bone_length.png" width="45%" />
<img src="/img/pics/slahmr-pics/bike-race/contact_height.png" width="45%" />
</div>
<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<img src="/img/pics/slahmr-pics/bike-race/contact_vel.png" width="45%" />
<img src="/img/pics/slahmr-pics/bike-race/joints2d.png" width="45%" />
</div>
From left to right, top to bottom, these are the losses from Bone Length, Contact Height, Contact Velocity, and 2D Joints. I'm actually not totally sure what the box and whisker necessarily represents (perhaps over all the people in the video?) but at the very least, we see a general pattern of decay. The spikes seem to be due to the fact that we progressively increase how much of the video we are processing.

Shoveling Snow
--------------------------

While the previous video had two subjects, this one just has one.
<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/shoveling-snow/IMG_7143_input_final_000000_above.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/shoveling-snow/IMG_7143_motion_chunks_final_000200_above.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
</div>
<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/shoveling-snow/IMG_7143_input_final_000000_src_cam.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/shoveling-snow/IMG_7143_motion_chunks_final_000200_src_cam.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
</div>

**Overall, Cover's Bodies!** Overall, the SMPL body models seem to line up with the people in the video, which is great!

**Joint Stiffness:** Again, we see a bit of joint stiffness, but in this case it is actually a good thing, matches the original much better: hand stays in better contact with the shovel. 

**Increased Stability:** The right top video has significantly better stability than the left top one.

The plots are relatively the same in terms of interpretation. The shape prior was particularly interesting though:
<center>
<img src="/img/pics/slahmr-pics/shoveling-snow/shape_prior.png" width="45%" />
</center>
I'm not sure why it seems to oscillate so smoothly like this. Perhaps it is coincidence?

Here's one more comparison to showcsae the increased stability and joint stiffness (see the legs) when we change the view:
<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/shoveling-snow/IMG_7143_input_final_000000_side.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/shoveling-snow/IMG_7143_motion_chunks_final_000200_side.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
</div>

Blue Angels
--------------------------

This one was particularly funny but had issues.
<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/blue-angels/IMG_6145_input_final_000000_side.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/blue-angels/IMG_6145_motion_chunks_final_000200_side.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
</div>
<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/blue-angels/IMG_6145_input_final_000000_src_cam.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
<video width="25%" controls muted>
    <source src="/img/pics/slahmr-pics/blue-angels/IMG_6145_motion_chunks_final_000200_src_cam.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>
</div>

It's interesting to note that here, the PHALP inputs aren't particularly bad (except for that blue guy casually floating around hehe). I think the issue here was more that the ground plane was abnormally slanted in the original video (it's San Francisco) and it probably also had local curvature (which ideally, shouldn't be too much of a problem to be honest). But I think this caused the initial body models to be very offset from things like the ground plane, which probably caused a weird initial loss/gradient that just threw it on an entirely different course towards noise.

<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<img src="/img/pics/slahmr-pics/blue-angels/bone_length.png" width="45%" />
<img src="/img/pics/slahmr-pics/blue-angels/contact_height.png" width="45%" />
</div>
<div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
<img src="/img/pics/slahmr-pics/blue-angels/contact_vel.png" width="45%" />
<img src="/img/pics/slahmr-pics/blue-angels/joints2d.png" width="45%" />
</div>

Looking at these losses we get maybe another side of the story (?): perhaps as the camera panned around, several new people were added. This is why we see an increasing step situation, and the losses likely barely decreased each time because the initial conditions themselves were not very good. In fact, I think it might be that the initial optimization step on the first chunk of the video might have interfered too much with the remaining chunks, causing everything to kind of jumble up. Afterwards, I think pose detection/matching tends to be a sort of "jigsaw puzzle problem", so you need to be very close to the true solution to have good convergence. I think here, the PHALP inputs were just too far off themselves to produce good SLAHMR results.

While I still have to read up on how PHALP works, perhaps a solution to this would therefore be to interleave steps of PHALP (detecting humans and then lifting to 3D) and SLAHMR optimization, or regenerating views each time and rerunning PHALP. These might take a while though, and perhaps other models might perform better at this particular task. Or maybe, one could change the regularization/lambda parameters mentioned in the paper, to decrease the effect or do the optimization with a lower step size.

Other Videos
---------------------

I also tried to see if it would do anything with this video that could fuel skinwalker conspiracies:
<center><video width="35%"controls muted>
    <source src="/img/pics/slahmr-pics/IMG_1333.mov" type="video/quicktime">
    <source src="/img/pics/slahmr-pics/IMG_1333.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video></center>

but it didn't, mainly just errored. I guess it's to be expected, since the joints are all wack and the only subject isn't human. Perhaps I'll try to fidget around one day to get this to work.

January Planned Posts
-------------------------

The issue with some of these posts is that after I've figured out what I want to write about and lay it out in my head too well, actually writing it out becomes a pain! And also, everything kind of temporarily slowed down in early November because I decided to go back to a Pomodoro schedule for the rest of the semester.

But... now with the new year and all, I promise to be more on top of my posts 🤧, especially in this next week so that I can get it all out of the way and out of my system before the semester starts!

**General Posts:**
1. Tales From Berkeley: I've been thinking, people should start documenting their lives as legends more in the modern day! Myths and legends from the ancient world are often just funny stories from people's lives. I think this would make life more interesting (at the least, we do have memes 😂).

I'll be compiling this one for a while, and I'll post maybe next month or later!

**Math Posts:**
1. Motivating Ladder Operators II: Boundedness of the spectrum of an operator might imply discretness of the point spectrum (and maybe even the other parts of the spectrum?). I really believe in this result, even if the true one might have extra conditions.
2. What is dx: Finally, I think I've come to better understand variational methods, what differentials really mean, forces, energy, and gradient descent. Lots of tangents (oh boy, this might be a long post).
3. Rectified Flow: I've recently been interested in optimal transport, and I checked out the TRELLIS paper and the one on rectified flow! They're amazing!
4. Krylov Methods: BiCGStab and and all the other numerical methods for solving systems have always been a bit of a jumble in my head, but apparently, they're all special cases of Krylov methods!
5. Kernel Methods and Mercer's Theorem: A proof of Mercer's theorem which we learned in my ML class, and then Sturm-Liouville equations.
6. USD: An apologetic post about why USD is actually designed extremely well.
7. Words I Pretend to Know: A confession about several words I use a lot but secretly don't actually understand! 😂 Of course, now I do though.
8. Graph Theory in n Dimensions: Simplicial complexes and generalizing graph theoretic analyses to them! Perhaps there are many more generalizations of things like the Euler characteristic, and if we take all combinations of the different counts of n-dimensional cells of a simplicial complex (moments being things like vertices, edges, faces, etc.) what do we get? 

The good thing is, math posts 1 through 3, 5, and 6 are well on their way to being done. These are the ones I can hope to finish this week or next. 4, 7, and 8 might take a while though. 

