import type { Page } from "@/App";
import { Facebook, Instagram, MessageCircle, Twitter } from "lucide-react";

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const roles = [
  {
    key: "dashboard" as Page,
    label: "ADMIN",
    avatar: "/assets/generated/admin-avatar.dim_300x300.png",
    ocid: "admin",
  },
  {
    key: "doctors" as Page,
    label: "DOCTOR",
    avatar: "/assets/generated/doctor-avatar.dim_300x300.png",
    ocid: "doctor",
  },
  {
    key: "patients" as Page,
    label: "PATIENT",
    avatar: "/assets/generated/patient-avatar.dim_300x300.png",
    ocid: "patient",
  },
];

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav
        className="flex items-center justify-between px-8 py-4"
        style={{ backgroundColor: "#3a6ea5" }}
      >
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-white">
            🏥 Hospital Management
          </span>
          <div className="flex gap-6">
            <button
              type="button"
              data-ocid="nav.admin.button"
              onClick={() => onNavigate("dashboard")}
              className="font-medium text-white transition-colors hover:text-blue-200"
            >
              Admin
            </button>
            <button
              type="button"
              data-ocid="nav.doctor.button"
              onClick={() => onNavigate("doctors")}
              className="font-medium text-white transition-colors hover:text-blue-200"
            >
              Doctor
            </button>
            <button
              type="button"
              data-ocid="nav.patient.button"
              onClick={() => onNavigate("patients")}
              className="font-medium text-white transition-colors hover:text-blue-200"
            >
              Patient
            </button>
          </div>
        </div>
        <div className="flex gap-6">
          <button
            type="button"
            className="font-medium text-white transition-colors hover:text-blue-200"
          >
            About Us
          </button>
          <button
            type="button"
            className="font-medium text-white transition-colors hover:text-blue-200"
          >
            Contact Us
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center bg-gray-100 px-8 py-16">
        <div className="flex flex-wrap justify-center gap-8">
          {roles.map((role) => (
            <div
              key={role.key}
              className="flex flex-col overflow-hidden rounded-xl bg-white shadow-lg"
              style={{ width: "280px" }}
            >
              <div style={{ height: "280px", overflow: "hidden" }}>
                <img
                  src={role.avatar}
                  alt={role.label}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="h-px bg-gray-200" />
              <div className="px-6 py-4 text-center">
                <p className="text-sm font-bold uppercase tracking-widest text-gray-600">
                  {role.label}
                </p>
              </div>
              <button
                type="button"
                data-ocid={`home.${role.ocid}.button`}
                onClick={() => onNavigate(role.key)}
                className="rounded-none bg-black py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-gray-800"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center" style={{ backgroundColor: "#111" }}>
        <div className="mb-4 flex justify-center gap-4">
          <a
            href="https://facebook.com"
            aria-label="Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#1877f2" }}
          >
            <Facebook size={18} />
          </a>
          <a
            href="https://whatsapp.com"
            aria-label="WhatsApp"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#25d366" }}
          >
            <MessageCircle size={18} />
          </a>
          <a
            href="https://instagram.com"
            aria-label="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#0095f6" }}
          >
            <Instagram size={18} />
          </a>
          <a
            href="https://twitter.com"
            aria-label="Twitter"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: "#1da1f2" }}
          >
            <Twitter size={18} />
          </a>
        </div>
        <p className="text-xs text-gray-400">🇮🇳 Made in India</p>
        <p className="mt-1 text-xs text-gray-500">
          © {new Date().getFullYear()} Hospital Intelligence System. All rights
          reserved.
        </p>
      </footer>
    </div>
  );
}
