'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useReducedMotion } from 'framer-motion';

const PAN_STEP = 140;
const FOCUSABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

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
  { children, initialRegionId, onActiveRegionChange, className = '' },
  ref
) {
  const innerRef = useRef(null);
  const wrapperRef = useRef(null);
  const lastFocusedRegionRef = useRef(initialRegionId ?? null);
  const reducedMotion = useReducedMotion();

  const panToRegion = useCallback(
    (regionId, { instant = false } = {}) => {
      const content = innerRef.current;
      if (!content || !regionId) return;
      const duration = instant || reducedMotion ? 0 : 450;
      content.zoomToElement(`canvas-frame-${regionId}`, undefined, duration, 'easeOut');
    },
    [reducedMotion]
  );

  useImperativeHandle(ref, () => ({ panToRegion }), [panToRegion]);

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

  return (
    <div
      ref={wrapperRef}
      className={`canvas-dot-grid relative w-full overflow-hidden ${className}`}
    >
      <TransformWrapper
        ref={innerRef}
        initialScale={1}
        minScale={0.4}
        maxScale={1.75}
        centerOnInit={false}
        limitToBounds={false}
        wheel={{ step: 0.2 }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: 'max-content', height: 'max-content' }}
        >
          {children}
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
});

export default CanvasStage;
