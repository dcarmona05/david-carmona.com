import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#0A0A0A',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <svg width="72" height="72" viewBox="0 0 32 32">
          <circle cx="12" cy="16" r="10" fill="#FF3D81" />
          <circle cx="20" cy="16" r="10" fill="#D9FF3D" />
        </svg>
        <div
          style={{
            marginTop: '48px',
            fontSize: '72px',
            fontWeight: 700,
            color: '#FFFFFF',
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            marginTop: '16px',
            fontSize: '36px',
            color: '#FF3D81',
            fontWeight: 600,
          }}
        >
          {siteConfig.role}
        </div>
        <div
          style={{
            marginTop: '28px',
            fontSize: '28px',
            color: 'rgba(255,255,255,0.6)',
            maxWidth: '900px',
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
