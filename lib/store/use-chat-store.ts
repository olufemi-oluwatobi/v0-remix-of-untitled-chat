import { create } from "zustand"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface ChatState {
  messages: ChatMessage[]
  isOpen: boolean
  isLoading: boolean

  // Actions
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void
  clearMessages: () => void
  setIsOpen: (isOpen: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  sendMessage: (content: string) => Promise<void>
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isOpen: false,
  isLoading: false,

  addMessage: (message) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    }
    set((state) => ({
      messages: [...state.messages, newMessage],
    }))
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  setIsOpen: (isOpen) => {
    set({ isOpen })
  },

  setIsLoading: (isLoading) => {
    set({ isLoading })
  },

  sendMessage: async (content) => {
    const { addMessage, setIsLoading } = get()

    // Add user message
    addMessage({ role: "user", content })

    // Set loading state
    setIsLoading(true)

    try {
      // TODO: Replace with actual AI API call
      // For now, simulate AI response
      await new Promise((resolve) => setTimeout(resolve, 1000))

      addMessage({
        role: "assistant",
        content: "This is a simulated AI response. Connect to an AI service to get real responses.",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      addMessage({
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  },
}))
