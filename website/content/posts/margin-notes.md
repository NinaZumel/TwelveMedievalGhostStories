---
title: Adventures With Margin Notes
display_title: Adventures With Margin Notes
description: Some notes on what I learned.
date: '2024-09-03'
tags:
  - background
---

It started with an idle thought: *I wonder if there's an eleventy template for Tufte style?* I'm no kind of web developer or designer at all, but having moved some personal blogs to eleventy, I've been feeling more confident about experimenting.

The first thing I found was the [**Eleventufte template**](https://eleventufte.netlify.app/): ready to go, seemingly perfect for a website novice like me. It looks beautiful. And it was easy. The template is quite bare bones, but I played with it long enough to establish that even I could embellish it with the additional features I wanted.

However. The template works, but is a little long in the tooth, and will only get more so. The `tufte-markdown` package has not been updated in several years. One nice feature of the template is that it supports both numbered and unnumbered marginalia.[^1] But one **_large_** minus from the perspective of my test case is that you can only have one of each kind of note in a single paragraph. Any additional notes drop down to the end of the page, as standard footnotes. They also drop down to the bottom when two notes would collide. 

I imagine this limitation is perfectly fine for at least eighty percent of users, but it is not well suited for scholarly work like the Byland Abbey manuscript and translation, where the notes are dense, and often quite long.

After more searching, I found [Mark Llobrera's "Sidenotes" article](https://markllobrera.com/posts/sidenotes/); he has a **runtime Javascript solution (sidenotes.js)** that he adapted from someone else. In principle, this is a nearly drop-in solution. In practice (for me), the easiest way to get it to work was to basically borrow his entire template, strip out what I don't need[^2], and go. But since he and I both started our blogs from the eleventy starter blog template, it was not as hard to figure out as it would have been, had I been less familiar with the structure. And now I know something about grids. Hurray, I guess?

This solution only supports numbered notes, but it does a *heroic* job of spacing them out. For narrow browser widths, the notes behave like ordinary footnotes, falling to the bottom of the page, with "back" buttons. For wider widths, when the notes are in the margin, clicking on the note superscript highlights the matching note,[^3] which helps when they are not aligned.

Overall, I'm happy with this solution. There are still some little things: I personally prefer a slightly wider text column than this template uses, and I've noticed that the main text sometimes bleeds into the margin notes (see note 27 in the [Latin text](/latin/), for example). I've tried to fix these issues, but this grid setup is incredibly brittle, so I've left it alone. I might (someday) try to recreate a simpler version of this template, but this is great, for a first attempt.

One thing to mention, if you are interested in playing with this implementation: while working on the site with a live local preview up, I found that any change to the site will drop the notes to the bottom. But refreshing the page puts the notes back in the margin. Something to be aware of.

If you are interested in non-eleventy-specific approaches to sidenotes, there is [a nice survey of different approaches on Gwern.net](https://gwern.net/sidenote). The general recommendation there is Tufte-CSS for general users, runtime Javascript for heavy footnoters---consistent with what I experienced. I was rather intrigued by [Molly White's `annotate`](https://github.com/molly/annotate), but there's no eleventy template using it that I'm aware of. So I'll just have to wait for someone to make one.


[^1]: It actually supports three different kinds of notes, but visually, it's two.
[^2]: Don't need yet, anyway.
[^3]: Have you tried it yet? Try it! It's neat!


