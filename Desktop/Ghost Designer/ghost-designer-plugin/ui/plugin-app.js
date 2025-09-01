// Ghost Designer Plugin App - Figma Integration
// This is a simplified version that works within Figma's plugin environment

class GhostDesignerPlugin {
  constructor() {
    this.digest = null;
    this.issues = [];
    this.score = null;
    this.suggestions = [];
    this.undoStack = [];
    this.isAnalyzing = false;
    this.isLoadingAI = false;
    
    this.init();
  }

  init() {
    // Listen for messages from Figma plugin main thread
    window.onmessage = (event) => {
      if (event.data.pluginMessage) {
        this.handleMessage(event.data.pluginMessage);
      }
    };

    this.render();
    this.setupEventListeners();
  }

  handleMessage(message) {
    switch (message.type) {
      case 'FIGMA_DIGEST':
        this.loadFigmaDigest(message.digest);
        break;
      case 'NO_SELECTION':
        this.showNoSelection();
        break;
    }
  }

  loadFigmaDigest(digest) {
    this.isAnalyzing = true;
    this.render();

    this.digest = digest;
    this.issues = this.analyzeDigest(digest);
    this.score = this.computeScore(this.issues);
    this.isAnalyzing = false;
    this.suggestions = [];
    this.undoStack = [];

    this.render();
  }

  analyzeDigest(digest) {
    const issues = [];
    
    digest.layers.forEach(layer => {
      // Rule 1: spacing_off_grid
      if (layer.styles.padding && !this.isValidSpacing(layer.styles.padding)) {
        const closest = this.findClosestSpacing(layer.styles.padding);
        issues.push({
          id: `spacing-padding-${layer.id}`,
          type: 'spacing_off_grid',
          severity: 'warning',
          message: `Padding ${layer.styles.padding}px is not on 4/8 grid`,
          layerId: layer.id,
          suggestedFix: `Use ${closest}px instead (closest grid value)`,
          confidence: 0.95
        });
      }

      // Rule 2: token_miss - colors
      if (layer.styles.backgroundColor && !this.isValidColor(layer.styles.backgroundColor)) {
        issues.push({
          id: `token-bg-${layer.id}`,
          type: 'token_miss',
          severity: 'error',
          message: `Background color ${layer.styles.backgroundColor} is not a design token`,
          layerId: layer.id,
          suggestedFix: 'Replace with design system color token',
          confidence: 0.9
        });
      }

      if (layer.styles.color && !this.isValidColor(layer.styles.color)) {
        issues.push({
          id: `token-color-${layer.id}`,
          type: 'token_miss',
          severity: 'error',
          message: `Text color ${layer.styles.color} is not a design token`,
          layerId: layer.id,
          suggestedFix: 'Replace with design system color token',
          confidence: 0.9
        });
      }

      // Rule 3: low_contrast
      if (layer.styles.backgroundColor && layer.styles.color && layer.type === 'text') {
        const contrast = this.calculateContrast(layer.styles.backgroundColor, layer.styles.color);
        if (contrast < 4.5) {
          issues.push({
            id: `contrast-${layer.id}`,
            type: 'low_contrast',
            severity: 'error',
            message: `Contrast ratio ${contrast.toFixed(1)}:1 is below WCAG AA standard (4.5:1)`,
            layerId: layer.id,
            suggestedFix: 'Use darker text color or lighter background',
            confidence: 0.98
          });
        }
      }
    });

    return issues;
  }

  computeScore(issues) {
    const breakdown = {
      totalIssues: issues.length,
      errorCount: issues.filter(i => i.severity === 'error').length,
      warningCount: issues.filter(i => i.severity === 'warning').length,
      infoCount: issues.filter(i => i.severity === 'info').length
    };

    const severityWeights = { error: 8, warning: 3, info: 1 };
    const totalPenalty = issues.reduce((penalty, issue) => {
      return penalty + severityWeights[issue.severity];
    }, 0);

    const value = Math.max(0, 100 - totalPenalty);

    return { value, breakdown };
  }

  // Design system validation helpers
  isValidSpacing(value) {
    const spacingGrid = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
    return spacingGrid.includes(value);
  }

  findClosestSpacing(value) {
    const spacingGrid = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
    return spacingGrid.reduce((prev, curr) => 
      Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
    );
  }

  isValidColor(color) {
    const validColors = [
      '#000000', '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da',
      '#adb5bd', '#6c757d', '#495057', '#343a40', '#212529', '#1a1a1a',
      '#007bff', '#0056b3', '#28a745', '#ffc107', '#dc3545', '#17a2b8'
    ];
    return validColors.includes(color.toLowerCase());
  }

  calculateContrast(bg, text) {
    const getLuminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = ((rgb >> 16) & 0xff) / 255;
      const g = ((rgb >> 8) & 0xff) / 255;
      const b = (rgb & 0xff) / 255;
      
      const toLinear = (c) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    };

    const bgLum = getLuminance(bg);
    const textLum = getLuminance(text);
    const lighter = Math.max(bgLum, textLum);
    const darker = Math.min(bgLum, textLum);
    return (lighter + 0.05) / (darker + 0.05);
  }

  applyFix(issueId) {
    const issueToFix = this.issues.find(issue => issue.id === issueId);
    if (!issueToFix) return;

    const fixAction = {
      id: `fix-${Date.now()}`,
      issueId,
      timestamp: new Date(),
      description: `Fixed: ${issueToFix.message}`
    };

    this.issues = this.issues.filter(issue => issue.id !== issueId);
    this.score = this.computeScore(this.issues);
    this.undoStack.push(fixAction);

    this.render();
  }

  async askAI() {
    if (!this.digest) return;
    
    this.isLoadingAI = true;
    this.render();

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.suggestions = [
      {
        issue: "Consider using consistent spacing",
        target_id: "selection",
        why: "Inconsistent spacing reduces visual harmony and professional appearance",
        fix: "Apply 4/8 grid spacing system consistently across all elements",
        confidence: 0.85
      },
      {
        issue: "Improve color consistency",
        target_id: "selection", 
        why: "Non-token colors make design system maintenance difficult",
        fix: "Replace custom colors with design system tokens",
        confidence: 0.92
      }
    ];

    this.isLoadingAI = false;
    this.render();
  }

  exportReport() {
    if (!this.digest || !this.score) {
      alert('No analysis data available.');
      return;
    }

    const timestamp = new Date().toLocaleDateString();
    let report = `# Ghost Designer Report\n`;
    report += `**Generated:** ${timestamp}\n`;
    report += `**Frame:** ${this.digest.name}\n\n`;
    report += `## Design Health Score: ${this.score.value}/100\n\n`;
    report += `### Issue Breakdown\n`;
    report += `- **Total Issues:** ${this.score.breakdown.totalIssues}\n`;
    report += `- **Errors:** ${this.score.breakdown.errorCount}\n`;
    report += `- **Warnings:** ${this.score.breakdown.warningCount}\n\n`;

    if (this.issues.length > 0) {
      report += `## Remaining Issues (${this.issues.length})\n\n`;
      this.issues.forEach((issue, index) => {
        report += `### ${index + 1}. ${issue.message}\n`;
        report += `- **Layer:** ${issue.layerId}\n`;
        report += `- **Type:** ${issue.type}\n`;
        report += `- **Severity:** ${issue.severity}\n`;
        report += `- **Fix:** ${issue.suggestedFix}\n\n`;
      });
    }

    // Copy to clipboard
    navigator.clipboard.writeText(report).then(() => {
      alert('Report copied to clipboard!');
    }).catch(() => {
      alert('Report:\n\n' + report);
    });
  }

  showNoSelection() {
    this.digest = null;
    this.issues = [];
    this.score = null;
    this.render();
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-action="load-demo"]')) {
        // Request analysis from Figma
        parent.postMessage({ pluginMessage: { type: 'ANALYZE_SELECTION' } }, '*');
      }
      
      if (e.target.matches('[data-action="ask-ai"]')) {
        this.askAI();
      }
      
      if (e.target.matches('[data-action="export-report"]')) {
        this.exportReport();
      }
      
      if (e.target.matches('[data-action="apply-fix"]')) {
        const issueId = e.target.dataset.issueId;
        this.applyFix(issueId);
      }
    });
  }

  render() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <!-- Header -->
        <div style="padding: 16px; border-bottom: 1px solid #e5e7eb; background: #f8fafc;">
          <div style="font-size: 18px; font-weight: bold; color: #374151; margin-bottom: 8px;">
            Ghost Designer
          </div>
          <button data-action="load-demo" style="width: 100%; background: ${this.isAnalyzing ? '#9ca3af' : '#3b82f6'}; color: white; border: none; border-radius: 6px; padding: 8px 16px; font-size: 14px; cursor: ${this.isAnalyzing ? 'not-allowed' : 'pointer'};">
            ${this.isAnalyzing ? 'Analyzing...' : 'Analyze Selection'}
          </button>
        </div>

        <!-- Health Meter -->
        ${this.renderHealthMeter()}

        <!-- Content -->
        <div style="flex: 1; overflow: auto;">
          ${this.digest ? this.renderIssues() : this.renderEmptyState()}
        </div>

        <!-- Actions -->
        ${this.digest ? this.renderActions() : ''}
      </div>
    `;
  }

  renderHealthMeter() {
    if (!this.score) {
      return `
        <div style="padding: 16px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <div style="font-size: 24px; font-weight: bold; color: #666;">--</div>
          <div style="font-size: 12px; color: #999;">No Analysis</div>
        </div>
      `;
    }

    const percentage = this.score.value;
    const color = percentage >= 80 ? '#22c55e' : percentage >= 60 ? '#f59e0b' : '#ef4444';

    return `
      <div style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 12px;">
          <div style="font-size: 32px; font-weight: bold; color: ${color};">
            ${percentage}%
          </div>
          <div style="font-size: 12px; color: #666;">Design Health</div>
        </div>
        
        <div style="width: 100%; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden;">
          <div style="width: ${percentage}%; height: 100%; background: ${color}; transition: width 0.3s ease;"></div>
        </div>
        
        <div style="margin-top: 12px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Errors:</span>
            <span style="color: #ef4444; font-weight: bold;">${this.score.breakdown.errorCount}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
            <span>Warnings:</span>
            <span style="color: #f59e0b; font-weight: bold;">${this.score.breakdown.warningCount}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderEmptyState() {
    return `
      <div style="padding: 24px; text-align: center; color: #64748b;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎨</div>
        <div>Select Figma elements to analyze</div>
        <div style="font-size: 14px; margin-top: 8px;">
          Choose frames, text, or components to get design feedback
        </div>
      </div>
    `;
  }

  renderIssues() {
    if (this.issues.length === 0) {
      return `
        <div style="padding: 16px; text-align: center; color: #666;">
          <div style="font-size: 18px; margin-bottom: 8px;">🎉</div>
          <div>No issues found!</div>
        </div>
      `;
    }

    const issuesHtml = this.issues.map(issue => {
      const severityColor = issue.severity === 'error' ? '#ef4444' : issue.severity === 'warning' ? '#f59e0b' : '#6b7280';
      const severityIcon = issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';

      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; margin-bottom: 12px; background: #fff;">
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <span style="font-size: 16px;">${severityIcon}</span>
            <div style="flex: 1;">
              <div style="font-size: 14px; font-weight: 500; color: #374151; margin-bottom: 4px;">
                ${issue.message}
              </div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
                Layer: ${issue.layerId} • Type: ${issue.type}
              </div>
              <div style="font-size: 12px; color: #374151; background: #f9fafb; padding: 6px 8px; border-radius: 4px; margin-bottom: 8px;">
                💡 ${issue.suggestedFix}
              </div>
              <button data-action="apply-fix" data-issue-id="${issue.id}" style="background: #3b82f6; color: white; border: none; border-radius: 4px; padding: 6px 12px; font-size: 12px; cursor: pointer;">
                Apply Fix
              </button>
            </div>
            <div style="font-size: 10px; font-weight: bold; color: ${severityColor}; text-transform: uppercase;">
              ${issue.severity}
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div style="padding: 16px;">
        <div style="font-size: 14px; font-weight: bold; margin-bottom: 12px; color: #374151;">
          Issues (${this.issues.length})
        </div>
        ${issuesHtml}
      </div>
    `;
  }

  renderActions() {
    return `
      <div style="padding: 16px; border-top: 1px solid #e5e7eb; background: #f8fafc;">
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button data-action="ask-ai" style="background: ${this.isLoadingAI ? '#9ca3af' : '#8b5cf6'}; color: white; border: none; border-radius: 6px; padding: 8px 12px; font-size: 12px; cursor: ${this.isLoadingAI ? 'not-allowed' : 'pointer'};">
            ${this.isLoadingAI ? 'Getting AI Critique...' : '🤖 Ask AI'}
          </button>
          <button data-action="export-report" style="background: #059669; color: white; border: none; border-radius: 6px; padding: 8px 12px; font-size: 12px; cursor: pointer;">
            📄 Export Report
          </button>
        </div>
        
        ${this.suggestions.length > 0 ? `
          <div style="margin-top: 16px;">
            <div style="font-size: 12px; font-weight: bold; margin-bottom: 8px; color: #374151;">
              AI Suggestions (${this.suggestions.length})
            </div>
            ${this.suggestions.map(suggestion => `
              <div style="padding: 8px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; margin-bottom: 8px;">
                <div style="font-size: 11px; font-weight: 500; color: #92400e; margin-bottom: 4px;">
                  🤖 ${suggestion.issue}
                </div>
                <div style="font-size: 10px; color: #78350f; margin-bottom: 4px;">
                  <strong>Why:</strong> ${suggestion.why}
                </div>
                <div style="font-size: 10px; color: #78350f;">
                  <strong>Fix:</strong> ${suggestion.fix}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }
}

// Initialize the plugin when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new GhostDesignerPlugin();
});
