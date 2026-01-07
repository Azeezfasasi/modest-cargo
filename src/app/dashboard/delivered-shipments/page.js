'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { Eye, Search, Filter, ChevronLeft, ChevronRight, X, CheckCircle, Reply } from 'lucide-react'
import { Commet } from "react-loading-indicators"

const DeliveredShipments = () => {
	const { user } = useAuth()
	const [shipments, setShipments] = useState([])
	const [filteredShipments, setFilteredShipments] = useState([])
	const [loading, setLoading] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [searchQuery, setSearchQuery] = useState('')
	const [showViewModal, setShowViewModal] = useState(false)
	const [showReplyModal, setShowReplyModal] = useState(false)
	const [selectedShipment, setSelectedShipment] = useState(null)
	const [replyText, setReplyText] = useState('')
	const [replyEmail, setReplyEmail] = useState('')
	const [shipmentStatuses, setShipmentStatuses] = useState([])
	const [showStatusModal, setShowStatusModal] = useState(false)
	const [newStatus, setNewStatus] = useState('')

	const shipmentsPerPage = 10

	useEffect(() => {
		loadShipments()
		loadShipmentStatuses()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const loadShipmentStatuses = async () => {
		try {
			const res = await fetch('/api/shipment-status')
			const data = await res.json()
			if (data.success) {
				setShipmentStatuses(data.statuses)
			}
		} catch (error) {
			console.error('Failed to load shipment statuses:', error)
		}
	}

	const loadShipments = async () => {
		setLoading(true)
		try {
			const res = await fetch('/api/quote')
			const data = await res.json()
			if (data.success) {
				// Log all statuses to see what we're working with
				console.log('All quotes:', data.quotes)
				console.log('Unique statuses:', [...new Set(data.quotes.map(q => q.status))])
				
				// Filter only delivered shipments (case-insensitive)
				const delivered = data.quotes.filter(quote => quote.status && quote.status.toLowerCase() === 'delivered')
				console.log('Filtered delivered shipments:', delivered)
				
				setShipments(delivered)
				setFilteredShipments(applyFilters(delivered, ''))
				setSearchQuery('')
				setCurrentPage(1)
			} else {
				setShipments([])
				setFilteredShipments([])
			}
		} catch (error) {
			console.error('Failed to load shipments:', error)
			setShipments([])
			setFilteredShipments([])
		} finally {
			setLoading(false)
		}
	}

	const applyFilters = useCallback((data, search) => {
		let filtered = data

		// Search filter
		if (search.trim()) {
			filtered = filtered.filter((shipment) => {
				const searchStr = search.toLowerCase()
				return (
					(shipment.fullName || shipment.name || '').toLowerCase().includes(searchStr) ||
					shipment.email.toLowerCase().includes(searchStr) ||
					(shipment.company || '').toLowerCase().includes(searchStr) ||
					(shipment.serviceType || shipment.service || '').toLowerCase().includes(searchStr) ||
					(shipment.pickupLocation || '').toLowerCase().includes(searchStr) ||
					(shipment.deliveryLocation || '').toLowerCase().includes(searchStr) ||
					(shipment.description || shipment.message || '').toLowerCase().includes(searchStr)
				)
			})
		}

		// Sort by date (newest first)
		filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		return filtered
	}, [])

	const handleSearch = (e) => {
		const value = e.target.value
		setSearchQuery(value)
		setFilteredShipments(applyFilters(shipments, value))
		setCurrentPage(1)
	}

	const clearFilters = () => {
		setSearchQuery('')
		setFilteredShipments(applyFilters(shipments, ''))
		setCurrentPage(1)
	}

	const handleView = (shipment) => {
		setSelectedShipment(shipment)
		setShowViewModal(true)
	}

	const handleReplyClick = (shipment) => {
		setSelectedShipment(shipment)
		setReplyEmail(shipment.email)
		setReplyText('')
		setShowReplyModal(true)
	}

	const handleSubmitReply = async () => {
		if (!replyText.trim()) {
			alert('Please enter a response.')
			return
		}
		try {
			if (!user || !user._id) {
				alert('You must be logged in to reply.')
				return
			}
			const res = await fetch(`/api/quote/${selectedShipment._id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: replyText, senderId: user._id }),
			})
			const data = await res.json()
			if (data.success) {
				setShowReplyModal(false)
				setReplyText('')
				setReplyEmail('')
				alert('Reply sent successfully!')
				loadShipments()
			} else {
				alert(data.message || 'Failed to send reply.')
			}
		} catch (error) {
			console.error('Failed to send reply:', error)
			alert('Failed to send reply.')
		}
	}

	const handleChangeStatus = async () => {
		if (!newStatus) {
			alert('Please select a status')
			return
		}
		try {
			const res = await fetch(`/api/quote/${selectedShipment._id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			})
			const data = await res.json()
			if (data.success) {
				loadShipments()
				setShowStatusModal(false)
				alert('Status updated successfully!')
			} else {
				alert(data.message || 'Failed to update status')
			}
		} catch (error) {
			console.error('Failed to update status:', error)
			alert('Failed to update status')
		}
	}

	const totalPages = Math.ceil(filteredShipments.length / shipmentsPerPage)
	const startIndex = (currentPage - 1) * shipmentsPerPage
	const endIndex = startIndex + shipmentsPerPage
	const currentShipments = filteredShipments.slice(startIndex, endIndex)

	const getStatusColor = (statusName) => {
		const statusObj = shipmentStatuses.find(s => s.name === statusName)
		if (!statusObj) return 'bg-gray-100 text-gray-800'

		const colorMap = {
			'gray': 'bg-gray-100 text-gray-800',
			'yellow': 'bg-yellow-100 text-yellow-800',
			'blue': 'bg-blue-100 text-blue-800',
			'green': 'bg-green-100 text-green-800',
			'purple': 'bg-purple-100 text-purple-800',
			'indigo': 'bg-indigo-100 text-indigo-800',
			'emerald': 'bg-emerald-100 text-emerald-800',
			'red': 'bg-red-100 text-red-800',
			'orange': 'bg-orange-100 text-orange-800',
		}
		return colorMap[statusObj.color] || 'bg-gray-100 text-gray-800'
	}

	const getStatusDisplay = (statusName) => {
		if (!statusName) return 'N/A'
		const statusObj = shipmentStatuses.find(s => s.name === statusName)
		if (statusObj) {
			return `${statusObj.emoji} ${statusObj.name}`
		}
		return statusName
	}

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	if (loading) {
		return (
			<div className="flex justify-center items-center py-12">
				<p className="text-gray-600"><Commet color="#155dfc" size="medium" text="Loading" textColor="#155dfc" /></p>
			</div>
		)
	}

	return (
		<div className="bg-gray-50 py-2 md:py-8 px-0 sm:px-6 lg:px-8 mx-auto">
			<div className="w-[330px] md:w-full md:max-w-7xl mx-auto">
				<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Delivered Shipments</h1>

				{/* Search Bar */}
				<div className="bg-white rounded-lg shadow-sm p-2 md:p-6 mb-6">
					<div className="flex flex-col gap-4">
						{/* Search Input */}
						<div className="relative">
							<Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
							<input
								type="text"
								placeholder="Search by customer name, email, company, service, or location..."
								value={searchQuery}
								onChange={handleSearch}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
							/>
						</div>

						{/* Clear Filters Button */}
						{searchQuery && (
							<button
								onClick={clearFilters}
								className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition w-fit"
							>
								Clear Search
							</button>
						)}
					</div>
				</div>

				{/* Results Summary */}
				<div className="mb-4 text-sm text-gray-600">
					Showing {currentShipments.length > 0 ? startIndex + 1 : 0} to{' '}
					{Math.min(endIndex, filteredShipments.length)} of {filteredShipments.length} delivered shipments
				</div>

				{/* Shipments Table */}
				{filteredShipments.length === 0 ? (
					<div className="bg-white rounded-lg shadow-sm p-12 text-center">
						<Filter className="mx-auto w-12 h-12 text-gray-400 mb-4" />
						<p className="text-gray-600 text-lg font-medium">No delivered shipments found</p>
						<p className="text-gray-500 mt-2">Try adjusting your search</p>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 border-b border-gray-200">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Customer Name
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Service
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Route
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Delivered On
										</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{currentShipments.map((shipment, idx) => (
										<tr key={shipment._id || shipment.id || idx} className="hover:bg-gray-50 transition">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="font-medium text-gray-900">{shipment.fullName || shipment.name}</div>
												<div className="text-sm text-gray-500">{shipment.email}</div>
											</td>
											<td className="px-6 py-4">
												<span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
													{shipment.serviceType || shipment.service}
												</span>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm text-gray-900">
													<div className="font-medium">{shipment.pickupLocation || 'N/A'}</div>
													<div className="text-gray-500">→ {shipment.deliveryLocation || 'N/A'}</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
												{formatDate(shipment.createdAt)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center justify-center gap-2">
													<button
														onClick={() => handleView(shipment)}
														className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
														title="View Details"
													>
														<Eye className="w-4 h-4" />
													</button>
													<button
														onClick={() => {
															setSelectedShipment(shipment)
															setNewStatus(shipment.status)
															setShowStatusModal(true)
														}}
														className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
														title="Change Status"
													>
														<CheckCircle className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleReplyClick(shipment)}
														className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
														title="Send Message"
													>
														<Reply className="w-4 h-4" />
													</button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{totalPages > 1 && (
							<div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
								<p className="text-sm text-gray-600">Page {currentPage} of {totalPages}</p>
								<div className="flex gap-2">
									<button
										onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
										disabled={currentPage === 1}
										className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
									>
										<ChevronLeft className="w-5 h-5" />
									</button>
									{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
										<button
											key={page}
											onClick={() => setCurrentPage(page)}
											className={`px-3 py-1 rounded-lg font-medium transition ${
												currentPage === page
													? 'bg-green-600 text-white'
													: 'border border-gray-300 text-gray-700 hover:bg-gray-100'
											}`}
										>
											{page}
										</button>
									))}
									<button
										onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
										disabled={currentPage === totalPages}
										className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
									>
										<ChevronRight className="w-5 h-5" />
									</button>
								</div>
							</div>
						)}
					</div>
				)}

				{/* View Modal */}
				{showViewModal && selectedShipment && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
							<div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
								<h3 className="text-lg font-semibold text-gray-900">Shipment Details</h3>
								<button
									onClick={() => setShowViewModal(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							<div className="p-6 space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
										<p className="text-gray-900">{selectedShipment.fullName || selectedShipment.name}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
										<p className="text-gray-900">{selectedShipment.company || 'N/A'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
										<p className="text-gray-900">{selectedShipment.email}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
										<p className="text-gray-900">{selectedShipment.phone || 'N/A'}</p>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
										<p className="text-gray-900">{selectedShipment.pickupLocation || 'N/A'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
										<p className="text-gray-900">{selectedShipment.deliveryLocation || 'N/A'}</p>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
										<p className="text-gray-900">{selectedShipment.serviceType || selectedShipment.service}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type</label>
										<p className="text-gray-900">{selectedShipment.cargoType || 'N/A'}</p>
									</div>
								</div>

								<div className="grid grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
										<p className="text-gray-900">{selectedShipment.weight || 'N/A'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
										<p className="text-gray-900">{selectedShipment.quantity || 'N/A'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Preferred Delivery</label>
										<p className="text-gray-900">{selectedShipment.preferredDeliveryDate ? new Date(selectedShipment.preferredDeliveryDate).toLocaleDateString() : 'N/A'}</p>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Shipment Details</label>
									<p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">{selectedShipment.description || selectedShipment.message || 'N/A'}</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
										<span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedShipment.status)}`}>
											{getStatusDisplay(selectedShipment.status)}
										</span>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Submitted On</label>
										<p className="text-gray-900">{formatDate(selectedShipment.createdAt)}</p>
									</div>
								</div>
							</div>

							<div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-gray-50">
								<button
									onClick={() => setShowViewModal(false)}
									className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
								>
									Close
								</button>
								<button
									onClick={() => {
										setShowViewModal(false)
										handleReplyClick(selectedShipment)
									}}
									className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center gap-2"
								>
									<Reply className="w-4 h-4" />
									Send Message
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Reply Modal */}
				{showReplyModal && selectedShipment && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
							<div className="p-6 border-b border-gray-200 flex justify-between items-center">
								<h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
								<button
									onClick={() => setShowReplyModal(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							<div className="p-6 space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">From</label>
									<p className="text-gray-900">info@modestcargo.com</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">To</label>
									<p className="text-gray-900">{replyEmail}</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Shipment Reference</label>
									<p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">{selectedShipment.pickupLocation} → {selectedShipment.deliveryLocation}</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
									<textarea
										value={replyText}
										onChange={(e) => setReplyText(e.target.value)}
										rows="6"
										placeholder="Type your message here. You can include delivery confirmation, tracking information, or any follow-up details..."
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none"
									/>
									<p className="text-xs text-gray-500 mt-1">{replyText.length} characters</p>
								</div>
							</div>

							<div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
								<button
									onClick={() => setShowReplyModal(false)}
									className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
								>
									Cancel
								</button>
								<button
									onClick={handleSubmitReply}
									className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center gap-2"
								>
									<Reply className="w-4 h-4" />
									Send Message
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Status Change Modal */}
				{showStatusModal && selectedShipment && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-md w-full">
							<div className="p-6 border-b border-gray-200 flex justify-between items-center">
								<h3 className="text-lg font-semibold text-gray-900">Change Shipment Status</h3>
								<button
									onClick={() => setShowStatusModal(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							<div className="p-6 space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Shipment From</label>
									<p className="text-gray-900">{selectedShipment.fullName || selectedShipment.name} ({selectedShipment.company})</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
									<span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedShipment.status)}`}>
										{getStatusDisplay(selectedShipment.status)}
									</span>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">New Status *</label>
									<select
										value={newStatus}
										onChange={(e) => setNewStatus(e.target.value)}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
									>
										<option value="">Select a status</option>
										{shipmentStatuses.map((status) => (
											<option key={status._id} value={status.name}>
												{status.emoji} {status.name}
											</option>
										))}
									</select>
								</div>
							</div>

							<div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
								<button
									onClick={() => setShowStatusModal(false)}
									className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
								>
									Cancel
								</button>
								<button
									onClick={handleChangeStatus}
									className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition flex items-center gap-2"
								>
									<CheckCircle className="w-4 h-4" />
									Update Status
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default DeliveredShipments
