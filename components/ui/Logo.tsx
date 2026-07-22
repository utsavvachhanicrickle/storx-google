export default function Logo({ className, onlyIcon = false }: { className?: string; onlyIcon?: boolean }) {
  return (
    <img
      src={onlyIcon ? "/cyberls-pulse-favicon-site.svg" : "/assets/images/logo-dark.svg"}
      alt="CyberLS"
      className={className}
      height={onlyIcon ? 22 : 32}
    />
  );
}
