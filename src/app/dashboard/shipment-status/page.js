'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X } from 'lucide-react'

export default function ShipmentStatus() {
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingStatus, setEditingStatus] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    color: 'gray',
    emoji: '📍',
    description: '',
  })

  const colorOptions = [
    { value: 'gray', label: 'Gray', bg: 'bg-gray-100', text: 'text-gray-800' },
    { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
    { value: 'blue', label: 'Blue', bg: 'bg-blue-100', text: 'text-blue-800' },
    { value: 'green', label: 'Green', bg: 'bg-green-100', text: 'text-green-800' },
    { value: 'purple', label: 'Purple', bg: 'bg-purple-100', text: 'text-purple-800' },
    { value: 'indigo', label: 'Indigo', bg: 'bg-indigo-100', text: 'text-indigo-800' },
    { value: 'emerald', label: 'Emerald', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    { value: 'red', label: 'Red', bg: 'bg-red-100', text: 'text-red-800' },
    { value: 'orange', label: 'Orange', bg: 'bg-orange-100', text: 'text-orange-800' },
  ]

  const emojiOptions = ['📍', '🚚', '📦', '✓', '✗', '⏳', '⏸️', '⚙️', '🌐', '💬', '🔄', '📋']

  const getColorStyles = (color) => {
    const option = colorOptions.find(opt => opt.value === color)
    return option || colorOptions[0]
  }

  // Load statuses
  useEffect(() => {
    loadStatuses()
  }, [])

  const loadStatuses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/shipment-status')
      const data = await res.json()
      if (data.success) {
        setStatuses(data.statuses)
      }
    } catch (error) {
      console.error('Failed to load statuses:', error)
      alert('Failed to load statuses')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (status = null) => {
    if (status) {
      setEditingStatus(status)
      setFormData({
        name: status.name,
        color: status.color,
        emoji: status.emoji,
        description: status.description,
      })
    } else {
      setEditingStatus(null)
      setFormData({
        name: '',
        color: 'gray',
        emoji: '📍',
        description: '',
      })
    }
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Status name is required')
      return
    }

    try {
      const method = editingStatus ? 'PATCH' : 'POST'
      const url = editingStatus
        ? `/api/shipment-status/${editingStatus._id}`
        : '/api/shipment-status'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      if (data.success) {
        loadStatuses()
        setShowModal(false)
        alert(editingStatus ? 'Status updated successfully!' : 'Status created successfully!')
      } else {
        alert(data.message || 'Failed to save status')
      }
    } catch (error) {
      console.error('Failed to save status:', error)
      alert('Failed to save status')
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/shipment-status/${selectedStatus._id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        loadStatuses()
        setShowDeleteModal(false)
        alert('Status deleted successfully!')
      } else {
        alert(data.message || 'Failed to delete status')
      }
    } catch (error) {
      console.error('Failed to delete status:', error)
      alert('Failed to delete status')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-2 md:py-8 px-0 sm:px-6 lg:px-8 mx-auto">
      <div className="w-[330px] md:w-full md:max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6 md:gap-0 justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Shipment Statuses</h1>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium transition"
          >
            <Plus className="w-5 h-5" />
            Add Status
          </button>
        </div>

        {/* Statuses Grid */}
        {statuses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 text-lg font-medium">No statuses found</p>
            <p className="text-gray-500 mt-2">Create your first shipment status</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statuses.map((status) => {
              const colorStyle = getColorStyles(status.color)
              return (
                <div
                  key={status._id}
                  className={`${colorStyle.bg} border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{status.emoji}</span>
                      <div>
                        <h3 className={`text-lg font-bold ${colorStyle.text}`}>{status.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Created {new Date(status.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {!status.isActive && (
                      <span className="bg-red-200 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                        Inactive
                      </span>
                    )}
                  </div>

                  {status.description && (
                    <p className="text-sm text-gray-700 mb-3">{status.description}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal(status)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 font-medium transition text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStatus(status)
                        setShowDeleteModal(true)
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 font-medium transition text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full h-[400px] md:h-[600px] overflow-auto">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingStatus ? 'Edit Status' : 'Add New Status'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., In Transit, Delivered"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, emoji })}
                        className={`text-2xl p-2 rounded border-2 transition ${
                          formData.emoji === emoji
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {colorOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: option.value })}
                        className={`${option.bg} ${option.text} px-3 py-2 rounded border-2 font-medium text-sm transition ${
                          formData.color === option.value
                            ? 'border-gray-800'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description for this status"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <div
                    className={`${getColorStyles(formData.color).bg} ${getColorStyles(formData.color).text} px-4 py-2 rounded-lg inline-flex items-center gap-2 font-semibold`}
                  >
                    <span>{formData.emoji}</span>
                    <span>{formData.name || 'Status Name'}</span>
                  </div>
                </div>
              </form>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition"
                >
                  {editingStatus ? 'Update' : 'Create'} Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Delete Status
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete <strong>{selectedStatus.name}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-center gap-3 bg-gray-50">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
