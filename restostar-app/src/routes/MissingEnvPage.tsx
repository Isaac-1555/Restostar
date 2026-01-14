type Props = {
  missing: string[];
};

export function MissingEnvPage({ missing }: Props) {
  return (
    <div className="mx-auto max-w-xl space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h1 className="text-base font-semibold text-amber-900">Missing env vars</h1>
      <p className="text-sm text-amber-900">
        Add these to <code className="font-mono">.env.local</code> and restart the
        dev server:
      </p>
      <ul className="list-inside list-disc text-sm text-amber-900">
        {missing.map((key) => (
          <li key={key}>
            <code className="font-mono">{key}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}
