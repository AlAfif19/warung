# Navigation and Home Scroll Design

## Goal

Make header navigation feel responsive and ensure clicking **Beranda** always places the user at the top of the home page.

## Current Behavior and Root Cause

- Clicking the `/` link while already on `/` does not trigger a route transition, so the browser keeps the current scroll position, including the chatbot section.
- `BackgroundAnimation` starts a `requestAnimationFrame` loop but does not cancel it during unmount. Every visit to the home page can leave another particle loop running after navigation.
- The particle connection loop creates sliced arrays every frame, adding avoidable allocation and garbage-collection work.

## Design

### Header navigation

The Beranda link will retain normal Next.js navigation between routes. When it is clicked while the current pathname is `/`, its click handler will prevent the no-op navigation and synchronously scroll the window to the top. The mobile menu will also close. Other navigation links keep their existing behavior and styling.

### Background animation lifecycle

`BackgroundAnimation` will retain the animation frame identifier returned by `requestAnimationFrame`. Its effect cleanup will cancel that frame and remove the resize listener, ensuring no animation continues after the home page unmounts.

The particle connection calculation will use indexed nested loops instead of `slice()` inside each frame. The visual output and particle count remain unchanged.

## Testing

- A Header test will verify that clicking Beranda on `/` scrolls to the top and does not perform a redundant navigation.
- A Header test will verify the mobile menu closes after clicking Beranda.
- A BackgroundAnimation test will verify that its scheduled animation frame is cancelled on unmount.
- Run the focused tests, the complete frontend test suite, lint, and production build.

## Scope

No visual redesign, route restructuring, backend change, or removal of the particle effect is included. Development-mode first compilation may still take longer than production navigation; this change targets avoidable runtime delay and leaked animation work.
