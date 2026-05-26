import { Github, Twitter, Instagram, Linkedin, Mail, Heart } from "lucide-react";
import { Logo } from "./Logo";

const socials = [
  { Icon: Twitter, href: "#", label: "Twitter" },
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Github, href: "#", label: "GitHub" },
  { Icon: Linkedin, href: "#", label: "LinkedIn" },
  { Icon: Mail, href: "#", label: "Email" },
];

const platformLinks = [
  { href: "#features", label: "Features" },
  { href: "#about", label: "About" },
  { href: "/dashboard", label: "Feed" },
  { href: "/colleges", label: "Colleges" },
];

const legalLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Use" },
  { href: "#", label: "Community Guidelines" },
];

export function Footer() {
  return (
    <footer id="contact" className="mt-24 px-4 pb-10">
      <div className="mx-auto max-w-6xl">
        {/* Main footer card */}
        <div className="glass-card rounded-[28px] p-8 md:p-12 shadow-soft border border-white/70">
          <div className="grid gap-10 md:grid-cols-12">
            {/* Brand column */}
            <div className="md:col-span-5">
              <Logo />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
                The student exchange platform built for Dr. D. Y. Patil Institute of Technology, Pimpri, Pune.
                Trade books, notes & essentials with verified campus peers.
              </p>
              {/* Social links */}
              <div className="mt-6 flex items-center gap-2">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-white/70 hover:gradient-bg hover:text-white transition-all duration-200 shadow-sm hover:shadow-soft border border-white/60"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Platform links */}
            <div className="md:col-span-3 md:col-start-7">
              <h4 className="text-sm font-bold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-2.5">
                {platformLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div className="md:col-span-3">
              <h4 className="text-sm font-bold mb-4 text-foreground">Legal</h4>
              <ul className="space-y-2.5">
                {legalLinks.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              © 2026 Campus Connect · DYP DPU Pimpri, Pune
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              Made with <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> for students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
