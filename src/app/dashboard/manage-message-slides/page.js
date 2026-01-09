'use client'

import React, { useState, useEffect } from 'react'
import { Trash2, Edit2, Plus } from 'lucide-react'

export default function ManageMessageSlides() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingMessage, setEditingMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/message-slides')
      const data = await response.json()
      if (data.success) {
        setMessages(data.data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMessage = async () => {
    if (!newMessage.trim()) {
      alert('Please enter a message')
      return
    }

    try {
      const response = await fetch('/api/dashboard/message-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage.trim() }),
      })
      const data = await response.json()
      if (data.success) {
        setMessages([...messages, data.data])
        setNewMessage('')
        showSuccessMessage('Message added successfully!')
      }
    } catch (error) {
      console.error('Error adding message:', error)
      alert('Error adding message')
    }
  }

  const updateMessage = async (id) => {
    if (!editingMessage.trim()) {
      alert('Please enter a message')
      return
    }

    try {
      const response = await fetch(`/api/dashboard/message-slides/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: editingMessage.trim() }),
      })
      const data = await response.json()
      if (data.success) {
        setMessages(messages.map((msg) => (msg._id === id ? data.data : msg)))
        setEditingId(null)
        setEditingMessage('')
        showSuccessMessage('Message updated successfully!')
      }
    } catch (error) {
      console.error('Error updating message:', error)
      alert('Error updating message')
    }
  }

  const deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      const response = await fetch(`/api/dashboard/message-slides/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        setMessages(messages.filter((msg) => msg._id !== id))
        showSuccessMessage('Message deleted successfully!')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Error deleting message')
    }
  }

  const toggleActive = async (id, currentStatus) => {
    try {
      const message = messages.find((msg) => msg._id === id)
      const response = await fetch(`/api/dashboard/message-slides/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus, message: message.message }),
      })
      const data = await response.json()
      if (data.success) {
        setMessages(messages.map((msg) => (msg._id === id ? data.data : msg)))
        showSuccessMessage(
          currentStatus ? 'Message deactivated!' : 'Message activated!'
        )
      }
    } catch (error) {
      console.error('Error toggling message:', error)
      alert('Error updating message')
    }
  }

  const showSuccessMessage = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-red-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Message Slides</h1>
          <p className="text-gray-600 mt-2">
            Add and edit the messages that appear in the sliding banner on your homepage
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        {/* Add New Message */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={20} /> Add New Message
          </h2>
          <div className="flex gap-3">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Enter your message here (max 300 characters)"
              maxLength="300"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              rows="2"
            />
            <button
              onClick={addMessage}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {newMessage.length}/300 characters
          </p>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            All Messages ({messages.length})
          </h2>

          {messages.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-600">
              No messages yet. Add your first message above!
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                className={`bg-white rounded-lg shadow-md p-6 transition-all ${
                  !msg.isActive ? 'opacity-50' : ''
                }`}
              >
                {editingId === msg._id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editingMessage}
                      onChange={(e) => setEditingMessage(e.target.value)}
                      maxLength="300"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      rows="2"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => updateMessage(msg._id)}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-gray-900 text-lg">{msg.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingId(msg._id)
                          setEditingMessage(msg.message)
                        }}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Edit message"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => toggleActive(msg._id, msg.isActive)}
                        className={`font-semibold text-sm py-1 px-3 rounded ${
                          msg.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        } transition-colors`}
                        title={msg.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {msg.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        onClick={() => deleteMessage(msg._id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Delete message"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

