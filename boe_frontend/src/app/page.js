"use client";
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Settings, MessageSquare, ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/context/theme';
import { ThemeProvider } from '@/context/theme';
import WelcomePage from './WelcomePage';
import { AnimatePresence, motion } from 'framer-motion';
import CalendarComponent from '@/components/CalendarComponent';

const ChatWindow = () => {
  const { darkMode, toggleDarkMode } = useTheme(true);
  const [streamingMode, setStreamingMode] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedModelIndex, setSelectedModelIndex] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
    fetchModels();
    fetchCurrentModelIndex();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3550/conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('http://127.0.0.1:4550/downloaded_models');
      const data = await response.json();
      setModels(data.models);
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const fetchCurrentModelIndex = async () => {
    try {
      const response = await fetch('http://127.0.0.1:4550/selected_model');
      const data = await response.json();
      setSelectedModelIndex(data.model_index);
      setSelectedModel(models[data.model_index]);
    } catch (error) {
      console.error('Error fetching current model index:', error);
    }
  };

  const handleModelChange = async (modelIndex) => {
    try {
      await fetch(`http://127.0.0.1:4550/set_model/${modelIndex}`, { method: 'POST' });
      setSelectedModelIndex(modelIndex);
      setSelectedModel(models[modelIndex]);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error changing model:', error);
    }
  };

  const handleDaySelect = async (day) => {
    const formattedDay = day.replace(/-/g, '');
    try {
      await fetch(`http://127.0.0.1:6550/send_to_chroma/${formattedDay}`, { method: 'POST' });
      setSelectedDays(prevDays => [...prevDays, day]);
    } catch (error) {
      console.error('Error sending day to Chroma:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = { role: 'user', content: inputMessage };
    setMessages([...messages, newMessage]);
    setInputMessage('');

    const encodedQuery = encodeURIComponent(inputMessage);
    const endpoint = streamingMode 
      ? `http://127.0.0.1:3550/chat_stream/${encodedQuery}` 
      : `http://127.0.0.1:3550/chat/${encodedQuery}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (streamingMode) {
        const reader = response.body.getReader();
        let assistantMessage = { role: 'assistant', content: '' };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              assistantMessage.content += line.slice(6);
              setMessages(prevMessages => [...prevMessages.slice(0, -1), { ...assistantMessage }]);
            }
          }
        }
      } else {
        const data = await response.json();
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.answer }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="flex-1 flex bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
        {/* Left Sidebar */}
        <Sidebar position="left" open={leftSidebarOpen} onClose={() => setLeftSidebarOpen(false)}>
          <h2 className="text-xl font-bold mb-4">Conversaciones</h2>
          {conversations.map((conv) => (
            <Card key={conv.id} className="p-2 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
              {`Conversación ${conv.id}`}...
            </Card>
          ))}
        </Sidebar>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
                         ${leftSidebarOpen ? 'ml-64' : 'ml-0'}
                         ${rightSidebarOpen ? 'mr-64' : 'mr-0'}`}>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, index) => (
                <div key={index} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg break-words ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 border-t dark:border-gray-700">
            <div className="max-w-3xl mx-auto flex">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 p-2 border rounded-l-lg dark:bg-gray-800 dark:border-gray-700"
                placeholder="Escribe tu mensaje..."
              />
              <Button onClick={handleSendMessage} className="rounded-r-lg">Enviar</Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <Sidebar position="right" open={rightSidebarOpen} onClose={() => setRightSidebarOpen(false)}>
          <h2 className="text-xl font-bold mb-4">Ajustes</h2>
          <div className="flex items-center justify-between mb-4">
            <span>Modo Oscuro</span>
            <Switch
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
              icon={darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span>Streaming</span>
            <Switch
              checked={streamingMode}
              onCheckedChange={setStreamingMode}
            />
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Modelo de Lenguaje</h3>
            <div className="relative">
              <Button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full justify-between"
              >
                {selectedModel || "Selecciona un modelo"}
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </Button>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg"
                  >
                    {models.map((model, index) => (
                      <div
                        key={index}
                        className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                          index === selectedModelIndex ? 'bg-blue-100 dark:bg-blue-700' : ''
                        }`}
                        onClick={() => handleModelChange(index)}
                      >
                        {model}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {selectedDays.map((day) => (
                <span key={day} className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                  {day}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <CalendarComponent onDaySelect={handleDaySelect} />
          </div>
        </Sidebar>

        {/* Toggle buttons for sidebars */}
        <Button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="absolute top-4 left-4 z-10"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
        <Button
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className="absolute top-4 right-4 z-10"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

const App = () => {
  const [showChat, setShowChat] = useState(false);

  return (
    <ThemeProvider>
      {showChat ? (
        <ChatWindow />
      ) : (
        <WelcomePage onStartChat={() => setShowChat(true)} />
      )}
    </ThemeProvider>
  );
};

export default App;