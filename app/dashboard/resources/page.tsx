"use client";

import { useEffect, useState } from "react";
import { CardResources } from "@/components/ui/CardResources";
import { resourcesConstatnt } from "@/utils/constants";
import { API } from "@/services/apiClient";
import UnderConstruction from "@/components/ui/UnderConstruction";

export default function ResourcesPage() {
  const [view, setView] = useState<"list" | "guide" | "blogs">("list");
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Guide detailed state
  const [guideHtml, setGuideHtml] = useState("");
  const [guideTitle, setGuideTitle] = useState("");
  const [guideLoading, setGuideLoading] = useState(false);

  // Memoized client-side caches to avoid repeated API hits on navigation
  const [guidesCache, setGuidesCache] = useState<Record<string, string>>({});
  const [blogs, setBlogs] = useState<any[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);

  // Scroll to top states and handlers
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const mainContainer = document.querySelector("main");

    const handleScroll = () => {
      const scrollTop = mainContainer
        ? mainContainer.scrollTop
        : window.scrollY;
      if (scrollTop > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    if (mainContainer) {
      mainContainer.addEventListener("scroll", handleScroll);
    }
    window.addEventListener("scroll", handleScroll);

    return () => {
      if (mainContainer) {
        mainContainer.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const mainContainer = document.querySelector("main");
    if (mainContainer) {
      mainContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Fetch resource cards on mount
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const response = await API.get("/resources-list");

        // Extract array from potential response envelopes (resources/data/list/etc)
        let dataList = response.data;
        if (dataList && !Array.isArray(dataList)) {
          dataList = dataList.resources || dataList.data || dataList.list || [];
        }

        if (Array.isArray(dataList)) {
          setResources(dataList);
        }
      } catch (err) {
        console.error("Failed to fetch resources list from API", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  // Handle Resource Click Actions
  const handleResourceClick = async (item: any) => {
    const title = item.name || item.title || "";
    const link = item.link || "";

    if (item.type === "contact" || link === "contact") {
      // Trigger user default mail handler
      window.location.href =
        "mailto:support@cyberls.io?subject=CyberLs Workspace Backup Assistance";
      return;
    }

    if (item.type === "url" || item.type === "static") {
      // Check if this is an internal HTML guide
      if (link.startsWith("/guides")) {
        const urlParams = new URLSearchParams(link.split("?")[1] || "");
        const guideType = urlParams.get("type") || "";

        setGuideTitle(title);
        setView("guide");

        // Use cached HTML guide if already loaded
        if (guidesCache[guideType]) {
          setGuideHtml(guidesCache[guideType]);
          return;
        }

        setGuideLoading(true);
        setGuideHtml("");

        try {
          const response = await API.get("/guides", {
            params: { type: guideType },
          });
          const htmlContent =
            response.data ||
            "<p className='text-sm text-slate-500'>This guide is currently empty.</p>";

          setGuideHtml(htmlContent);
          setGuidesCache((prev) => ({ ...prev, [guideType]: htmlContent }));
        } catch (err) {
          console.error("Failed to load guide html content", err);
          setGuideHtml(
            "<p className='text-sm text-red-500 font-bold'>⚠️ Failed to load guide content. Please check your network connection or try again later.</p>",
          );
        } finally {
          setGuideLoading(false);
        }
      }
      // Check if it's the Blogs section
      else if (
        title.toLowerCase().includes("blog") ||
        link.includes("blog-list")
      ) {
        // setView("blogs");

        // Re-use cached blogs if already loaded
        if (blogs.length > 0) {
          return;
        }

        setBlogsLoading(true);
        setBlogs([]);

        try {
          const response = await API.get("/blog-list");
          let blogsList = response.data;
          if (blogsList && !Array.isArray(blogsList)) {
            blogsList =
              blogsList.blogs || blogsList.data || blogsList.list || [];
          }
          setBlogs(Array.isArray(blogsList) ? blogsList : []);
        } catch (err) {
          console.error("Failed to load blog listing from server", err);
        } finally {
          setBlogsLoading(false);
        }
      }
      // External links
      else if (link) {
        window.open(link, "_blank", "noopener,noreferrer");
      }
    }
  };

  // Fallback to static constant resource configs if backend endpoint is unavailable/empty
  const rawItems =
    resources.length > 0
      ? resources
      : resourcesConstatnt.map((c) => ({
          name: c.title,
          desc: c.description,
          type: "static",
          link: c.action === "Open a Ticket →" ? "contact" : "",
        }));

  const itemsToRender = rawItems.filter((item) => {
    const name = item.name || item.title || "";
    return name.toLowerCase() !== "blogs";
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 text-(--text-primary)">
      <div className="max-w-6xl mx-auto">
        {/* VIEW 1: RESOURCES LIST */}
        {view === "list" && (
          <>
            {/* Header */}
            <div className="mb-8 select-none">
              <h1 className="text-3xl font-bold tracking-tight text-(--text-primary)">
                Resources
              </h1>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-(--text-secondary)">
                  Loading resources dashboard...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
                {itemsToRender.map((item, idx) => {
                  const title = item.name || item.title || "";
                  const description = item.desc || item.description || "";

                  return (
                    <CardResources
                      key={idx}
                      title={title}
                      description={description}
                      onClick={() => handleResourceClick(item)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* VIEW 2: GUIDE DETAILS VIEW */}
        {view === "guide" && (
          <div className="animate-in fade-in duration-200">
            {/* Navigation Header */}
            <div className="flex items-center justify-between pb-5 border-b border-(--border-light) mb-6 select-none">
              <button
                onClick={() => setView("list")}
                className="inline-flex items-center gap-2 px-4 py-2 border border-(--border) bg-(--bg-primary) text-(--text-primary) hover:bg-(--bg-secondary) text-xs font-bold rounded-sm transition cursor-pointer"
              >
                ← Back to Resources
              </button>
              <h2 className="text-sm hidden md:block font-bold text-(--text-secondary) uppercase tracking-wider">
                Support Guide
              </h2>
            </div>

            {guideLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-(--text-secondary)">
                  Fetching guide content...
                </p>
              </div>
            ) : (
              <div className="bg-(--bg-primary) border border-(--border) rounded-md p-6 sm:p-8 max-w-4xl mx-auto shadow-sm">
                <h1 className="text-2xl font-bold text-(--text-primary) mb-6 pb-4 border-b border-(--border-light)">
                  {guideTitle}
                </h1>

                {/* Embedded HTML Body */}
                <div
                  className="prose dark:prose-invert max-w-none text-sm text-(--text-primary) leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: guideHtml }}
                />
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: BLOGS LIST VIEW - Renders Under Construction */}
        {view === "blogs" && (
          <UnderConstruction />
          // <div className="animate-in fade-in duration-200">
          //   {/* Navigation Header */}
          //   <div className="flex items-center justify-between pb-5 border-b border-(--border-light) mb-6 select-none">
          //     <button
          //       onClick={() => setView("list")}
          //       className="inline-flex items-center gap-2 px-4 py-2 border border-(--border) bg-(--bg-primary) text-(--text-primary) hover:bg-(--bg-secondary) text-xs font-bold rounded-sm transition cursor-pointer"
          //     >
          //       ← Back to Resources
          //     </button>
          //     <h2 className="text-sm hidden md:block font-bold text-(--text-secondary) uppercase tracking-wider">
          //       CyberLs Insights
          //     </h2>
          //   </div>

          //   {blogsLoading ? (
          //     <div className="py-24 flex flex-col items-center justify-center gap-3">
          //       <div className="w-10 h-10 border-4 border-(--primary) border-t-transparent rounded-full animate-spin"></div>
          //       <p className="text-sm font-bold text-(--text-secondary)">
          //         Loading publications...
          //       </p>
          //     </div>
          //   ) : blogs.length === 0 ? (
          //     <div className="py-16 text-center border border-dashed border-(--border) rounded-md">
          //       <span className="text-3xl">📰</span>
          //       <p className="mt-2 text-sm font-bold text-(--text-secondary)">
          //         No articles or blogs published yet. Check back soon!
          //       </p>
          //     </div>
          //   ) : (
          //     <div>
          //       <div className="mb-6 select-none">
          //         <h1 className="text-2xl font-bold text-(--text-primary)">
          //           Network Blogs & Articles
          //         </h1>
          //         <p className="text-xs text-(--text-secondary) mt-1">
          //           Explore publications, backup tips, and news updates directly
          //           from our engineering team.
          //         </p>
          //       </div>

          //       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          //         {blogs.map((blog, idx) => {
          //           const title = blog.title || blog.name || "";
          //           const desc =
          //             blog.description ||
          //             blog.desc ||
          //             blog.summary ||
          //             "Read this article to learn more about cloud data protections.";
          //           const image =
          //             blog.image ||
          //             blog.thumbnail ||
          //             blog.imageUrl ||
          //             "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60";
          //           const date =
          //             blog.publishedAt ||
          //             blog.date ||
          //             blog.created_at ||
          //             "June 2026";
          //           const link = blog.link || blog.url || "#";

          //           return (
          //             <div
          //               key={idx}
          //               onClick={() =>
          //                 window.open(link, "_blank", "noopener,noreferrer")
          //               }
          //               className="group bg-(--bg-primary) border border-(--border) rounded-md overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
          //             >
          //               <div>
          //                 {/* Card Thumbnail */}
          //                 <div className="h-44 w-full bg-(--bg-secondary) overflow-hidden relative">
          //                   <img
          //                     src={image}
          //                     alt={title}
          //                     className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          //                   />
          //                   <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-sm bg-black/60 text-white text-[9px] font-bold uppercase tracking-wider">
          //                     CyberLs Blog
          //                   </span>
          //                 </div>

          //                 {/* Card Content */}
          //                 <div className="p-5">
          //                   <p className="text-[10px] text-(--text-muted) font-bold uppercase tracking-wider">
          //                     {date}
          //                   </p>
          //                   <h3 className="text-sm font-bold text-(--text-primary) mt-2 group-hover:text-(--primary) transition-colors leading-snug line-clamp-2">
          //                     {title}
          //                   </h3>
          //                   <p className="text-xs text-(--text-secondary) mt-2 line-clamp-3 leading-snug">
          //                     {desc}
          //                   </p>
          //                 </div>
          //               </div>

          //               {/* Read CTA */}
          //               <div className="px-5 pb-5 pt-0">
          //                 <span className="text-xs font-bold text-indigo-500 group-hover:text-indigo-600 group-hover:underline inline-flex items-center gap-1">
          //                   Read Article &rarr;
          //                 </span>
          //               </div>
          //             </div>
          //           );
          //         })}
          //       </div>
          //     </div>
          //   )}
          // </div>
        )}
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 p-3 rounded-full bg-(--primary) hover:bg-opacity-90 text-white shadow-xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-bottom-4"
          aria-label="Scroll to top"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
