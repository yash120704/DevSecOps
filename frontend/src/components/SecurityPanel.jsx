const SecurityPanel = ({ securityData }) => {
  if (!securityData || !securityData.rules) {
    return null;
  }

  const failures = securityData.rules.filter(rule => rule.status === 'FAIL');
  const warnings = securityData.rules.filter(rule => rule.status === 'WARN');

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">Security Findings</h3>
      
      {failures.length > 0 && (
        <div className="mb-4">
          <h4 className="text-lg font-medium text-red-700 mb-2">
            Critical Issues ({failures.length})
          </h4>
          <div className="space-y-2">
            {failures.map((rule, index) => (
              <div key={index} className="bg-red-50 border-l-4 border-red-500 p-3">
                <div className="font-medium text-red-800">{rule.rule}</div>
                <div className="text-sm text-red-700 mt-1">{rule.details}</div>
                {rule.findings && rule.findings.length > 0 && (
                  <div className="mt-2 text-xs text-red-600">
                    <div className="font-medium">Findings:</div>
                    <ul className="list-disc list-inside mt-1">
                      {rule.findings.slice(0, 5).map((finding, idx) => (
                        <li key={idx}>
                          {finding.file}
                          {finding.line && ` (line ${finding.line})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-yellow-700 mb-2">
            Warnings ({warnings.length})
          </h4>
          <div className="space-y-2">
            {warnings.map((rule, index) => (
              <div key={index} className="bg-yellow-50 border-l-4 border-yellow-500 p-3">
                <div className="font-medium text-yellow-800">{rule.rule}</div>
                <div className="text-sm text-yellow-700 mt-1">{rule.details}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {failures.length === 0 && warnings.length === 0 && (
        <div className="text-green-700 bg-green-50 p-4 rounded">
          ✓ No security issues detected
        </div>
      )}
    </div>
  );
};

export default SecurityPanel;
