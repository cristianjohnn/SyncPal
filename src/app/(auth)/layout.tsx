import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {/* ===== Left Half — Aurora Borealis Panel ===== */}
      <div className="auth-left-panel">
        {/* --- Aurora light layers (z-0) --- */}
        <div className="aurora aurora--1" />
        <div className="aurora aurora--2" />
        <div className="aurora aurora--3" />
        <div className="aurora aurora--4" />
        <div className="aurora aurora--5" />
        <div className="aurora aurora--6" />

        {/* --- Floating dot nodes (z-1) --- */}
        <span className="auth-dot auth-dot--1" />
        <span className="auth-dot auth-dot--2" />
        <span className="auth-dot auth-dot--3" />
        <span className="auth-dot auth-dot--4" />
        <span className="auth-dot auth-dot--5" />
        <span className="auth-dot auth-dot--6" />
        <span className="auth-dot auth-dot--7" />
        <span className="auth-dot auth-dot--8" />

        {/* --- Main content (z-2) --- */}
        <div className="auth-left-content">
          {/* A. Full Logo Image — the hero element */}
          <div className="auth-logo-wrapper flex flex-col items-center">
            <h1 className="text-white text-[5.5rem] font-extrabold tracking-tight leading-none mt-2">
              Sync<span className="text-[#7C3AED]">Pal</span>
            </h1>
            <p className="text-white/80 text-xl mt-1 font-medium tracking-wide">
              Where dev teams stay in <span className="text-[#7C3AED]">flow.</span>
            </p>
          </div>

          {/* B. Divider */}
          <div className="auth-divider" />

          {/* C. Feature highlights */}
          <div className="auth-features">
            {/* Feature 1 — Branches & PRs (teal) */}
            <div className="auth-feature auth-feature--1">
              <span className="auth-feature-icon auth-feature-icon--teal">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00FFB2"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="6" y1="3" x2="6" y2="15" />
                  <circle cx="18" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <path d="M18 9a9 9 0 0 1-9 9" />
                </svg>
              </span>
              <span className="auth-feature-text">
                Track branches and PRs in real time
              </span>
            </div>

            {/* Feature 2 — Kanban boards (blue) */}
            <div className="auth-feature auth-feature--2">
              <span className="auth-feature-icon auth-feature-icon--blue">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4F6EF7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="9" rx="1" />
                  <rect x="14" y="3" width="7" height="5" rx="1" />
                  <rect x="14" y="12" width="7" height="9" rx="1" />
                  <rect x="3" y="16" width="7" height="5" rx="1" />
                </svg>
              </span>
              <span className="auth-feature-text">
                Kanban boards built for dev teams
              </span>
            </div>

            {/* Feature 3 — Notifications (violet) */}
            <div className="auth-feature auth-feature--3">
              <span className="auth-feature-icon auth-feature-icon--violet">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7C3AED"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </span>
              <span className="auth-feature-text">
                Real-time notifications and team sync
              </span>
            </div>
          </div>
        </div>

        {/* Top-left branding */}
        <div className="auth-top-brand">
          <Image
            src="/syncpal-logo.png"
            alt="SyncPal"
            width={24}
            height={24}
            className="auth-top-brand-logo"
          />
          <span className="auth-top-brand-text">SyncPal</span>
        </div>

        {/* Bottom credit */}
        <p className="auth-bottom-credit">
          Built by developers, for developers.
        </p>
      </div>

      {/* ===== Right Half — Form ===== */}
      <div className="auth-right-panel">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
