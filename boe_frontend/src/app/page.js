"use client";
import React, { useState, useEffect } from 'react';
import { Sun, Moon, Settings, MessageSquare } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/ui/sidebar';
import { Card } from '@/components/ui/card';
import WelcomePage from '@/app/WelcomePage';
import { ThemeProvider, useTheme } from '@/context/theme';

const ChatWindow = () => {
  const { darkMode, toggleDarkMode } = useTheme(true);
  const [streamingMode, setStreamingMode] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    fetchConversations();
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

  const handleDaySelect = async (day) => {
    const formattedDay = day.replace(/-/g, '');
    try {
      await fetch(`http://127.0.0.1:6550/send_to_chroma/${formattedDay}`);
      setSelectedDays([...selectedDays, day]);
    } catch (error) {
      console.error('Error sending day to Chroma:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage = { role: 'user', content: inputMessage };
    setMessages([...messages, newMessage]);
    setInputMessage('');

    const endpoint = streamingMode ? 'http://127.0.0.1:3550/chat_stream' : 'http://127.0.0.1:3550/chat';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage }),
      });

      if (streamingMode) {
        // Implementación del streaming (esto es un placeholder)
        const reader = response.body.getReader();
        let assistantMessage = { role: 'assistant', content: '' };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantMessage.content += new TextDecoder().decode(value);
          setMessages(prevMessages => [...prevMessages.slice(0, -1), assistantMessage]);
        }
      } else {
        const data = await response.json();
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: data.response }]);
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
          <h2 className="text-xl font-bold mb-4">Conversations</h2>
          {conversations.map((conv) => (
            <Card key={conv.id} className="p-2 mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
              {conv.messages[0].content.substring(0, 50)}...
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
                placeholder="Type your message..."
              />
              <Button onClick={handleSendMessage} className="rounded-r-lg">Send</Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <Sidebar position="right" open={rightSidebarOpen} onClose={() => setRightSidebarOpen(false)}>
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          <div className="flex items-center justify-between mb-4">
            <span>Dark Mode</span>
            <Switch
              checked={darkMode}
              onCheckedChange={toggleDarkMode}
              icon={darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span>Streaming Mode</span>
            <Switch
              checked={streamingMode}
              onCheckedChange={setStreamingMode}
            />
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Selected Days</h3>
            <div className="flex flex-wrap gap-2">
              {selectedDays.map((day) => (
                <span key={day} className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">
                  {day}
                </span>
              ))}
            </div>
          </div>
          {/* Aquí iría el componente Calendar, que no está incluido en este ejemplo */}
        </Sidebar>

        {/* Toggle buttons for sidebars */}
        <Button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="absolute top-4 left-4 z-10"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className="absolute top-4 right-4 z-10"
        >
          <Settings className="h-4 w-4" />
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