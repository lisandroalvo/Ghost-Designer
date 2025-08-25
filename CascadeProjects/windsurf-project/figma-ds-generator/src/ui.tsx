export {};

declare global {
  interface Window {
    React: typeof import('react');
    ReactDOM: typeof import('react-dom');
  }
}

const React = window.React;
const ReactDOM = window.ReactDOM;

type GeneratorOptions = {
  useBuiltInTokens: boolean;
  generateStyles: boolean;
  generateButton: boolean;
  generateTextField: boolean;
  generateCard: boolean;
  tokensJson?: string;
};

type PluginMessage = {
  type: string;
  message?: string;
  options?: GeneratorOptions;
};

type EventWithPluginMessage = MessageEvent & {
  data: {
    pluginMessage: PluginMessage;
  };
};

const App = () => {
  const [options, setOptions] = React.useState<GeneratorOptions>({
    useBuiltInTokens: true,
    generateStyles: true,
    generateButton: true,
    generateTextField: true,
    generateCard: true
  });
  const [status, setStatus] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOptions(prev => ({ ...prev, useBuiltInTokens: false }));
    }
  };

  const handleGenerate = async () => {
    try {
      setStatus('Generating...');
      let tokensJson: string | undefined;

      if (!options.useBuiltInTokens && file) {
        tokensJson = await file.text();
      }

      parent.postMessage({
        pluginMessage: {
          type: 'generate',
          options: {
            ...options,
            tokensJson
          }
        }
      }, '*');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus(`Error: ${message}`);
    }
  };

  React.useEffect(() => {
    const handleMessage = (event: EventWithPluginMessage) => {
      const { type, message } = event.data.pluginMessage;
      if (type === 'complete') {
        setStatus('Generation complete!');
      } else if (type === 'error') {
        setStatus(`Error: ${message}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={options.useBuiltInTokens}
            onChange={e => setOptions(prev => ({ ...prev, useBuiltInTokens: e.target.checked }))}
          />
          Use bundled tokens
        </label>
        {!options.useBuiltInTokens && (
          <div style={{ marginTop: '10px' }}>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
            />
          </div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Components to Generate</h3>
        <label>
          <input
            type="checkbox"
            checked={options.generateStyles}
            onChange={e => setOptions(prev => ({ ...prev, generateStyles: e.target.checked }))}
          />
          Styles
        </label>
        <label>
          <input
            type="checkbox"
            checked={options.generateButton}
            onChange={e => setOptions(prev => ({ ...prev, generateButton: e.target.checked }))}
          />
          Button
        </label>
        <label>
          <input
            type="checkbox"
            checked={options.generateTextField}
            onChange={e => setOptions(prev => ({ ...prev, generateTextField: e.target.checked }))}
          />
          Text Field
        </label>
        <label>
          <input
            type="checkbox"
            checked={options.generateCard}
            onChange={e => setOptions(prev => ({ ...prev, generateCard: e.target.checked }))}
          />
          Card
        </label>
      </div>

      <button
        onClick={handleGenerate}
        style={{
          background: '#18A0FB',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 16px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Generate Components
      </button>

      {status && (
        <div style={{ marginTop: '16px', color: status.includes('Error') ? '#EF4444' : '#10B981' }}>
          {status}
        </div>
      )}
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('react-page'));

