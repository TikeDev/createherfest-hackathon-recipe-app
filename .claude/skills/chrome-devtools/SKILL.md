# Chrome DevTools MCP Skill

Use this skill for efficient debugging, troubleshooting, and browser automation through Chrome DevTools integration.

## When to Use

- Debugging web page rendering issues
- Observing page state (DOM structure, element positions, rendered output)
- Analyzing performance and network requests
- Inspecting console errors and warnings
- Capturing screenshots or accessibility snapshots

## Browser Management

Chrome starts automatically on the first tool invocation using a persistent profile. Configuration is available through CLI arguments.

## Recommended Workflow

1. **List pages** — call `list_pages` to see all open tabs and their IDs
2. **Select page** — call `select_page` with the relevant page ID
3. **Take a snapshot** — call `take_snapshot` to get the a11y tree with element UIDs
4. **Interact** — use UIDs from the snapshot to `click`, `fill`, `press_key`, etc.
5. **Verify** — use `evaluate_script` to confirm state, not just visuals

## Snapshot vs Screenshot

| Tool | Use when |
|------|----------|
| `take_snapshot` | Default — faster, gives UIDs for interaction, shows a11y tree |
| `take_screenshot` | Only when you need visual pixel-level details (layout, colors) |

**Never declare a UI element "correct" based on a screenshot alone.** Always verify position with `evaluate_script` using `getBoundingClientRect()`.

## Element Identification

After `take_snapshot`, each element has a unique `uid`. Pass that uid to:
- `click` — left/right/middle click, with optional modifier keys
- `fill` — type into inputs or select from dropdowns
- `hover` — trigger hover states
- `press_key` — keyboard shortcuts (e.g., `"Control+A"`, `"Enter"`)

## Debugging Console Errors

```
list_console_messages → filter by types: ["error"]
get_console_message → get full details for a specific message ID
```

## Debugging Network Issues

```
list_network_requests → see all requests with status codes
get_network_request → get full request/response body for a specific reqid
```

Use `resourceTypes` filter (e.g., `["fetch", "xhr"]`) to narrow results.

## Performance Analysis

```
performance_start_trace (reload: true, autoStop: true)
→ performance_stop_trace
→ performance_analyze_insight (insightSetId, insightName)
```

Common insight names: `LCPBreakdown`, `RenderBlocking`, `DocumentLatency`

## Output Size Management

For large outputs, use the `filePath` parameter to write to a file instead of returning inline:
- `take_screenshot filePath: "debug/screenshot.png"`
- `get_network_request responseFilePath: "debug/response.json"`

Use `pageSize` and `pageIdx` for pagination on `list_console_messages` and `list_network_requests`.

## Slim Mode

If only basic browser tasks are needed, slim mode exposes just three tools: navigate, evaluate_script, take_screenshot. Not available for full debugging workflows.

## Troubleshooting

- **No pages found**: Chrome must be running with `--remote-debugging-port=9222`
- **Connection refused**: Verify with `curl http://127.0.0.1:9222/json/version`
- **Element not found after snapshot**: Re-take the snapshot — UIDs are session-specific
