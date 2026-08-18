export default function PhotoFrame({ src, alt }) {
  return (
    <div className="relative w-56 h-56 sm:w-64 sm:h-64 shrink-0">
      <svg
        viewBox="0 0 200 200"
        aria-hidden="true"
        className="absolute -bottom-4 -right-4 w-full h-full text-accent2/70"
      >
        <path
          fill="currentColor"
          d="M45.4,-58.4C58.5,-49.6,68.4,-34.3,71.9,-17.7C75.4,-1.1,72.5,16.8,63.8,31.2C55.1,45.6,40.6,56.5,24.2,63.1C7.8,69.7,-10.5,72,-27.4,67.1C-44.3,62.2,-59.8,50.1,-67.8,34.2C-75.8,18.3,-76.3,-1.4,-70.5,-18.5C-64.7,-35.6,-52.6,-50.1,-38,-58.6C-23.4,-67.1,-6.3,-69.6,9.6,-67.8C25.5,-66,32.3,-67.2,45.4,-58.4Z"
          transform="translate(100 100)"
        />
      </svg>

      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 w-full h-full"
      >
        <defs>
          <clipPath id="photo-blob" clipPathUnits="userSpaceOnUse">
            <path d="M52.8,-62.5C67.9,-51.6,78.4,-32.6,80.2,-13.1C82,6.4,75.1,26.4,62.1,41.6C49.1,56.8,30,67.2,9.5,71.4C-11,75.6,-33,73.6,-49.8,62.4C-66.6,51.2,-78.2,30.8,-79.6,9.9C-81,-11,-72.2,-32.4,-57.5,-44.6C-42.8,-56.8,-22.2,-59.8,-1.4,-58.7C19.4,-57.6,37.7,-73.4,52.8,-62.5Z" transform="translate(100 100)" />
          </clipPath>
        </defs>
        <image
          href={src}
          x="0"
          y="0"
          width="200"
          height="200"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#photo-blob)"
        />
      </svg>
      <span className="sr-only">{alt}</span>
    </div>
  );
}
