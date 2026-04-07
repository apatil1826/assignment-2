# NexMap — Networking Tracker

A personal networking tracker to log contacts, record every interaction, and visualize your professional network. Built with Next.js 14 (App Router) + Tailwind CSS.

## What This App Does

You add people you've met or want to stay in touch with. Every time you have a coffee chat, send an email, or meet at an event, you log it. The app shows you who you've been neglecting, what your next steps are, and a visual map of your network.

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Stats overview, recent interactions, contacts due for follow-up |
| `/contacts` | Contacts List | Searchable grid of all contacts, last interaction, relationship strength |
| `/contacts/[id]` | Contact Profile | Full profile: details, interaction timeline, notes & next steps |
| `/log` | Log Interaction | Quick-entry form: pick contact, date, type, notes, next steps |
| `/network` | Network Map | Visual node graph of connections, clustered by tag/company |

## Data Model

All data lives in a React Context (in-memory, resets on refresh — database coming next week).

```ts
type Contact = {
  id: string;
  name: string;
  email?: string;
  linkedin?: string;
  company?: string;
  role?: string;
  tags: string[];         // e.g. ["recruiter", "classmate", "mentor"]
  createdAt: string;      // ISO date
};

type Interaction = {
  id: string;
  contactId: string;
  date: string;           // ISO date
  type: "coffee" | "email" | "linkedin" | "event" | "call" | "other";
  notes: string;
  nextSteps?: string;
};
```

## Style Preferences

- **Aesthetic**: Clean & minimal — like a well-designed notes app
- **Background**: White (`#ffffff`) with light gray (`#f3f4f6`) for cards/sections
- **Typography**: Slate-900 for headings, slate-500 for secondary text
- **Accent color**: Indigo-600 for buttons, links, active states
- **Cards**: Subtle shadow (`shadow-sm`), rounded-xl, white bg
- **Spacing**: Generous — lots of whitespace, no cramped layouts
- **No decorative gradients or heavy illustrations** — let the data breathe

## Component Structure

```
app/
  layout.tsx              # Shared layout with sidebar nav
  page.tsx                # Dashboard
  contacts/
    page.tsx              # Contacts list
    [id]/page.tsx         # Contact profile (dynamic route)
  log/page.tsx            # Log interaction form
  network/page.tsx        # Network map

components/
  Sidebar.tsx             # Shared nav (Dashboard, Contacts, Log, Network)
  ContactCard.tsx         # Card used in contacts list
  InteractionItem.tsx     # Single interaction in timeline
  StatCard.tsx            # Stat summary card for dashboard
  NetworkGraph.tsx        # SVG/canvas node graph

context/
  AppContext.tsx          # Global state: contacts[], interactions[]
                          # Actions: addContact, addInteraction
```

## Seed Data

Pre-populate with 5–6 sample contacts and 10–12 interactions so the app looks lived-in on first load. Include a mix of companies, tags, and interaction types.

## Playwright MCP

Configure Playwright MCP and verify:
1. Navigate to `/log`, fill in the form, submit — confirm the interaction appears on the contact's profile at `/contacts/[id]`
2. Navigate to `/contacts` and verify all seed contacts are visible

## Dev Notes

- Use Next.js 14 App Router (not Pages Router)
- Tailwind CSS v3
- No external UI libraries — build components from scratch with Tailwind
- Use `crypto.randomUUID()` for generating IDs
- Dates: store as ISO strings, display as "Jan 12, 2025" with `toLocaleDateString`
- The network map can use plain SVG — no need for D3 unless you want to add it
