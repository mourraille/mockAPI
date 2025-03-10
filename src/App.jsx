import { useState, useEffect, useCallback } from "react";
import ThemeToggle from "./components/ThemeToggle.jsx";
import AceEditor from "react-ace";
import Snackbar from "./components/Snackbar";
import Login from "./components/Login.jsx";
import { useAuth } from "./context/AuthContext";

// Import ace editor themes and modes
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-noconflict/theme-tomorrow_night";
import "ace-builds/src-noconflict/ext-language_tools";

const DEV_API_URL = "http://localhost:3021"; // Define the DEV_API_URL
const PROD_API_URL = "https://apimock.mourraille.com"; // Define the PROD_API_URL

function App() {
  const [apiPath, setApiPath] = useState("");
  const [apiRoot, setApiRoot] = useState("");
  const [mockResponse, setMockResponse] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("json"); // "json" or "ai"
  const [endpoints, setEndpoints] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [jsonError, setJsonError] = useState(null);
  const [editorTheme, setEditorTheme] = useState("tomorrow_night");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  // Use the auth context
  const { currentUser, logout } = useAuth();

  const fetchEndpoints = useCallback(async () => {
    try {
      const response = await fetch(apiRoot + "/endpoints");
      const data = await response.json();
      setEndpoints(data);
    } catch (error) {
      console.error("Error fetching endpoints:", error);
    }
  }, [apiRoot]);

  useEffect(() => {
    if (currentUser) {
      fetchEndpoints();
    }

    if (import.meta.env.PROD) {
      setApiRoot(PROD_API_URL);
    } else {
      setApiRoot(DEV_API_URL);
    }

    // Check theme
    const isDark = localStorage.theme === "light" ? false : true;
    setDarkMode(isDark);
    setEditorTheme(isDark ? "tomorrow_night" : "tomorrow");
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [fetchEndpoints, currentUser]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    setEditorTheme(newDarkMode ? "tomorrow_night" : "tomorrow");
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.theme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.theme = "light";
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setIsSnackbarOpen(true);
    setTimeout(() => {
      setIsSnackbarOpen(false);
    }, 3000); // Auto-hide after 3 seconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If using AI tab, show a message that it's not implemented yet
    if (activeTab === "ai") {
      showSnackbar("AI-generated responses coming soon!");
      return;
    }

    try {
      const parsedResponse = JSON.parse(mockResponse);

      const url = editingId
        ? `${apiRoot}/update-mock/${editingId}`
        : `${apiRoot}/create-mock`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ apiPath, mockResponse: parsedResponse }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error");
      }

      showSnackbar(
        editingId ? "Mock endpoint updated!" : "Mock endpoint created!"
      );
      setApiPath("");
      setMockResponse("");
      setEditingId(null);
      fetchEndpoints();
    } catch (error) {
      showSnackbar(`Error: ${error.message}`);
      console.error("Detailed error:", error);
    }
  };

  const handleEdit = async (endpoint) => {
    setApiPath(endpoint.path);
    setMockResponse(JSON.stringify(endpoint.response, null, 2));
    setEditingId(endpoint.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this endpoint?")) return;

    try {
      const response = await fetch(`${apiRoot}/delete-mock/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setEndpoints(endpoints.filter((endpoint) => endpoint.id !== id));
        showSnackbar("Mock endpoint deleted!");
      }
    } catch (error) {
      showSnackbar("Error deleting mock endpoint");
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
        line: e.lineNumber || (e.message.match(/line (\d+)/) || [])[1],
      });
      return false;
    }
  };

  const handleJsonChange = (value) => {
    setMockResponse(value);
    validateJson(value);
  };

  const handleAiPromptChange = (e) => {
    setAiPrompt(e.target.value);
  };

  // Function to handle tab switching
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = async () => {
    try {
      await logout();
      showSnackbar("Successfully logged out");
    } catch (error) {
      showSnackbar("Error logging out");
      console.error("Logout error:", error);
    }
  };

  // If not authenticated, show the login page
  if (!currentUser) {
    return <Login />;
  }

  return (
    <>
      <Snackbar
        message={snackbarMessage}
        isOpen={isSnackbarOpen}
        onClose={() => setIsSnackbarOpen(false)}
      />
      <div className='min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8'>
        <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />

        <button
          onClick={handleLogout}
          className='fixed top-4 left-4 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200'
        >
          Logout
        </button>

        <div className='max-w-4xl mx-auto'>
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
            <h2 className='text-2xl font-bold mb-6 text-gray-900 dark:text-white'>
              {editingId ? "Edit Mock API" : "Create Mock API"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  API Path
                </label>
                <input
                  type='text'
                  value={apiPath}
                  onChange={(e) => setApiPath(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white'
                  placeholder='/api/your-endpoint'
                />
              </div>

              <div className='mb-6'>
                <div className='flex items-center border-b border-gray-300 dark:border-gray-600 mb-2'>
                  <button
                    type='button'
                    className={`py-2 px-4 ${
                      activeTab === "json"
                        ? "border-b-2 border-indigo-500 font-medium text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    onClick={() => handleTabChange("json")}
                  >
                    JSON Editor
                  </button>
                  <button
                    type='button'
                    className={`py-2 px-4 ${
                      activeTab === "ai"
                        ? "border-b-2 border-indigo-500 font-medium text-indigo-600 dark:text-indigo-400"
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    onClick={() => handleTabChange("ai")}
                  >
                    AI Prompt
                  </button>
                </div>

                <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                  {activeTab === "json" ? (
                    <>
                      Mock Response (JSON)
                      {jsonError && (
                        <span className='ml-2 text-red-500 text-xs'>
                          Error: {jsonError.message}
                        </span>
                      )}
                    </>
                  ) : (
                    "Describe your API response"
                  )}
                </label>

                {activeTab === "json" ? (
                  <div
                    className={`border ${
                      darkMode ? "border-gray-600" : "border-gray-300"
                    } rounded-md overflow-hidden`}
                  >
                    <AceEditor
                      mode='json'
                      theme={editorTheme}
                      onChange={handleJsonChange}
                      value={mockResponse}
                      name='json-editor'
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
                        width: "100%",
                        height: "390px",
                      }}
                      markers={
                        jsonError?.line
                          ? [
                              {
                                startRow: jsonError.line - 1,
                                endRow: jsonError.line - 1,
                                className: "error-line",
                                type: "background",
                                startCol: 0,
                                endCol: 1000,
                              },
                            ]
                          : []
                      }
                    />
                  </div>
                ) : (
                  <div className='border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden'>
                    <textarea
                      value={aiPrompt}
                      onChange={handleAiPromptChange}
                      className='w-full px-3 py-2 border-none focus:ring-0 dark:bg-gray-700 dark:text-white'
                      placeholder='Describe the API response you want to generate. For example: "Create a response for a user profile API with name, email, avatar, and a list of 3 recent orders with products and prices."'
                      rows={16}
                      style={{ resize: "none" }}
                    />
                  </div>
                )}
              </div>

              <div className='flex justify-center'>
                <button
                  type='submit'
                  className='w-48 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-gray-800'
                >
                  {editingId ? (
                    "Update Mock Endpoint"
                  ) : activeTab === "ai" ? (
                    <>
                      <span className='mr-2'>✨</span>Create with AI
                    </>
                  ) : (
                    "Save Mock Endpoint"
                  )}
                </button>
              </div>
            </form>

            <div className='mt-8'>
              <h3 className='text-lg font-medium text-gray-900 dark:text-white mb-4'>
                Existing Endpoints
              </h3>
              <div className='space-y-3'>
                {endpoints.map((endpoint) => (
                  <div
                    key={endpoint.id}
                    className='bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200'
                  >
                    <div className='p-4 flex items-center justify-between'>
                      <div className='flex-1'>
                        <a
                          href={`${apiRoot}${endpoint.path}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 cursor-pointer'
                        >
                          {endpoint.path}
                        </a>
                        <div className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                          {JSON.stringify(endpoint.response).slice(0, 100)}...
                        </div>
                      </div>
                      <div className='flex space-x-2 ml-4'>
                        <button
                          onClick={() => handleEdit(endpoint)}
                          className='text-xs px-3 py-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 transition-colors duration-200'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(endpoint.id)}
                          className='text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 transition-colors duration-200'
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `${apiRoot}${endpoint.path}`
                            );
                            showSnackbar("Endpoint URL copied to clipboard!");
                          }}
                          className='text-xs px-3 py-1.5 bg-green-100 text-green-600 rounded-md hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 transition-colors duration-200'
                        >
                          <span role='img' aria-label='copy'>
                            🔗
                          </span>
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
      <footer className='bg-gray-100 dark:bg-gray-900 text-center py-4'>
        <a
          href='https://mourraille.com'
          className='text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 inline-block w-full h-full py-2'
          target='_blank'
          rel='noopener noreferrer'
        >
          © Mourraille {new Date().getFullYear()}
        </a>
      </footer>
    </>
  );
}

export default App;
