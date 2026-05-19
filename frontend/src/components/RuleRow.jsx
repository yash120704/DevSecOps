import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function RuleRow({ rule }) {
  const status = String(rule?.status || 'WARN').toUpperCase();

  const config = {
    PASS: { icon: CheckCircle2, cls: 'text-lime-400', marker: 'animate-pulse' },
    FAIL: { icon: XCircle, cls: 'text-rose-500', marker: 'animate-[wiggle_0.7s_ease-in-out_infinite]' },
    WARN: { icon: AlertTriangle, cls: 'text-amber-400', marker: 'animate-pulse' },
  }[status] || { icon: AlertTriangle, cls: 'text-amber-400', marker: 'animate-pulse' };

  const Icon = config.icon;

  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 items-start py-3 border-b border-slate-800 text-sm">
      <div className={`inline-flex items-center gap-2 font-semibold ${config.cls}`}>
        <Icon className={config.marker} size={16} />
        {status}
      </div>
      <div>
        <p className="text-cyan-100 font-medium">{rule?.rule || 'Unnamed rule'}</p>
        <p className="text-slate-400 mt-1">{rule?.details || 'No details provided.'}</p>
      </div>
    </div>
  );
}
