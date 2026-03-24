import { ExternalLink, FileText, Presentation, X } from "lucide-react";
import { cn } from "../lib/utils";

const ABSTRACT_URL = "/pdf/abstract/2026-sccm--abstract.pdf";
const PRESENTATION_URL = "/pdf/abstract/2026-sccm--research-snapshot-presentation.pdf";
const GITHUB_URL =
  "https://github.com/moberg-analytics/oss-models/tree/main/packages/okekeclean";

interface SccmModalProps {
  open: boolean;
  onClose: () => void;
}

const SccmModal: React.FC<SccmModalProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden overscroll-none touch-none"
      onWheel={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
    >
      <div
        className="absolute inset-0 bg-ctp-mantle/95 md:bg-ctp-crust/90 md:backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      />

      <div
        className={cn(
          "relative z-10 w-full h-full flex flex-col items-center justify-center px-6",
          "md:h-auto md:max-w-lg md:rounded-lg md:border md:border-ctp-surface0 md:bg-ctp-mantle md:px-8 md:py-8",
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-ctp-overlay0 hover:text-ctp-text transition-colors p-2"
        >
          <X size={20} />
        </button>

        <div className="w-full max-w-sm space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-ctp-subtext0">
              sccm 2026 research snapshot
            </p>
            <h2 className="text-2xl font-bold text-ctp-mauve">okekeclean</h2>
            <p className="text-sm text-ctp-subtext0 leading-relaxed">
              open-source artifact detection for ICU waveforms. our
              spectrogram-based deep learning models detect artifacts in
              arterial blood pressure and ECG signals with AU-ROC above 0.95.
            </p>
          </div>

          <div className="space-y-3">
            <ActionLink
              href={ABSTRACT_URL}
              icon={<FileText size={18} />}
              label="read the abstract"
            />
            <ActionLink
              href={PRESENTATION_URL}
              icon={<Presentation size={18} />}
              label="view the presentation"
            />
            <ActionLink
              href={GITHUB_URL}
              icon={<ExternalLink size={18} />}
              label="explore the code"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-sm text-ctp-overlay0 hover:text-ctp-subtext0 transition-colors"
          >
            or explore the site
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionLink: React.FC<{
  href: string;
  icon: React.ReactNode;
  label: string;
}> = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "grid grid-cols-[1.25rem_1fr] items-center gap-6 w-full px-4 py-3 rounded-md",
      "border border-ctp-surface0 bg-ctp-surface0/30",
      "text-ctp-text hover:border-ctp-teal hover:text-ctp-teal transition-colors",
      "text-sm font-medium",
    )}
  >
    <span className="flex justify-center">{icon}</span>
    <span className="text-left">{label}</span>
  </a>
);

export default SccmModal;
