import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {/* ===== Left Half — Branding Panel ===== */}
      <div className="auth-left-panel">
        {/* --- Background layers (z-0) --- */}

        {/* Purple glow orb */}
        <div className="auth-glow auth-glow--purple" />

        {/* Blue glow orb */}
        <div className="auth-glow auth-glow--blue" />

        {/* Floating dots */}
        <span className="auth-dot auth-dot--1" />
        <span className="auth-dot auth-dot--2" />
        <span className="auth-dot auth-dot--3" />
        <span className="auth-dot auth-dot--4" />
        <span className="auth-dot auth-dot--5" />
        <span className="auth-dot auth-dot--6" />

        {/* --- Main content (z-1) --- */}
        <div className="auth-left-content">
          {/* A. Official Logo Image */}
          <div className="auth-logo-wrapper">
            <Image
              src="/synqr-logo.png"
              alt="Synqr — Where dev teams stay in flow"
              width={220}
              height={220}
              className="auth-logo-img"
              priority
            />
          </div>

          {/* B. Divider */}
          <div className="auth-divider" />

          {/* C. Feature highlights */}
          <div className="auth-features">
            {/* Feature 1 — Branches & PRs */}
            <div className="auth-feature auth-feature--1">
              <span className="auth-feature-icon">
                {/* Git Branch SVG */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4F6EF7"
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

            {/* Feature 2 — Kanban boards */}
            <div className="auth-feature auth-feature--2">
              <span className="auth-feature-icon">
                {/* Kanban / Layout Grid SVG */}
                <svg
                  width="16"
                  height="16"
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

            {/* Feature 3 — Notifications */}
            <div className="auth-feature auth-feature--3">
              <span className="auth-feature-icon">
                {/* Bell SVG */}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4F6EF7"
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

        {/* Bottom credit */}
        <p className="auth-bottom-credit">
          Built by developers, for developers.
        </p>

        {/* Top-left small branding */}
        <div className="auth-top-brand">
          <Image
            src="/synqr-logo.png"
            alt="Synqr"
            width={28}
            height={28}
            className="auth-top-brand-logo"
          />
          <span className="auth-top-brand-text">Synqr</span>
        </div>
      </div>

      {/* ===== Right Half — Form ===== */}
      <div className="auth-right-panel">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  );
}
