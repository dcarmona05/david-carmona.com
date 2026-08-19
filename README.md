# david-carmona.com

Personal portfolio site for David Carmona, Principal Designer — built with Next.js 14 (App Router) and Tailwind CSS.

Includes a home page, work/case studies index, about page (bio, experience, interviews), and a contact page with a working contact form and Cal.com booking widget.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) for scroll reveals and animation
- Deployed on [Netlify](https://www.netlify.com/)

## Development

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and fill in real values to enable the contact form (Resend) and AI chat widget (OpenAI) locally.

## Deployment

Pushes to `master` auto-deploy to Netlify. See `BUILD_LOG.md` for build history, known gotchas, and what's left to build.
