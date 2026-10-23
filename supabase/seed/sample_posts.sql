-- Five sample articles (imported from the former src/content/blog Markdown files) as drafts.
-- Safe to re-run: existing slugs are skipped.
insert into public.posts (slug, title, description, body, tags, status, published_at, sample)
values
('designing-a-queue-that-survives-a-bad-deploy', 'Designing a queue that survives a bad deploy', 'Sample post. Idempotent jobs, retries with backoff and a dead-letter table: how to make background work in Laravel safe to restart at any moment.', $post_body$Background jobs fail in the most boring ways. A deploy restarts the worker halfway through an email batch, a third-party API times out, a database connection drops for two seconds. None of these are bugs in your code, and all of them will happen on a Friday afternoon.

This is a sample article written to exercise the blog layout. The ideas are real, the examples are deliberately small.

## Assume every job runs twice

The first rule of queues is that "exactly once" is a lie you tell yourself. Workers get killed, jobs get released back onto the queue, and a retry can overlap with the original attempt. The only safe design is a job that produces the same result no matter how many times it runs.

### Make the side effect the unit of idempotency

Instead of asking "did this job run?", ask "did this *effect* happen?". Store a unique key for the effect and let the database enforce it.

```php
class SendInvoiceEmail implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function __construct(public int $invoiceId) {}

    public function handle(Mailer $mailer): void
    {
        $sent = DB::table('invoice_emails')->insertOrIgnore([
            'invoice_id' => $this->invoiceId,
            'sent_at' => now(),
        ]);

        // Zero rows inserted means a previous attempt already sent it.
        if ($sent === 0) {
            return;
        }

        $mailer->sendInvoice($this->invoiceId);
    }
}
```

There is still a gap between the insert and the send, so decide which failure you prefer: a customer who occasionally gets nothing, or one who occasionally gets two. For invoices, most teams pick "twice" and flip the order.

## Retry like you mean it

A job that retries immediately five times is a denial-of-service attack on whatever just failed. Use backoff, and give each attempt a little more room than the last.

- **Short, then long:** `[10, 60, 300, 900]` seconds covers a blip and an outage.
- **Add jitter** so a hundred failed jobs do not all return at the same second.
- **Retry only what can recover.** A validation error will fail the same way forever; fail it fast.

```php
public function backoff(): array
{
    return [10, 60, 300, 900];
}

public function retryUntil(): DateTime
{
    return now()->addHours(2);
}
```

## Keep a place for the jobs that never succeed

> A failed job you cannot see is not handled, it is hidden.

Laravel's `failed_jobs` table is a good start, but it is a graveyard. Give the team a small page that lists failures, groups them by exception, and lets someone retry a batch once the root cause is fixed. A dead-letter table you never look at is the same as having no table.

## A restart checklist

Before shipping any new job, run it through four questions:

1. What happens if it runs twice in parallel?
2. What happens if the worker is killed on the line after the side effect?
3. Does the retry schedule respect whatever it depends on?
4. Where does a human find out that it gave up?

If you can answer all four in a sentence each, deploy on Friday. Mostly.
$post_body$, array['Laravel', 'Architecture', 'Backend'], 'draft', '2026-10-12T00:00:00Z', true),
('from-scss-to-tailwind-4', 'From SCSS to Tailwind 4, one component at a time', 'Sample post. Moving a hand-written SCSS codebase to Tailwind 4 without a big-bang rewrite: tokens first, then variants, then components.', $post_body$Big-bang rewrites rarely survive contact with a real deadline. The migration that worked was boring on purpose: move the *decisions* first, then the markup, one component at a time.

This is a sample article written to exercise the blog layout.

## Tokens first

Tailwind 4 reads its theme from CSS, which makes the first step almost mechanical. Colors, fonts, and animation names move into one `@theme` block, and the old Sass variables can be deleted as soon as nothing references them.

```css
@theme {
  --color-ink: #111111;
  --color-gold: #f6c90e;
  --font-bebas: "Bebas Neue", Impact, sans-serif;
}
```

## Replace mixins with variants

Sass mixins that wrapped media queries become custom variants. After that, a responsive rule is a prefix instead of a nested block.

```css
@custom-variant tablet (@media (max-width: 768px));
@custom-variant fine (@media (any-pointer: fine));
```

Gating hover styles on a fine pointer, in particular, stopped being something every component had to remember.

## Order of work

1. Global tokens and base styles.
2. Small atoms: buttons, labels, rules.
3. Molecules and organisms that compose them.
4. Pages last, once nothing underneath still depends on Sass.

### A rule that saved time

Never migrate and redesign in the same commit. If a component changes shape, the diff cannot tell you whether it regressed.
$post_body$, array['Frontend', 'Tailwind'], 'draft', '2026-08-02T00:00:00Z', true),
('notes-on-system-architecture-for-small-teams', 'Notes on system architecture for small teams', 'Sample post. A modular monolith, boring data stores and explicit boundaries: the architecture choices that keep a small team shipping.', $post_body$Most architecture advice is written for companies with more engineers than you have users. For a small team, the job is different: keep the system understandable by one tired person at the end of a long week.

This is a sample article written to exercise the blog layout.

## Start with a modular monolith

One deployable, several well-named modules. The boundary between modules is a plain class interface, not a network call, so you get most of the discipline of services without the operational cost.

### What a boundary looks like

```php
interface Billing
{
    public function invoiceFor(Customer $customer): Invoice;
}
```

Other modules depend on `Billing`, never on its tables. If a module later has to become a service, the interface is already the contract.

## Prefer boring data stores

A relational database handles far more than most teams expect: queues, search for small datasets, and plenty of reporting. Add a new kind of store only when you can name the specific query that hurts.

## Write the decision down

A short decision record, a paragraph of context, the choice, and what you gave up, is worth more than a diagram. Six months later, nobody remembers why. The paragraph does.

> Architecture is the set of decisions that are expensive to change. Make fewer of them, and make them on purpose.

## Signals it is time to split

1. Two teams keep blocking each other in the same module.
2. One module needs to scale on a different curve than the rest.
3. A boundary has been stable for a year and the interface rarely changes.

Until then, keep it in one place.
$post_body$, array['Architecture', 'Backend', 'Laravel'], 'draft', '2026-04-09T00:00:00Z', true),
('reading-analytics-without-fooling-yourself', 'Reading analytics without fooling yourself', 'Sample post. Four habits for looking at traffic data honestly: define the question, segment before concluding, and distrust the nicest-looking chart.', $post_body$Dashboards are persuasive. A line that goes up feels like progress, and a line that goes down feels like a problem, regardless of whether either means anything. Four habits keep me honest.

This is a sample article written to exercise the blog layout.

## Write the question down first

"How is traffic?" is not a question. "Did the new landing page change how many visitors click the contact link?" is. If you cannot phrase the decision the number will inform, you are collecting a number for comfort.

## Segment before you conclude

An overall average hides the interesting part. Split by source, device, and new versus returning visitors before believing a trend.

| Segment | What it usually reveals |
| --- | --- |
| Source | Whether one referral is carrying everything |
| Device | Layout or performance problems on phones |
| New vs. returning | Whether the content builds a habit |

## Distrust the nicest chart

A smooth, rising line has usually been smoothed. Look at the raw daily numbers once, and note how noisy small samples are. Ten visits to a page is an anecdote.

## Keep a changelog next to the chart

Every deploy, campaign, and copy change goes in a dated list. Half of the "mysterious" spikes are explained there.

- Annotate releases directly in the tool when it allows.
- Record what you *expected* to happen before you look.
- Review the expectations after a month, not the charts.
$post_body$, array['Data', 'Analytics'], 'draft', '2026-06-24T00:00:00Z', true),
('why-i-moved-my-portfolio-to-astro', 'Why I moved my portfolio to Astro', 'Sample post. Shipping less JavaScript, keeping GSAP where it earns its place, and what a content-first framework changes for a personal site.', $post_body$A portfolio is a strange kind of product. It is mostly static, it must load instantly, and it is also the one place where the craft of the page *is* the argument. That combination made the framework choice more interesting than it looks.

This is a sample article written to exercise the blog layout.

## What I wanted from the stack

- HTML first, with JavaScript added only where something moves.
- Components I could reason about without a runtime shipped to every visitor.
- Room for GSAP and smooth scrolling on top, without fighting the framework.

## Islands are a budget, not a feature

Astro renders to plain HTML and hydrates only what you ask it to. On a page like this one, that turns out to be almost nothing: the interactivity is a handful of scripts that attach to existing markup.

```astro
---
const { title, href } = Astro.props;
---

<a href={href} class="group">
  <h2>{title}</h2>
</a>

<script>
  import "../js/pages/Home";
</script>
```

The script is bundled, deduplicated, and loaded as a module. There is no component tree to re-render and nothing to hydrate. That is the whole trick.

## Where the animation lives

Motion was the part I worried about. It stayed simple: GSAP plus ScrollTrigger drive the intro and the reveals, and a small scroll layer keeps the page smooth. All of it checks `prefers-reduced-motion` first.

> Motion should never cost load speed or readability. If it does, it is decoration.

### Things I stopped doing

1. Animating layout properties. Transforms and opacity only.
2. Hiding content until JavaScript arrives. The page works without it.
3. Adding a loading screen. The first paint is the hero.

## What I would tell my past self

Pick the framework that matches the *shape* of the site, not the one with the most tutorials. For a content-heavy, mostly-static page, shipping HTML is not a limitation. It is the feature.
$post_body$, array['Frontend', 'Astro', 'Performance'], 'draft', '2026-09-18T00:00:00Z', true)
on conflict (slug) do nothing
returning slug, status, published_at;