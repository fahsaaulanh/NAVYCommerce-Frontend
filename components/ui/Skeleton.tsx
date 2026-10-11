type SkeletonProps = {
  className?: string;
};

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`rounded-xl bg-border/60 motion-safe:animate-pulse ${className}`}
    />
  );
}