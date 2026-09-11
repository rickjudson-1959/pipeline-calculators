type SiteLogoProps = {
  size?: number;
};

export function SiteLogo({ size = 36 }: SiteLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="29" stroke="currentColor" strokeWidth="4" />
      <circle cx="32" cy="32" r="16" stroke="currentColor" strokeWidth="3.5" />
      <path
        d="M14 32h10M40 32h10"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
