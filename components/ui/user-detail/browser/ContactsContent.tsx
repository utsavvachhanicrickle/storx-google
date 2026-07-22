"use client";

import React, { useState, useEffect, useMemo } from "react";
import SidebarNavigation from "../SidebarNavigation";
import type { VaultBrowserObject } from "@/types/vault";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import BusinessIcon from "@mui/icons-material/Business";
import StarIcon from "@mui/icons-material/Star";

interface ContactsContentProps {
  userEmail: string;
  selectedIds: Set<string>;
  onToggleItem: (id: string) => void;
  objects: VaultBrowserObject[];
  loading: boolean;
  prefix: string;
  onNavigatePrefix: (prefix: string) => void;
  onOpenFolder: (prefix: string) => void;
  onRestoreItem?: (key: string) => void;
  onDownloadItem?: (key: string, name: string) => void;
  getDownloadUrl?: (bucket: string, key: string) => Promise<string>;
}

function RestoreActionIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function DownloadActionIcon({ className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export default function ContactsContent({
  userEmail,
  selectedIds,
  onToggleItem,
  objects = [],
  loading = false,
  prefix,
  onNavigatePrefix,
  onOpenFolder,
  onRestoreItem,
  onDownloadItem,
  getDownloadUrl,
}: ContactsContentProps) {
  const [activeSubTab, setActiveSubTab] = useState("Contacts");
  const subTabs = ["Contacts", "Directory", "Starred"];

  const contactsSubTabIcons = {
    Contacts: <PeopleOutlineOutlinedIcon sx={{ fontSize: 16 }} />,
    Directory: <BusinessIcon sx={{ fontSize: 16 }} />,
    Starred: <StarIcon sx={{ fontSize: 16 }} />,
  };

  // Selected contact for detailed viewer (replacing list view)
  const [selectedContact, setSelectedContact] = useState<VaultBrowserObject | null>(null);
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [loadingContact, setLoadingContact] = useState(false);

  // Search and Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeSubTab]);

  // Store parsed contact details retrieved from S3
  const [loadedContactsData, setLoadedContactsData] = useState<Record<string, any>>({});

  const getContactDetailsFromMock = (item: VaultBrowserObject) => {
    const cleanName = item.name.replace(/\.(json|vcf)$/i, "").replace(/[_-]/g, " ");
    const emailName = cleanName.toLowerCase().replace(/\s+/g, ".");
    const email = `${emailName}@gmail.com`;
    
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
      hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const phoneNum = Math.abs(hash).toString().substring(0, 10).padEnd(10, "5");
    const formattedPhone = `+1 (${phoneNum.substring(0, 3)}) ${phoneNum.substring(3, 6)}-${phoneNum.substring(6)}`;

    return {
      name: cleanName,
      email,
      phone: formattedPhone,
      company: "Acme Corp",
      title: "Google Workspace Associate",
      address: "1600 Amphitheatre Pkwy, Mountain View, CA",
      note: "Backup sync imported from Google Account address book.",
    };
  };

  const parseContactContent = (contentStr: string, item: VaultBrowserObject) => {
    try {
      const data = JSON.parse(contentStr);
      const name = data.name || item.name.replace(/\.(json|vcf)$/i, "").replace(/[_-]/g, " ");
      
      let emails = "—";
      if (Array.isArray(data.emails) && data.emails.length > 0) {
        emails = data.emails.filter(Boolean).join(", ");
      } else if (data.email) {
        emails = data.email;
      }
      
      let phones = "—";
      if (Array.isArray(data.phones) && data.phones.length > 0) {
        phones = data.phones.filter(Boolean).join(", ");
      } else if (data.phone) {
        phones = data.phone;
      }
      
      return {
        name,
        email: emails || "—",
        phone: phones || "—",
        company: data.company || "Acme Corp",
        title: data.title || "Google Workspace Associate",
        address: data.address || "1600 Amphitheatre Pkwy, Mountain View, CA",
        note: data.note || `Backup sync imported from Google Account address book. Last updated: ${data.updated_at ? new Date(data.updated_at).toLocaleString() : "N/A"}`
      };
    } catch (e) {
      return parseVcf(contentStr, item);
    }
  };

  const parseVcf = (vcfText: string, item: VaultBrowserObject) => {
    const lines = vcfText.split(/\r?\n/);
    let fn = "";
    let email = "";
    let phone = "";
    let company = "";
    let title = "";
    let address = "";
    let note = "";

    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith("FN:")) {
        fn = cleanLine.substring(3);
      } else if (cleanLine.startsWith("FN;")) {
        const parts = cleanLine.split(":");
        fn = parts.slice(1).join(":");
      } else if (cleanLine.startsWith("EMAIL:") || cleanLine.startsWith("EMAIL;")) {
        const parts = cleanLine.split(":");
        email = parts.slice(1).join(":");
      } else if (cleanLine.startsWith("TEL:") || cleanLine.startsWith("TEL;")) {
        const parts = cleanLine.split(":");
        phone = parts.slice(1).join(":");
      } else if (cleanLine.startsWith("ORG:") || cleanLine.startsWith("ORG;")) {
        const parts = cleanLine.split(":");
        company = parts.slice(1).join(":");
      } else if (cleanLine.startsWith("TITLE:") || cleanLine.startsWith("TITLE;")) {
        const parts = cleanLine.split(":");
        title = parts.slice(1).join(":");
      } else if (cleanLine.startsWith("ADR:") || cleanLine.startsWith("ADR;")) {
        const parts = cleanLine.split(":");
        const adrParts = parts.slice(1).join(":").split(";");
        address = adrParts.filter(Boolean).join(", ");
      } else if (cleanLine.startsWith("NOTE:") || cleanLine.startsWith("NOTE;")) {
        const parts = cleanLine.split(":");
        note = parts.slice(1).join(":");
      }
    });

    const fallback = getContactDetailsFromMock(item);
    return {
      name: fn || fallback.name,
      email: email || fallback.email,
      phone: phone || fallback.phone,
      company: company || fallback.company,
      title: title || fallback.title,
      address: address || fallback.address,
      note: note || fallback.note,
    };
  };

  // Fetch full details of the single selected contact
  useEffect(() => {
    if (!selectedContact) {
      setContactDetails(null);
      return;
    }

    let active = true;
    const fetchContact = async () => {
      setLoadingContact(true);
      try {
        if (getDownloadUrl) {
          const url = await getDownloadUrl("google-contacts", selectedContact.key);
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            if (active) {
              const parsed = parseContactContent(text, selectedContact);
              setContactDetails(parsed);
              setLoadingContact(false);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Failed to load contact:", err);
      }

      if (active) {
        setContactDetails(getContactDetailsFromMock(selectedContact));
        setLoadingContact(false);
      }
    };

    fetchContact();
    return () => {
      active = false;
    };
  }, [selectedContact, getDownloadUrl]);

  // Filter contacts by search query (match name, email, or filename)
  const filteredObjects = useMemo(() => {
    return objects.filter((item) => {
      if (item.type === "folder") return true;
      if (!searchQuery) return true;
      const mockDetails = getContactDetailsFromMock(item);
      const realDetails = loadedContactsData[item.key];
      const nameToSearch = (realDetails?.name || mockDetails.name).toLowerCase();
      const emailToSearch = (realDetails?.email || mockDetails.email).toLowerCase();
      return (
        nameToSearch.includes(searchQuery.toLowerCase()) ||
        emailToSearch.includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [objects, searchQuery, loadedContactsData]);

  // Pagination indexing
  const totalItems = filteredObjects.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const pagedObjects = useMemo(() => {
    return filteredObjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredObjects, startIndex]);

  const getDownloadUrlRef = React.useRef(getDownloadUrl);
  useEffect(() => {
    getDownloadUrlRef.current = getDownloadUrl;
  }, [getDownloadUrl]);

  // Lightweight pre-fetching: Only fetch data for contacts displayed on the current page
  useEffect(() => {
    if (!pagedObjects || pagedObjects.length === 0 || !getDownloadUrlRef.current) return;

    let active = true;
    const fetchPageContacts = async () => {
      const fileObjects = pagedObjects.filter(item => item.type === "file" && !loadedContactsData[item.key]);
      if (fileObjects.length === 0) return;

      const dataMap: Record<string, any> = {};

      await Promise.all(
        fileObjects.map(async (item) => {
          try {
            const getUrl = getDownloadUrlRef.current;
            if (!getUrl) return;
            const url = await getUrl("google-contacts", item.key);
            const res = await fetch(url);
            if (res.ok) {
              const text = await res.text();
              const parsed = parseContactContent(text, item);
              dataMap[item.key] = parsed;
            }
          } catch (e) {
            console.error("Failed to load paged contact data:", e);
          }
        })
      );

      if (active && Object.keys(dataMap).length > 0) {
        setLoadedContactsData(prev => ({ ...prev, ...dataMap }));
      }
    };

    fetchPageContacts();
    return () => {
      active = false;
    };
  }, [objects, currentPage, itemsPerPage, searchQuery]);

  return (
    <div className="flex flex-col md:flex-row h-full min-h-0 bg-(--bg-primary)">
      {/* Reusable Sidebar Navigation */}
      {/* <SidebarNavigation
        title="ADDRESS BOOK"
        subtitle={userEmail}
        tabs={subTabs}
        activeTab={activeSubTab}
        onChangeTab={setActiveSubTab}
        fontMonoSubtitle={true}
        icons={contactsSubTabIcons}
      /> */}

      {/* Main Contacts Area */}
      <div className="flex-1 p-4 flex flex-col gap-3 min-h-0 overflow-hidden h-full">
        {!selectedContact ? (
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            {/* Search Box */}
            <div className="flex items-center gap-2 w-full bg-(--bg-primary) border border-(--border) rounded-sm px-3 py-2 shadow-xs shrink-0">
              <SearchIcon sx={{ color: "var(--text-muted)", fontSize: 20 }} />
              <input
                type="text"
                placeholder="Search contacts by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to page 1 on new search
                }}
                className="flex-1 text-sm text-(--text-primary) placeholder:(--text-muted) focus:outline-none bg-transparent"
              />
            </div>

            {/* Contacts Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 py-1">
              {loading ? (
                <div className="flex flex-col h-48 items-center justify-center text-xs font-bold text-(--text-muted) gap-3">
                  <div className="w-8 h-8 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
                  <span>Loading contacts from vault...</span>
                </div>
              ) : activeSubTab === "Contacts" ? (
                totalItems === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-[12px] font-black text-(--text-muted) gap-1 bg-(--bg-primary) border border-(--border) rounded-sm">
                    <span>No contacts found</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pagedObjects.map((item) => {
                      const isChecked = selectedIds.has(item.key);
                      const details = loadedContactsData[item.key] || getContactDetailsFromMock(item);
                      const initial = (details.name || "?").charAt(0);

                      return (
                        <div
                          key={item.key}
                          onClick={() => {
                            if (item.type === "folder") {
                              onOpenFolder(item.key);
                            } else {
                              setSelectedContact(item);
                            }
                          }}
                          className={`flex items-center gap-4 p-4 border rounded-md transition-all duration-200 cursor-pointer select-none bg-(--bg-primary) group shadow-xs hover:shadow-md relative ${
                            isChecked
                              ? "border-(--primary) bg-(--primary)/5"
                              : "border-(--border) hover:border-(--border)"
                          }`}
                        >
                          {item.type !== "folder" && (
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleItem(item.key)}
                              onClick={(e) => e.stopPropagation()}
                              className="accent-(--primary) w-4 h-4 border-(--border) rounded cursor-pointer shrink-0"
                            />
                          )}

                          {/* Circular Avatar */}
                          <div className="w-10 h-10 rounded-full bg-(--bg-secondary) border border-(--border) text-(--text-secondary) flex items-center justify-center font-black text-base uppercase shadow-2xs shrink-0">
                            {item.type === "folder" ? "📁" : initial}
                          </div>

                          {/* Text columns - reserved space (pr-16) for absolute hover elements */}
                          <div className="flex-1 min-w-0 pr-16 text-left space-y-0.5">
                            <p className="text-sm font-black text-(--text-primary) truncate">
                              {details.name}
                            </p>
                            {item.type !== "folder" && (
                              <>
                                {details.phone && details.phone !== "—" && (
                                  <p className="text-[11px] font-mono text-(--text-muted) font-bold truncate">
                                    📞 {details.phone}
                                  </p>
                                )}
                                {details.email && details.email !== "—" && (
                                  <p className="text-[11px] text-(--text-muted) font-semibold truncate">
                                    ✉️ {details.email}
                                  </p>
                                )}
                              </>
                            )}
                          </div>

                          {/* Hover Action controls: Placed absolute (floating) on the right edge */}
                          {item.type !== "folder" && (
                            <div
                              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity bg-(--bg-primary)/90 backdrop-blur-xs pl-2 py-1 rounded-sm z-20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => onRestoreItem?.(item.key)}
                                title="Restore"
                                className="p-2 text-(--primary) bg-(--primary)/10 hover:bg-(--primary)/20 transition rounded-sm cursor-pointer flex items-center justify-center shadow-xs border border-(--primary)/20"
                              >
                                <RestoreActionIcon className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDownloadItem?.(item.key, item.name)}
                                title="Download"
                                className="p-2 text-(--text-secondary) bg-(--bg-secondary) hover:bg-(--bg-active) transition rounded-sm cursor-pointer flex items-center justify-center shadow-xs border border-(--border)"
                              >
                                <DownloadActionIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-[12px] font-black text-(--text-muted) gap-1 bg-(--bg-primary) border border-(--border) rounded-sm">
                  <span>No contacts in {activeSubTab}</span>
                  <span className="font-normal text-[11px] text-(--text-muted)">
                    Everything is up-to-date!
                  </span>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalItems > 0 && activeSubTab === "Contacts" && (
              <div className="flex items-center justify-between border-t border-(--border) pt-4 mt-2 shrink-0 select-none">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-(--text-muted) font-bold">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} contacts
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-(--text-muted) font-bold ml-4">
                    <span>Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 text-xs border border-(--border) rounded-sm bg-(--bg-primary) text-(--text-primary) cursor-pointer focus:outline-none"
                    >
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={40}>40</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-1.5 text-xs font-black border border-(--border) rounded-sm hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition bg-(--bg-primary) cursor-pointer shadow-2xs text-(--text-secondary)"
                    >
                      &lt;
                    </button>
                    {getPageNumbers().map((p) => {
                      const isActive = p === currentPage;
                      return (
                        <button
                          key={p}
                          onClick={() => setCurrentPage(p)}
                          className={`px-3 py-1.5 text-xs font-black border rounded-sm transition cursor-pointer select-none ${
                            isActive
                              ? "bg-(--primary)/10 text-(--primary) border-(--primary)/30 font-black"
                              : "bg-(--bg-primary) text-(--text-secondary) border-(--border) hover:bg-(--bg-secondary)"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="px-3 py-1.5 text-xs font-black border border-(--border) rounded-sm hover:bg-(--bg-secondary) disabled:opacity-50 disabled:cursor-not-allowed transition bg-(--bg-primary) cursor-pointer shadow-2xs text-(--text-secondary)"
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-3 min-h-0 animate-in fade-in duration-200">
            {/* Header controls (Outside the card) */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => setSelectedContact(null)}
                className="flex items-center gap-1.5 text-xs font-black text-(--text-secondary) hover:text-(--text-primary) transition bg-(--bg-primary) hover:bg-(--bg-secondary) border border-(--border) rounded-sm px-3.5 py-2 cursor-pointer shadow-2xs"
              >
                <ArrowBackIcon sx={{ fontSize: 14 }} /> Back to Contacts
              </button>
            </div>

            {/* Profile Detail Card */}
            <div className="flex-1 bg-(--bg-primary) border border-(--border) rounded-md overflow-y-auto p-6 space-y-6 shadow-sm flex flex-col">
              {loadingContact ? (
                <div className="flex h-48 items-center justify-center text-xs font-bold text-(--text-muted) animate-pulse uppercase tracking-wider">
                  Retrieving contact info from secure storage...
                </div>
              ) : contactDetails ? (
                <div className="space-y-6 flex-1 flex flex-col">
                  {/* Identity Header */}
                  <div className="flex items-center gap-4 border-b border-(--border) pb-5 shrink-0">
                    <div className="w-16 h-16 rounded-full bg-(--primary) text-white flex items-center justify-center font-black text-2xl border border-(--primary-hover) uppercase shadow-sm shrink-0">
                      {(contactDetails.name || "?").charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-(--text-primary) leading-tight tracking-tight">
                        {contactDetails.name}
                      </h3>
                      <p className="text-xs text-(--text-muted) font-bold mt-1">
                        {contactDetails.title} at {contactDetails.company}
                      </p>
                    </div>
                  </div>

                  {/* Profile Details List */}
                  <div className="space-y-5 text-xs font-medium text-(--text-secondary) flex-1">
                    <div className="flex flex-col gap-1.5">
                      <span className="font-black text-(--text-muted) uppercase tracking-wider text-[10px]">
                        Email Address
                      </span>
                      <span className="text-sm font-bold text-(--text-primary)">
                        {contactDetails.email}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="font-black text-(--text-muted) uppercase tracking-wider text-[10px]">
                        Phone Number
                      </span>
                      <span className="text-sm font-bold font-mono text-(--text-primary)">
                        {contactDetails.phone}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="font-black text-(--text-muted) uppercase tracking-wider text-[10px]">
                        Postal Address
                      </span>
                      <span className="text-sm font-bold text-(--text-primary)">
                        {contactDetails.address}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="font-black text-(--text-muted) uppercase tracking-wider text-[10px]">
                        Notes
                      </span>
                      <span className="text-sm text-(--text-secondary) leading-relaxed italic bg-(--bg-secondary) p-4 rounded-md border border-(--border)">
                        {contactDetails.note}
                      </span>
                    </div>
                  </div>

                  {/* Restore box at bottom of contact details view */}
                  <div className="pt-6 border-t border-(--border) bg-(--primary)/5 p-4 rounded-md border flex items-center justify-start shrink-0">
                    <button
                      onClick={() => onRestoreItem?.(selectedContact.key)}
                      className="px-4 py-2.5 text-xs font-black text-(--primary) bg-(--bg-primary) hover:bg-(--primary)/10 border border-(--primary)/30 rounded-sm shadow-2xs transition flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3.5 h-3.5"
                      >
                        <polyline points="11 17 6 12 11 7" />
                        <polyline points="18 17 13 12 18 7" />
                      </svg>
                      Restore this Contact
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
