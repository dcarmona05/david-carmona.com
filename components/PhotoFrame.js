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
            <path d="M90.00,0.00C89.53,18.86,70.15,39.82,55.15,55.15C40.15,70.48,18.62,91.76,0.00,92.00C-18.62,92.24,-41.90,71.90,-56.57,56.57C-71.24,41.24,-88.47,18.39,-88.00,0.00C-87.53,-18.39,-68.41,-38.07,-53.74,-53.74C-39.07,-69.41,-18.62,-93.29,0.00,-94.00C18.62,-94.71,42.98,-73.65,57.98,-57.98C72.98,-42.31,90.47,-18.86,90.00,0.00Z" transform="translate(100 100)" />
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
