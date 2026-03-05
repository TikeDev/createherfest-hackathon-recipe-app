# LCP Debugging & Optimization Skill

Use this skill to diagnose and fix Largest Contentful Paint (LCP) performance issues using Chrome DevTools MCP.

## When to Use

- Page feels slow to load visually
- Lighthouse flags poor LCP score
- Investigating Module Federation remote load performance
- Optimizing images or critical render path

## Performance Targets

| Score | LCP Time |
|-------|----------|
| Good | ≤ 2.5s |
| Needs work | 2.5–4.0s |
| Poor | > 4.0s |

## The Four LCP Subparts

LCP time = TTFB + Resource load delay + Resource load duration + Element render delay

| Subpart | Target | What it measures |
|---------|--------|-----------------|
| TTFB | ~40% of LCP | Navigation → first HTML byte |
| Resource load delay | <10% | TTFB → resource download start |
| Resource load duration | ~40% | Time downloading the LCP asset |
| Element render delay | <10% | Download complete → element renders |

The delay phases (load delay + render delay) should be minimal. Large delays = optimization opportunity.

See [references/lcp-breakdown.md](references/lcp-breakdown.md) for full details.

## Debugging Workflow

### Step 1: Record a Trace
```
performance_start_trace (reload: true, autoStop: true)
performance_stop_trace
```

### Step 2: Analyze Insights
```
performance_analyze_insight (insightSetId: <id>, insightName: "LCPBreakdown")
performance_analyze_insight (insightSetId: <id>, insightName: "RenderBlocking")
performance_analyze_insight (insightSetId: <id>, insightName: "DocumentLatency")
```

### Step 3: Identify the LCP Element
Use the snippet in [references/lcp-snippets.md](references/lcp-snippets.md) with `evaluate_script` to get the exact element, timing data, and size.

### Step 4: Audit Common Issues
Run the audit snippet from [references/lcp-snippets.md](references/lcp-snippets.md) to check for:
- Lazy-loaded images in the initial viewport
- Large viewport images missing `fetchpriority="high"`
- Render-blocking scripts in `<head>`

### Step 5: Inspect Network Timing
```
list_network_requests → resourceTypes: ["image", "fetch"]
get_network_request (reqid: <id>) → check timing headers
```

## Fix by Bottleneck

See [references/optimization-strategies.md](references/optimization-strategies.md) for full details.

- **Large resource load delay** → add `fetchpriority="high"`, use `<link rel="preload">`, avoid `loading="lazy"` on viewport images
- **Large element render delay** → inline critical CSS, defer non-critical JS, consider SSR
- **Large resource load duration** → use WebP/AVIF, CDN, optimize caching
- **Large TTFB** → reduce redirects, edge caching, bfcache eligibility

## Element Types Considered for LCP

- `<img>` elements
- `<image>` inside `<svg>`
- `<video>` poster/first frame
- Elements with CSS `background-image: url()`
- Block-level elements with text content

See [references/elements-and-size.md](references/elements-and-size.md) for how element size is calculated.
