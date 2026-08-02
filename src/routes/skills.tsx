import { createFileRoute } from '@tanstack/react-router'
import { CTA, PageHero, Tags } from '../components/Site'
import { getSkills, getSiteSettings } from '../lib/sanity/data.functions'

export const Route = createFileRoute('/skills')({
  loader: async () => {
    const [groups, settings] = await Promise.all([getSkills(), getSiteSettings()])
    return { groups, settings }
  },
  head: () => ({
    meta: [
      { title: 'Skills — Kelvin Murimi' },
      { name: 'description', content: 'Tools and methods I work in — a skills legend.' },
    ],
  }),
  component: Page,
})

function Page() {
  const { groups, settings } = Route.useLoaderData()
  return (
    <main>
      <PageHero eyebrow="TOOLKIT / STACKS & METHODS" title="Skills.">
        <p>A working toolkit for moving from field evidence to shared understanding.</p>
      </PageHero>
      <section className="shell skill-grid">
        {groups.map((group, i) => (
          <article key={group._id}>
            <span className="num">0{i + 1}</span>
            <h2>{group.title}</h2>
            <Tags items={group.skills} />
          </article>
        ))}
      </section>
      <CTA title="Need these skills applied to your data?" contact={settings.contact} />
    </main>
  )
}
