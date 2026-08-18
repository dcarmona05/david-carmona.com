'use client';

import { useEffect, useRef } from 'react';

const CAL_LINK = 'david-carmona-zlqdrt/30min';
const CAL_NAMESPACE = '30min';

export default function CalEmbed() {
  const containerRef = useRef(null);

  useEffect(() => {
    (function (C, A, L) {
      let p = function (a, ar) {
        a.q.push(ar);
      };
      let d = C.document;
      C.Cal =
        C.Cal ||
        function () {
          let cal = C.Cal;
          let ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement('script')).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function () {
              p(api, arguments);
            };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === 'string') {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ['initNamespace', namespace]);
            } else {
              p(cal, ar);
            }
            return;
          }
          p(cal, ar);
        };
    })(window, 'https://app.cal.com/embed/embed.js', 'init');

    window.Cal('init', CAL_NAMESPACE, { origin: 'https://cal.com' });

    window.Cal.ns[CAL_NAMESPACE]('inline', {
      elementOrSelector: containerRef.current,
      calLink: CAL_LINK,
      config: {
        layout: 'month_view',
        theme: 'dark',
      },
    });

    window.Cal.ns[CAL_NAMESPACE]('ui', {
      hideEventTypeDetails: false,
      layout: 'month_view',
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[600px] rounded-lg border border-white/10 overflow-hidden"
    />
  );
}
