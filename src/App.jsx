import { useState, useEffect } from 'react';
import ThemeToggle from './components/ThemeToggle.jsx';
import AceEditor from 'react-ace';
import Login from './components/Login.jsx';

// Import ace editor themes and modes
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/theme-tomorrow_night';
import "ace-builds/src-noconflict/ext-language_tools";

function App() {
  const [apiPath, setApiPath] = useState('');
  const [mockResponse, setMockResponse] = useState('');
  const [endpoints, setEndpoints] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [jsonError, setJsonError] = useState(null);
  const [editorTheme, setEditorTheme] = useState('tomorrow_night');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication on load
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(auth);
    
    // Check theme
    const isDark = localStorage.theme === 'light' ? false : true;
    setDarkMode(isDark);
    setEditorTheme(isDark ? 'tomorrow_night' : 'tomorrow');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Fetch endpoints
    fetchEndpoints();
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    setEditorTheme(newDarkMode ? 'tomorrow_night' : 'tomorrow');
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  const fetchEndpoints = async () => {
    try {
      const response = await fetch('http://localhost:3001/endpoints');
      const data = await response.json();
      setEndpoints(data);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const parsedResponse = JSON.parse(mockResponse);
      
      const url = editingId 
        ? `http://localhost:3001/update-mock/${editingId}`
        : 'http://localhost:3001/create-mock';
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiPath, mockResponse: parsedResponse }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }
      
      alert(editingId ? 'Mock endpoint updated!' : 'Mock endpoint created!');
      setApiPath('');
      setMockResponse('');
      setEditingId(null);
      fetchEndpoints();
    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error('Detailed error:', error);
    }
  };

  const handleEdit = async (endpoint) => {
    setApiPath(endpoint.path);
    setMockResponse(JSON.stringify(endpoint.response, null, 2));
    setEditingId(endpoint.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this endpoint?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/delete-mock/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEndpoints(endpoints.filter(endpoint => endpoint.id !== id));
      }
    } catch (error) {
      alert('Error deleting mock endpoint');
      console.error(error);
    }
  };

  const validateJson = (value) => {
    try {
      JSON.parse(value);
      setJsonError(null);
      return true;
    } catch (e) {
      setJsonError({
        message: e.message,
        line: e.lineNumber || (e.message.match(/line (\d+)/) || [])[1]
      });
      return false;
    }
  };

  const handleJsonChange = (value) => {
    setMockResponse(value);
    validateJson(value);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={setIsAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
      
      <button
        onClick={handleLogout}
        className="fixed top-4 left-4 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
      >
        Logout
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {editingId ? 'Edit Mock API' : 'Create Mock API'}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                API Path
              </label>
              <input
                type="text"
                value={apiPath}
                onChange={(e) => setApiPath(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                placeholder="/api/your-endpoint"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mock Response (JSON)
                {jsonError && (
                  <span className="ml-2 text-red-500 text-xs">
                    Error: {jsonError.message}
                  </span>
                )}
              </label>
              <div className={`border ${darkMode ? 'border-gray-600' : 'border-gray-300'} rounded-md overflow-hidden`}>
                <AceEditor
                  mode="json"
                  theme={editorTheme}
                  onChange={handleJsonChange}
                  value={mockResponse}
                  name="json-editor"
                  editorProps={{ $blockScrolling: true }}
                  setOptions={{
                    showLineNumbers: true,
                    tabSize: 2,
                    useWorker: false,
                    highlightActiveLine: true,
                    showPrintMargin: false,
                    fontSize: 14,
                  }}
                  style={{ 
                    width: '100%', 
                    height: '390px',
                  }}
                  markers={jsonError?.line ? [{
                    startRow: jsonError.line - 1,
                    endRow: jsonError.line - 1,
                    className: 'error-line',
                    type: 'background',
                    startCol: 0,
                    endCol: 1000
                  }] : []}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                className="w-48 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-gray-800"
              >
                {editingId ? 'Update Mock Endpoint' : 'Save Mock Endpoint'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Existing Endpoints
            </h3>
            <div className="space-y-3">
              {endpoints.map((endpoint) => (
                <div 
                  key={endpoint.id} 
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <a 
                        href={`http://localhost:3001${endpoint.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer"
                      >
                        {endpoint.path}
                      </a>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {JSON.stringify(endpoint.response).slice(0, 100)}...
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(endpoint)}
                        className="text-xs px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(endpoint.id)}
                        className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 