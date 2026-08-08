export default function Wellness() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">My Wellness</h1>
        <p className="text-slate-500 mt-1">General health guidance based on your profile.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Fitness</h2>
          <p className="text-slate-500">Coming soon in Phase 7</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Sleep</h2>
          <p className="text-slate-500">Coming soon in Phase 7</p>
        </div>
      </div>
    </div>
  );
}
