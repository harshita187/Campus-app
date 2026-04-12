import React from "react";

const base = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": true,
};

/**
 * Minimal flat stroke icons per category (no emoji).
 */
export function CategoryFlatIcon({ name, className = "", size = 28 }) {
  const stroke = "currentColor";
  const sw = 1.65;
  const common = {
    ...base,
    width: size,
    height: size,
    className: `category-flat-icon ${className}`.trim(),
  };

  switch (name) {
    case "Notes":
      return (
        <svg {...common}>
          <path
            d="M7 3h8l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path d="M14 3v4h4M8 12h8M8 16h6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "Electronics":
      return (
        <svg {...common}>
          <rect
            x="5"
            y="6"
            width="14"
            height="10"
            rx="2"
            stroke={stroke}
            strokeWidth={sw}
          />
          <path d="M9 19h6M12 16v3" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path d="M8 9h2M14 9h2" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "Furniture":
      return (
        <svg {...common}>
          <path
            d="M4 10h16v3H4v-3ZM6 13v5M18 13v5M7 18h10"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M6 10V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" stroke={stroke} strokeWidth={sw} />
        </svg>
      );
    case "Cycle":
      return (
        <svg {...common}>
          <circle cx="7" cy="16" r="3" stroke={stroke} strokeWidth={sw} />
          <circle cx="17" cy="16" r="3" stroke={stroke} strokeWidth={sw} />
          <path
            d="M10 16 8 8h5l2 4M14 8l2 2M5 8h3"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "Dress":
      return (
        <svg {...common}>
          <path
            d="M12 3 9 6v6l-4 9h14l-4-9V6l-3-3Z"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinejoin="round"
          />
          <path d="M9 6h6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
    case "Cooler":
      return (
        <svg {...common}>
          <rect
            x="7"
            y="4"
            width="10"
            height="16"
            rx="2"
            stroke={stroke}
            strokeWidth={sw}
          />
          <path d="M10 8h4M10 12h4M10 16h3" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <path
            d="M9 4V3h6v1"
            stroke={stroke}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="3"
            stroke={stroke}
            strokeWidth={sw}
          />
          <path d="M8 12h8M12 8v8" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        </svg>
      );
  }
}
