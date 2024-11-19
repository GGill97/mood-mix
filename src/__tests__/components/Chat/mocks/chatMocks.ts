// src/__tests__/components/Chat/mocks/chatMocks.ts

// Mock for useChatPersistence hook
export const mockUseChatPersistence = {
    sessions: [{
      id: 'test-session-1',
      messages: [],
      createdAt: Date.now()
    }],
    currentSessionId: 'test-session-1',
    createNewSession: jest.fn(),
    updateSession: jest.fn(),
    getSession: jest.fn(),
    deleteSession: jest.fn(),
    setCurrentSessionId: jest.fn(),
  };
  
  // Mock welcome message
  export const mockWelcomeMessage = {
    role: 'assistant',
    content: 'Welcome to MoodMix! How are you feeling today?',
    timestamp: Date.now(),
  };
  
  // Mock mood analysis response
  export const mockMoodAnalysis = {
    genres: ['pop', 'dance'],
    weatherMood: 'clear sky',
    response: 'Here are some upbeat songs for you!',
    moodAnalysis: 'Positive and energetic',
  };
  
  // Mock API responses
  export const mockFetchSuccess = () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockMoodAnalysis,
    });
  };
  
  export const mockFetchError = () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
  };