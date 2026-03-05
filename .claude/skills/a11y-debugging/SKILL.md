# Accessibility Debugging Skill

Use this skill to audit and debug web accessibility issues using Chrome DevTools MCP. Based on web.dev accessibility guidelines.

## When to Use

- Auditing a page for WCAG compliance
- Debugging screen reader behavior
- Verifying keyboard navigation works correctly
- Checking color contrast, tap target sizes, heading hierarchy

## Key Concept: Visual Hiding vs. AT Visibility

Visually hiding an element behaves differently for assistive technology:

| Method | Visually hidden | Hidden from screen readers |
|--------|----------------|---------------------------|
| `opacity: 0` | Yes | No — still announced |
| `visibility: hidden` | Yes | Yes |
| `display: none` | Yes | Yes |
| `aria-hidden="true"` | No | Yes |

Use `take_snapshot` to see what screen readers actually perceive — it captures the a11y tree, not the visual DOM.

## Audit Workflow

### Step 1: Lighthouse Baseline
Run an automated audit first to identify low-hanging fruit:
```
lighthouse_audit
```
Parse large reports using pagination or save to filePath.

### Step 2: Check Browser Console for Native Warnings
```
list_console_messages → filter types: ["error", "warn"]
```
The browser natively warns about missing labels, invalid ARIA roles, and duplicate IDs.

### Step 3: Snapshot the A11y Tree
```
take_snapshot
```
Review heading hierarchy (h1 → h2 → h3), landmark roles (main, nav, aside), and form label associations.

### Step 4: Verify with evaluate_script
For contrast ratios not caught by Lighthouse:
```javascript
() => {
  const el = document.querySelector('YOUR_SELECTOR');
  const style = window.getComputedStyle(el);
  return {
    color: style.color,
    background: style.backgroundColor,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight
  };
}
```

### Step 5: Test Keyboard Navigation
```
press_key "Tab"        // Move focus forward
press_key "Shift+Tab"  // Move focus backward
press_key "Enter"      // Activate focused element
press_key "Escape"     // Close modals/dropdowns
```

Use `take_snapshot` between key presses to observe focus movement.

## Checklist

- [ ] Heading hierarchy is logical (no skipped levels)
- [ ] All images have meaningful `alt` text (or `alt=""` if decorative)
- [ ] All form inputs have associated `<label>` elements
- [ ] Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] Tap targets are ≥ 48×48px on mobile
- [ ] Page has a `<title>` and `lang` attribute on `<html>`
- [ ] No keyboard traps — focus can always move forward and backward
- [ ] Modals return focus to trigger element on close
- [ ] Viewport meta does not disable user scaling

## Tap Target Size Check
```javascript
() => {
  const small = [];
  document.querySelectorAll('button, a, input, [role="button"]').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 48 || rect.height < 48) {
      small.push({ tag: el.tagName, text: el.textContent?.trim().slice(0, 50), width: rect.width, height: rect.height });
    }
  });
  return small;
}
```
