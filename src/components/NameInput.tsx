import { useState } from "react";

type Props = {
  initialName: string;
  onSubmit: (name: string) => void;
  submitting: boolean;
  submitted: boolean;
};

export const NameInput = ({
  initialName,
  onSubmit,
  submitting,
  submitted,
}: Props) => {
  const [name, setName] = useState(initialName);

  if (submitted) {
    return (
      <p className="text-base opacity-80">Saved as “{name || "anon"}”.</p>
    );
  }

  return (
    <form
      className="flex items-center gap-2 font-sans"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(name.trim().slice(0, 20));
      }}
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="your name"
        maxLength={20}
        autoFocus
        disabled={submitting}
        className="px-3 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/40 outline-none focus:border-white/60 text-base w-44"
      />
      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 rounded-md bg-white/15 border border-white/25 text-white text-base hover:bg-white/25 transition-colors disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save score"}
      </button>
    </form>
  );
};
