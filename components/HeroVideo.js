export default function HeroVideo({ src, poster }) {
  return (
    <video
      className="absolute inset-0 w-full h-full object-cover object-top"
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      controls
    />
  );
}
