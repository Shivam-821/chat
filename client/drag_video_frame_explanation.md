---
description: Explanation of VideoFrame2 Draggable Feature
---

This workflow explains the implementation details of the draggable "Picture in Picture" mode (`VideoFrame2`) using React Pointer Events and bounding box constraints.

## Overview

The feature allows the user to click, hold, and drag a smaller video frame (e.g., Picture-in-Picture) around a larger container frame. It uses standard DOM Pointer Events (`onPointerDown`, `onPointerMove`, `onPointerUp`) instead of traditional HTML5 Drag-and-Drop APIs, allowing for smoother cross-device behavior (both mouse and touch).

## Step-by-Step Code Explanation

### 1. State and Refs

```tsx
const [position, setPosition] = useState({ x: 0, y: 0 });
const isDragging = useRef(false);
const startPos = useRef({ x: 0, y: 0 });
const containerRef = useRef<HTMLDivElement>(null);
const draggableRef = useRef<HTMLDivElement>(null);
```

- `position`: A React state that tracks the current `(x, y)` translation of the draggable frame. This triggers component re-renders to move the UI element visually.
- `isDragging`: A `useRef` boolean to efficiently track whether the user is currently holding down the mouse/touch. We use a ref instead of state so it does not cause unnecessary re-renders when changing.
- `startPos`: Tracks the initial offset between the mouse cursor and the element's top-left corner when the drag starts.
- `containerRef` & `draggableRef`: References to the actual HTML DOM nodes. We need these to measure their physical dimensions on the screen.

### 2. `handlePointerDown`

```tsx
const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
  isDragging.current = true;
  startPos.current = {
    x: e.clientX - position.x,
    y: e.clientY - position.y,
  };
  e.currentTarget.setPointerCapture(e.pointerId);
};
```

- Fires when the user clicks or touches the small frame.
- Sets `isDragging` to `true`.
- Calculates the initial offset (`startPos`) so the element doesn't suddenly "snap" its top-left corner directly to the cursor.
- `setPointerCapture`: This is a crucial Web API feature. It ensures that even if you drag the cursor extremely fast and it physically leaves the boundary of the `div`, the `div` still continues to catch the pointer movement events.

### 3. `handlePointerMove`

```tsx
const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
  if (!isDragging.current || !containerRef.current || !draggableRef.current)
    return;

  let newX = e.clientX - startPos.current.x;
  let newY = e.clientY - startPos.current.y;

  const containerRect = containerRef.current.getBoundingClientRect();
  const draggableRect = draggableRef.current.getBoundingClientRect();

  // Bounds checking constraints
  const maxX = containerRect.width - draggableRect.width;
  const maxY = containerRect.height - draggableRect.height;

  if (newX < 0) newX = 0;
  if (newY < 0) newY = 0;
  if (newX > maxX) newX = maxX;
  if (newY > maxY) newY = maxY;

  setPosition({ x: newX, y: newY });
};
```

- Fires continuously as the user moves their mouse or finger across the screen.
- First, it ensures that `isDragging` is true and refs are properly attached to DOM nodes.
- Calculates the raw, unconstrained `newX` and `newY` based on the cursor's current position minus the initial offset gap.
- Measures the bounding dimensions of the parent container and the small draggable `div`.
- It calculates `maxX` and `maxY`. A draggable element hits the right edge when its left offset `X` plus its own `width` equals the parent container's width.
- It applies the boundary checking: clamping the values so they cannot drop below `0` or exceed the limits.
- Finally, it updates the `position` state to apply the new, legal constrained coordinates.

### 4. `handlePointerUp`

```tsx
const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
  isDragging.current = false;
  e.currentTarget.releasePointerCapture(e.pointerId);
};
```

- Fires when the user releases the mouse button or lifts their finger.
- Resets the `isDragging` to false and releases the pointer capture cleanly.

### 5. Applying the Position via Transform

```tsx
<div
  ref={draggableRef}
  style={{
    transform: `translate(${position.x}px, ${position.y}px)`,
    top: 0,
    left: 0
  }}
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onPointerCancel={handlePointerUp}
>
```

- The actual movement happens in CSS `style`.
- **Performance consideration:** We use CSS `transform: translate()` instead of altering `left` and `top`. Changing transforms leverages the GPU and prevents heavy layout recalculations (reflows) in the browser, providing a butter-smooth 60fps drag experience.
