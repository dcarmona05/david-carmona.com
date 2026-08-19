export default function RoleResponsibilities({ role, responsibilities }) {
  if (responsibilities && responsibilities.length > 0) {
    return (
      <div>
        {role && <p className="text-sm text-white/40 uppercase tracking-wide">{role}</p>}
        <ul className="mt-4 space-y-2.5">
          {responsibilities.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <span className="text-white/70 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-white/15 p-6">
      {role && <p className="text-sm text-white/40 uppercase tracking-wide">{role}</p>}
      <p className="mt-3 text-white/40">
        Specific responsibilities for this project are coming soon.
      </p>
    </div>
  );
}
