'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useReducedMotion } from 'framer-motion';

const PAN_STEP = 140;
const FOCUSABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const MIN_FIT_SCALE = 0.4;
const MAX_FIT_SCALE = 1.15;
const TOP_MARGIN = 96; // clears CanvasNav, docked at top-20

// Mirrors react-zoom-pan-pinch's own internal getOffset() exactly (same
// formula, read from its source) — needed because our own pan target below
// has to land in the same coordinate system zoomToElement computes.
function getWorldOffset(el, wrapperEl, contentEl, scale) {
  const elRect = el.getBoundingClientRect();
  const wrapperRect = wrapperEl.getBoundingClientRect();
  const contentRect = contentEl.getBoundingClientRect();
  const xOff = wrapperRect.x * scale;
  const yOff = wrapperRect.y * scale;
  return {
    x: (elRect.x - contentRect.x + xOff) / scale,
    y: (elRect.y - contentRect.y + yOff) / scale,
  };
}

/**
 * The pan/zoom camera for the canvas front door (Phase 3). Renders real
 * server-rendered children (the Frame regions) inside react-zoom-pan-pinch's
 * transformed content div — no WebGL/canvas drawing, so full text content,
 * links, and a normal Tab order are all still real DOM.
 *
 * Exposes `panToRegion(id)` via ref so the page and CanvasNav can drive the
 * camera without this component needing to know about regions/labels itself.
 */
const CanvasStage = forwardRef(function CanvasStage(
  {
    children,
    initialRegionId,
    onActiveRegionChange,
    className = '',
    panningDisabled = false,
    onCanvasPointerDown,
    onCanvasPointerMove,
    onCanvasPointerUp,
    onPointerPositionChange,
    worldHeight,
  },
  ref
) {
  const innerRef = useRef(null);
  const wrapperRef = useRef(null);
  const lastFocusedRegionRef = useRef(initialRegionId ?? null);
  const reducedMotion = useReducedMotion();
  // Drives the custom scroll-position indicator below — the native
  // scrollbar only tracks the page's real (tiny) scroll range below the
  // canvas, since panning inside it is a CSS transform, not native scroll.
  const [scrollTrack, setScrollTrack] = useState({ progress: 0, thumbFraction: 1 });

  const updateScrollTrack = useCallback(
    (state) => {
      const wrapperEl = innerRef.current?.instance?.wrapperComponent;
      if (!wrapperEl || !worldHeight) return;
      const viewportHeight = wrapperEl.clientHeight;
      const scaledWorldHeight = worldHeight * state.scale;
      const scrollableRange = Math.max(scaledWorldHeight - viewportHeight, 0);
      const progress = scrollableRange > 0 ? Math.min(Math.max(-state.positionY / scrollableRange, 0), 1) : 0;
      const thumbFraction = Math.min(Math.max(viewportHeight / scaledWorldHeight, 0.05), 1);
      setScrollTrack({ progress, thumbFraction });
    },
    [worldHeight]
  );

  // Now that regions stack vertically with very different heights (a tall
  // Work grid vs. a short Contact form), zoomToElement's default "fit the
  // whole frame in view, centered" behavior zooms out so far on a tall
  // region that its content becomes unreadably small (confirmed: Work's
  // ~2150px-tall frame forced scale down to the 0.4 floor, and still didn't
  // fully fit). Instead: fit the frame's WIDTH only (ignore height — a
  // region taller than the viewport is just scrolled/panned within, same
  // as a normal page section), and align its TOP near the top of the
  // viewport rather than vertically centering it, which is what actually
  // reads as "jump to this section" instead of "jump to its middle."
  const panToRegion = useCallback(
    (regionId, { instant = false } = {}) => {
      const content = innerRef.current;
      if (!content || !regionId) return;
      const duration = instant || reducedMotion ? 0 : 450;
      const el = document.getElementById(`canvas-frame-${regionId}`);
      const wrapperEl = content.instance?.wrapperComponent;
      const contentEl = content.instance?.contentComponent;

      if (!el || !wrapperEl || !contentEl) {
        content.zoomToElement(`canvas-frame-${regionId}`, undefined, duration, 'easeOut');
        return;
      }

      const { scale: currentScale } = content.instance.transformState;
      const elRect = el.getBoundingClientRect();
      const wrapperRect = wrapperEl.getBoundingClientRect();
      const nodeWidth = elRect.width / currentScale;
      const targetScale = Math.min(Math.max(wrapperRect.width / nodeWidth, MIN_FIT_SCALE), MAX_FIT_SCALE);

      const worldOffset = getWorldOffset(el, wrapperEl, contentEl, currentScale);
      const offsetX = (wrapperRect.width - nodeWidth * targetScale) / 2;
      const positionX = (wrapperRect.left - worldOffset.x) * targetScale + offsetX;
      const positionY = (wrapperRect.top - worldOffset.y) * targetScale + TOP_MARGIN;

      content.setTransform(positionX, positionY, targetScale, duration, 'easeOut');
    },
    [reducedMotion]
  );

  // Converts a pointer event's screen coordinates into world-space canvas
  // coordinates (i.e. the same coordinate space Frame's x/y props use) —
  // needed by the Phase 3.5 collaborative tools (frame/text/pen/sticker
  // placement) to know where on the canvas a click/drag actually landed,
  // accounting for the live pan position and zoom scale.
  const screenToWorld = useCallback((clientX, clientY) => {
    const content = innerRef.current;
    const wrapperEl = content?.instance?.wrapperComponent;
    if (!content || !wrapperEl) return null;
    const { positionX, positionY, scale } = content.instance.transformState;
    const wrapperRect = wrapperEl.getBoundingClientRect();
    return {
      x: (clientX - wrapperRect.left - positionX) / scale,
      y: (clientY - wrapperRect.top - positionY) / scale,
    };
  }, []);

  useImperativeHandle(ref, () => ({ panToRegion, screenToWorld }), [panToRegion, screenToWorld]);

  // Snap to the initial region once on mount, instantly — no animated jump
  // the moment the page loads.
  useEffect(() => {
    if (!initialRegionId) return undefined;
    const timer = setTimeout(() => panToRegion(initialRegionId, { instant: true }), 0);
    return () => clearTimeout(timer);
    // Intentionally run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arrow-key panning. Skipped while a form field has focus (e.g. inside the
  // embedded Contact frame) so arrow keys keep their normal text-editing job.
  useEffect(() => {
    function onKeyDown(event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const active = document.activeElement;
      if (active && FOCUSABLE_TAGS.has(active.tagName)) return;

      const deltaByKey = {
        ArrowLeft: [PAN_STEP, 0],
        ArrowRight: [-PAN_STEP, 0],
        ArrowUp: [0, PAN_STEP],
        ArrowDown: [0, -PAN_STEP],
      };
      const delta = deltaByKey[event.key];
      if (!delta) return;

      const content = innerRef.current;
      if (!content) return;
      event.preventDefault();
      const { positionX, positionY, scale } = content.instance.transformState;
      content.setTransform(
        positionX + delta[0],
        positionY + delta[1],
        scale,
        reducedMotion ? 0 : 150,
        'linear'
      );
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [reducedMotion]);

  // Tab order must reach every frame regardless of camera position — so when
  // keyboard (or any) focus lands inside a frame that isn't the one the
  // camera is currently centered on, follow it instead of leaving focus
  // sitting somewhere off-screen and invisible.
  useEffect(() => {
    function onFocusIn(event) {
      // The browser's native "scroll the focused element into view" kicks in
      // on the TransformWrapper's own (overflow: hidden, so technically
      // scrollable) wrapper div before any of our code runs, nudging its
      // real scrollLeft/scrollTop. That then stacks with our CSS-transform
      // panning below and lands the camera somewhere wrong (reproduced: it
      // put About's content where Work's used to be). The canvas only ever
      // moves via the transform, never native scroll, so stomp it back to
      // zero before computing/applying our own pan.
      const wrapperEl = innerRef.current?.instance?.wrapperComponent;
      if (wrapperEl) {
        wrapperEl.scrollLeft = 0;
        wrapperEl.scrollTop = 0;
      }

      const frameEl = event.target.closest?.('[data-canvas-frame]');
      if (!frameEl) return;
      const regionId = frameEl.getAttribute('data-canvas-frame');
      if (regionId === lastFocusedRegionRef.current) return;
      lastFocusedRegionRef.current = regionId;
      onActiveRegionChange?.(regionId);
      panToRegion(regionId);
    }

    const node = wrapperRef.current;
    node?.addEventListener('focusin', onFocusIn);
    return () => node?.removeEventListener('focusin', onFocusIn);
  }, [onActiveRegionChange, panToRegion]);

  // While a Phase 3.5 create-tool (frame/text/pen/sticker) is active, the
  // library's own panning is disabled (see the `panning`/`pinch` props
  // below) and pointer events on the wrapper instead drive drawing —
  // translated into the same world-space coordinates Frame's x/y use.
  const handlePointerEvent = useCallback(
    (handler) => (event) => {
      if (!panningDisabled || !handler) return;
      const world = screenToWorld(event.clientX, event.clientY);
      if (world) handler(world, event);
    },
    [panningDisabled, screenToWorld]
  );

  // Phase 4 — reports hover position in world coordinates regardless of the
  // active tool (unlike the gated create-tool handlers above), so presence
  // can broadcast this visitor's cursor even while just panning around.
  const handleHover = useCallback(
    (event) => {
      if (!onPointerPositionChange) return;
      const world = screenToWorld(event.clientX, event.clientY);
      if (world) onPointerPositionChange(world);
    },
    [onPointerPositionChange, screenToWorld]
  );

  return (
    <div
      ref={wrapperRef}
      onPointerDown={handlePointerEvent(onCanvasPointerDown)}
      onPointerMove={(event) => {
        handlePointerEvent(onCanvasPointerMove)(event);
        handleHover(event);
      }}
      onPointerUp={handlePointerEvent(onCanvasPointerUp)}
      className={`canvas-dot-grid relative w-full overflow-hidden ${className} ${
        panningDisabled ? 'cursor-crosshair' : ''
      }`}
    >
      <TransformWrapper
        ref={innerRef}
        initialScale={1}
        minScale={0.4}
        maxScale={1.75}
        centerOnInit={false}
        // Keeps user-driven pan (drag/wheel/pinch) within the designed
        // content area instead of letting it wander into empty space
        // forever — our own programmatic panToRegion above uses
        // setTransform directly, which this does NOT constrain, so jumping
        // between regions is unaffected.
        limitToBounds
        onTransformed={(_ref, state) => updateScrollTrack(state)}
        // wheelDisabled + wheelPanning (below) is the Figma convention:
        // a plain scroll/two-finger swipe pans instead of zooming; a real
        // pinch gesture still zooms, since trackpads report that as a
        // ctrl-key-modified wheel event, which wheelDisabled deliberately
        // exempts (see react-zoom-pan-pinch's own isWheelAllowed/
        // onWheelPanning source — this isn't a guess, it's how the library
        // itself tells the two gestures apart).
        wheel={{ step: 0.2, wheelDisabled: true }}
        doubleClick={{ disabled: true }}
        panning={{ disabled: panningDisabled, wheelPanning: true }}
        pinch={{ disabled: panningDisabled }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: 'max-content', height: 'max-content' }}
        >
          {children}
        </TransformComponent>
      </TransformWrapper>

      {/* Custom scroll-position indicator — the native document scrollbar
          can't reflect this, since panning here is a CSS transform, not
          real scrolling. Same accent styling as the real scrollbar so it
          reads as "the same scrollbar," just the one that actually tracks
          where you are. */}
      {worldHeight && scrollTrack.thumbFraction < 1 && (
        <div className="absolute right-1 top-2 bottom-2 w-1.5 pointer-events-none z-30">
          <div
            className="absolute right-0 w-1.5 rounded-full bg-accent"
            style={{
              height: `${scrollTrack.thumbFraction * 100}%`,
              top: `${scrollTrack.progress * (1 - scrollTrack.thumbFraction) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
});

export default CanvasStage;
