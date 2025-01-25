'use client'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, SendHorizontal } from 'lucide-react'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/src/resources/chat/completions.js'
import { useEffect, useRef, useState } from 'react'

interface Message {
  role: string
  content: string
}
function isBotMessage(message: Message) {
  return message.role === 'assistant'
}

export function ChatBox() {
  const [messages, setMessages] = useState('')
  const [historyMessages, setHistoryMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! 👋 What can I do for you today? 😊',
    },
  ])
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const openAI = new OpenAI({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userMessage = {
      role: 'user',
      content: messages,
    }
    const history = [...historyMessages, userMessage]
    setHistoryMessages(history) // Show user message immediately
    setMessages('')

    try {
      let chatCompletion = ''
      const botMessage = {
        role: 'assistant',
        content: 'please wait...',
      }
      setHistoryMessages([...history, botMessage]) // Add empty bot message

      const stream = await openAI.chat.completions.create({
        messages: history as ChatCompletionMessageParam[],
        model: 'gemma2-9b-it',
        stream: true,
      })

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta.content || ''
        chatCompletion += content
        botMessage.content = chatCompletion // Update bot message content
        setHistoryMessages([...history, { ...botMessage }]) // Need to spread to trigger re-render
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector(
          '[data-radix-scroll-area-viewport]',
        ) as HTMLDivElement
        if (scrollContainer) {
          setTimeout(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight
          }, 100) // Small delay to ensure content is rendered
        }
      }
    }

    scrollToBottom()
  }, [historyMessages])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-center">
          <MessageCircle className="h-6 w-6 text-pink-500" />
          <span className="ml-2 text-lg">Grog Chat</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
          {historyMessages.map((message, index) => (
            <div
              key={index}
              className={`mb-4 flex ${!isBotMessage(message) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start gap-2.5 ${
                  !isBotMessage(message) ? 'flex-row-reverse' : ''
                }`}
              >
                <Avatar className={!isBotMessage(message) ? 'bg-blue-500' : 'bg-gray-300'}>
                  <AvatarFallback>{!isBotMessage(message) ? 'User' : 'Bot'}</AvatarFallback>
                </Avatar>
                <div
                  className={`rounded-lg p-3 ${
                    !isBotMessage(message) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={messages}
            onChange={(e) => setMessages(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <SendHorizontal className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
