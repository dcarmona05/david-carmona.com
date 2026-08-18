import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#0A0A0A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="140" height="140" viewBox="0 0 32 32">
          <circle cx="12" cy="16" r="10" fill="#FF3D81" />
          <circle cx="20" cy="16" r="10" fill="#D9FF3D" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
