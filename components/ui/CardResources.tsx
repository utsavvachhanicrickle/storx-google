export const CardResources = ({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className="group bg-(--bg-primary) hover:bg-(--bg-secondary) border border-(--border) rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex items-center justify-between gap-6"
    >
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold text-(--text-primary) group-hover:text-(--primary) transition-colors duration-200">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-(--text-secondary)">
          {description}
        </p>
      </div>

      {/* Double-Ring Circular Arrow Button */}
      <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full border-2 border-(--text-primary) p-0.5 transition-all duration-300 group-hover:scale-105 group-hover:border-(--primary)">
        <div className="w-full h-full rounded-full bg-(--text-primary) flex items-center justify-center text-(--bg-primary) transition-all duration-300 group-hover:bg-(--primary) group-hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </div>
  );
};

