export function KeyIcon({
  icon,
  className = "",
}: {
  icon: string;
  className?: string;
}) {
  const paths: Record<string, React.ReactNode> = {
    pass: (
      <>
        <rect x="9" y="12" width="30" height="24" rx="4" />
        <path d="M17 20h8m-8 7h14M32 12v24" />
      </>
    ),
    key: (
      <>
        <circle cx="17" cy="17" r="8" />
        <path d="m23 23 15 15m-5-5 5-5m-10 0 5-5" />
        <circle cx="17" cy="17" r="1" />
      </>
    ),
    chip: (
      <>
        <rect x="13" y="13" width="22" height="22" rx="3" />
        <path d="M19 7v6m10-6v6M19 35v6m10-6v6M7 19h6m-6 10h6m22-10h6m-6 10h6" />
        <path d="m20 20 8 4-8 4" />
      </>
    ),
    compass: (
      <>
        <circle cx="24" cy="24" r="16" />
        <path d="m30 17-4 10-9 4 4-10zM24 4v4m0 32v4M4 24h4m32 0h4" />
      </>
    ),
    beacon: (
      <>
        <path d="M20 20h8v17H20zM15 37h18M24 8v5M11 14l5 5m21-5-5 5M6 25h8m20 0h8" />
        <path d="M24 23v8m-4-4h8" />
      </>
    ),
  };
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[icon] ?? paths.pass}
    </svg>
  );
}
