import { AlertTriangle, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function RuleRow({ rule }) {
  const status = String(rule?.status || 'WARN').toUpperCase();
  const [expanded, setExpanded] = useState(false);
  const hasFindings = rule?.findings && rule.findings.length > 0;

  const config = {
    PASS: { icon: CheckCircle2, cls: 'text-lime-400', marker: 'animate-pulse' },
    FAIL: { icon: XCircle, cls: 'text-rose-500', marker: 'animate-[wiggle_0.7s_ease-in-out_infinite]' },
    WARN: { icon: AlertTriangle, cls: 'text-amber-400', marker: 'animate-pulse' },
  }[status] || { icon: AlertTriangle, cls: 'text-amber-400', marker: 'animate-pulse' };

  const Icon = config.icon;

  return (
    <div className="py-3 border-b border-slate-800">
      <div className="grid grid-cols-[140px_1fr] gap-3 items-start text-sm">
        <div className={`inline-flex items-center gap-2 font-semibold ${config.cls}`}>
          <Icon className={config.marker} size={16} />
          {status}
        </div>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-cyan-100 font-medium">{rule?.rule || 'Unnamed rule'}</p>
            <p className="text-slate-400 mt-1">{rule?.details || 'No details provided.'}</p>
          </div>
          {hasFindings && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-3 p-1 hover:bg-slate-700/50 rounded transition-colors"
              title={expanded ? 'Hide details' : 'Show details'}
            >
              <ChevronDown size={16} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          )}
        </div>
      </div>

      {hasFindings && expanded && (
        <div className="mt-3 ml-[140px] pl-3 border-l-2 border-slate-700">
          <div className="space-y-2">
            {rule.findings.map((finding, idx) => (
              <div key={idx} className="bg-slate-800/50 rounded p-3 text-xs">
                {/* Dependency vulnerabilities */}
                {finding.package && (
                  <div className="space-y-1">
                    <p className="text-cyan-300 font-semibold">
                      📦 {finding.package}{finding.version ? ` v${finding.version}` : ''}
                    </p>
                    {finding.description && (
                      <p className="text-slate-300">{finding.description}</p>
                    )}
                    {finding.severity && (
                      <p className="text-slate-400">
                        <span className={finding.severity === 'CRITICAL' || finding.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}>
                          Severity: {finding.severity}
                        </span>
                      </p>
                    )}
                    {finding.id && (
                      <p className="text-slate-400">ID: {finding.id}</p>
                    )}
                    {finding.fixed_version && (
                      <p className="text-lime-300">✓ Fixed in: {finding.fixed_version}</p>
                    )}
                    {finding.vulnerabilities && (
                      <p className="text-slate-300 mt-1">{finding.vulnerabilities}</p>
                    )}
                  </div>
                )}
                
                {/* Secrets or other findings */}
                {finding.file && !finding.package && (
                  <div className="space-y-1">
                    <p className="text-cyan-300 font-semibold">
                      📄 {finding.file}
                    </p>
                    {finding.type && (
                      <p className="text-rose-300">{finding.type}</p>
                    )}
                    {finding.line && (
                      <p className="text-slate-400">Line: {finding.line}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
