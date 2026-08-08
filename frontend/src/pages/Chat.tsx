export default function Chat() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Ask My Report</h1>
        <p className="text-slate-500 mt-1">Chat with HealthLens AI about your recent results.</p>
      </header>
      <div className="flex-1 bg-white border border-slate-200 rounded-3xl shadow-sm flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 text-center p-8">Upload a report first to enable chat.</p>
      </div>
    </div>
  );
}
