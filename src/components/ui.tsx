import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Button({ className = "", variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-lime text-navy hover:bg-lime-dark",
    secondary: "bg-navy text-white hover:bg-navy-light",
    ghost: "border border-line bg-white text-navy hover:bg-mist",
    danger: "bg-red-50 text-red-700 hover:bg-red-100",
  };
  return <button className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`} {...props} />;
}

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-navy outline-none transition placeholder:text-slate-400 focus:border-navy focus:ring-4 focus:ring-navy/5 ${className}`} {...props} />;
}

export function Select({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`min-h-12 w-full rounded-xl border border-line bg-white px-4 text-sm text-navy outline-none focus:border-navy ${className}`} {...props}>{children}</select>;
}

export function Textarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`min-h-28 w-full resize-y rounded-xl border border-line bg-white p-4 text-sm text-navy outline-none focus:border-navy ${className}`} {...props} />;
}

export function PageTitle({ eyebrow, children, description }: { eyebrow?: string; children: ReactNode; description?: string }) {
  return (
    <div>
      {eyebrow && <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-emerald">{eyebrow}</p>}
      <h1 className="font-display text-4xl font-semibold tracking-tight text-navy md:text-6xl">{children}</h1>
      {description && <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p>}
    </div>
  );
}
