---
category: Layout
---
The yourpeer site footer: black background, white text, a "Company" column (About, Contact, Donate, Terms, Privacy) and a "Resources" column of category links, a "Social" column (TikTok, Instagram, Facebook), ending with (c) Streetlives, Inc. Full width; content capped at `max-w-5xl`. Place it last on public, marketing-style pages. Needs `<YourPeerProvider>`.

```jsx
<main className="min-h-screen flex flex-col">
  <section className="flex-1 px-5 py-12">...</section>
  <Footer />
</main>
```
