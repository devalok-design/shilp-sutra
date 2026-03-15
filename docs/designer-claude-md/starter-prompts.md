# Starter Prompts for Designers

Copy-paste these into your Claude Code CLI. Replace `[component]` with the component you're working on (e.g., Avatar, Input, Card).

---

## Very First Time (run this the first time you ever open Claude Code in this repo)

### "Hello, let's get started"

```
Hi! I'm a UI/UX designer and this is my first time using Claude Code. I don't write
code — you'll be doing all the coding for me. I'll be describing what I want visually
and verifying the results in Storybook.

Can you help me get set up?
1. Install all the dependencies for this project
2. Start Storybook so I can see the components
3. Give me a tour of my assigned components — what each one looks like right now,
   what variants and states they have
4. Suggest which component would be the easiest to start with so I can learn the workflow

I'll be describing changes in design terms (spacing, color, contrast, weight) and
you translate that into code. After each change, I'll check Storybook to see if it
looks right. Let's go!
```

---

## Getting Oriented (start of any new session)

### "Get me oriented"

```
I'm a designer working on polishing components in shilp-sutra. Can you:
1. Start Storybook so I can see components visually
2. Show me a quick summary of my assigned components — what variants, sizes, and states
   each one currently has
3. Tell me which component you think would be the best one to start with and why
```

---

## Starting Work on a Component

### "Begin a new component"

```
I want to start working on [component]. Please:
1. Create a new branch for this work
2. Show me everything [component] currently supports — variants, sizes, colors, states
3. Open its Storybook story so I can see how it looks right now
4. Tell me what you think could be improved visually, based on how similar components
   in shilp-sutra are designed
```

### "Study before changing"

```
Before I make any changes to [component], show me:
1. How it looks in Storybook right now (all variants and states)
2. How similar components in shilp-sutra handle the same things (sizes, hover, focus, colors)
3. What the design tokens available to us are (spacing, colors, radii, shadows)
I want to understand the design language before I touch anything.
```

---

## The Polish Loop (this is where you'll spend most of your time)

### "Fix something specific"

```
In [component], the [describe what bothers you visually]. Can you fix that?
Use existing shilp-sutra tokens — don't invent new values.
Update the Storybook story so I can verify.
```

Examples of how to describe visual issues:
- "the padding feels too cramped at the small size"
- "the hover state doesn't have enough contrast against the background"
- "the focus ring clips on rounded corners"
- "the spacing between the icon and label is inconsistent with how Button does it"
- "the border is too heavy in dark mode"
- "the disabled state looks the same as the default — it needs to feel more muted"

### "Add a missing variant or size"

```
[component] needs a [new variant/size]. Here's what I'm thinking:
- [describe the visual intent — what should it look like, feel like, when is it used]
- It should be consistent with how [other component] handles its [similar variant]
- Use existing tokens for spacing, colors, and radii

Please implement it and add it to the Storybook story so I can see it.
```

### "Make it match another component"

```
[component A] and [component B] should feel like they belong together, but right now
[describe the inconsistency — different radii, spacing, hover treatments, etc.].
Can you make [component A] match the pattern that [component B] uses?
Show me both in Storybook so I can compare.
```

### "Compare options"

```
I'm not sure which direction to go with [component]'s [aspect].
Can you show me two options:
- Option A: [describe]
- Option B: [describe]
Put both in the Storybook story so I can see them side by side and decide.
```

---

## Checking Your Work

### "Verify everything is clean"

```
Before I commit, can you:
1. Run the type checker and tests to make sure nothing is broken
2. Make sure the Storybook story covers all the changes I made
3. Show me a summary of everything that changed in plain English
```

### "Show me the before and after"

```
Can you describe what [component] looked like before my changes vs after?
I want to make sure the improvements are clear before I share with the team.
```

---

## Finishing and Sharing

### "Commit and push my work"

```
I'm happy with [component] now. Please:
1. Run type checker and tests one final time
2. Commit everything with a clear message describing the visual changes
3. Push the branch
4. Create a pull request with a description of what changed visually and why
```

### "Take a screenshot for the team"

```
Can you describe the key visual changes I made to [component] in a short message
I can share with my team? Focus on the design decisions, not the code.
Something like "Refined Avatar's hover state to use surface-3 for better contrast,
aligned border radius with Badge for consistency."
```

---

## Getting Unstuck

### "Something looks wrong"

```
Something doesn't look right in Storybook — [describe what you see].
Can you check what's going on and suggest a fix? Don't change anything yet,
just tell me what you think the issue is.
```

### "I want to undo my last change"

```
The last change didn't look right. Can you undo it and go back to how it was before?
```

### "I'm confused about tokens"

```
I'm not sure which token to use for [describe what you're trying to achieve].
Can you show me what tokens are available and which ones similar components use
for the same purpose?
```

### "I need to pause and come back later"

```
I need to stop for today. Can you:
1. Make sure everything is saved and committed
2. Push the branch so my work is safe
3. Give me a short summary of where I left off so I know what to do next time
```

### "Resuming work"

```
I'm back to work on [component]. Can you:
1. Switch to my branch for this component
2. Remind me where I left off
3. Start Storybook so I can see the current state
```

---

## Tips for Good Prompts

**Be visual, not technical.** You're a designer — describe what you see and what you want to see. Claude Code handles the code.

**Reference other components.** "Make it feel like Button" is a great prompt because it tells Claude Code to match an existing pattern rather than invent something new.

**Use specific words for spacing:** "too tight", "too loose", "needs breathing room", "cramped", "the gap between X and Y is too large"

**Use specific words for color/contrast:** "too muted", "too loud", "doesn't pop enough", "hard to read against the background", "needs more contrast", "looks washed out in dark mode"

**Use specific words for visual weight:** "too heavy", "too thin", "the border overwhelms the content", "the shadow is too aggressive", "feels flat — needs depth"

**Iterate in small steps.** One change at a time, verify in Storybook, then move on. Don't try to change 5 things at once.
