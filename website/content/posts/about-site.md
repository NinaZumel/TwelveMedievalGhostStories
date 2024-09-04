---
title: About This Site
display_title: About This Site
description: A little bit of background.
date: '2024-09-03'
tags:
  - background
eleventyNavigation:
  key: About This Site
  order: 3
---

In 2019, David Mimno scanned in the Latin text of M.R. James's transcription of the Byland Abbey ghost stories, as well as the 1924 English translation of these stories by A.J. Grant. He archived his corrected scans as Markdown documents, on Github. Some four years later, I found that repository, forked it, and restructured[^1] the documents to be more readable online. This involved separating the stories into separate documents, in order to preserve the footnotes.

[^1]: I originally only restructured the translation, as that was what primarily interested me. Recently, I went back and restructured M.R. James's original Latin transcription, as well.

I had every intention of leaving the documents as plain Markdown, but then I got interested in experimenting with eleventy-friendly implementations of margin notes[^2]. I always did like margin notes. The Byland Abbey ghost story repository seemed like a good test case. 

After a little exploration, I chose [an implementation from Mark Llobrera](https://markllobrera.com/posts/sidenotes/), modifying his blog template to suit my tastes.


[^2]: For some notes on the experience, see [here](/posts/margin-notes/).

This website version restores both the Latin text and English translation into single documents, with the footnotes as margin notes. I like it, but it may not be for everyone: the notes are perhaps a little too dense and too long to be perfectly suited for marginalia. The [plain markdown still exists](https://github.com/NinaZumel/TwelveMedievalGhostStories/tree/master), if you prefer footnotes on short documents rather than margin notes on long ones.

-- Nina Zumel