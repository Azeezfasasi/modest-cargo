'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { Trash2, Eye, Reply, Search, Filter, ChevronLeft, ChevronRight, X, CheckCircle, FileText, Download, MapPin, Package } from 'lucide-react'
import { Commet } from "react-loading-indicators"

const MyAssignedQuotes = () => {
	const { user } = useAuth()
	const [quotes, setQuotes] = useState([])
	const [filteredQuotes, setFilteredQuotes] = useState([])
	const [loading, setLoading] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [searchQuery, setSearchQuery] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [showViewModal, setShowViewModal] = useState(false)
	const [showReplyModal, setShowReplyModal] = useState(false)
	const [showStatusModal, setShowStatusModal] = useState(false)
	const [showWaybillModal, setShowWaybillModal] = useState(false)
	const [selectedQuote, setSelectedQuote] = useState(null)
	const [waybillData, setWaybillData] = useState(null)
	const [loadingWaybill, setLoadingWaybill] = useState(false)
	const [replyText, setReplyText] = useState('')
	const [replyEmail, setReplyEmail] = useState('')
	const [newStatus, setNewStatus] = useState('')
	const [shipmentStatuses, setShipmentStatuses] = useState([])

	const quotesPerPage = 10

	useEffect(() => {
		loadQuotes()
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

	const loadQuotes = async () => {
		setLoading(true)
		try {
			const res = await fetch('/api/quote')
			const data = await res.json()
			if (data.success) {
				// Filter quotes assigned to current user and exclude delivered shipments
				const myQuotes = data.quotes.filter(quote => 
					quote.assignedTo && quote.assignedTo._id === user?._id && quote.status !== 'Delivered'
				)
				setQuotes(myQuotes)
				setFilteredQuotes(applyFilters(myQuotes, '', 'all'))
				setSearchQuery('')
				setStatusFilter('all')
				setCurrentPage(1)
			} else {
				setQuotes([])
				setFilteredQuotes([])
			}
		} catch (error) {
			console.error('Failed to load quotes:', error)
			setQuotes([])
			setFilteredQuotes([])
		} finally {
			setLoading(false)
		}
	}

	const applyFilters = useCallback((data, search, status) => {
		let filtered = data

		// Search filter
		if (search.trim()) {
			filtered = filtered.filter((quote) => {
				const searchStr = search.toLowerCase()
				return (
					(quote.fullName || quote.name || '').toLowerCase().includes(searchStr) ||
					quote.email.toLowerCase().includes(searchStr) ||
					(quote.company || '').toLowerCase().includes(searchStr) ||
					(quote.serviceType || quote.service || '').toLowerCase().includes(searchStr) ||
					(quote.pickupLocation || '').toLowerCase().includes(searchStr) ||
					(quote.deliveryLocation || '').toLowerCase().includes(searchStr) ||
					(quote.description || quote.message || '').toLowerCase().includes(searchStr)
				)
			})
		}

		// Status filter
		if (status !== 'all') {
			filtered = filtered.filter((quote) => quote.status === status)
		}

		// Sort by date (newest first)
		filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
		return filtered
	}, [])

	const handleSearch = (e) => {
		const value = e.target.value
		setSearchQuery(value)
		setFilteredQuotes(applyFilters(quotes, value, statusFilter))
		setCurrentPage(1)
	}

	const handleStatusFilter = (status) => {
		setStatusFilter(status)
		setFilteredQuotes(applyFilters(quotes, searchQuery, status))
		setCurrentPage(1)
	}

	const clearFilters = () => {
		setSearchQuery('')
		setStatusFilter('all')
		setFilteredQuotes(applyFilters(quotes, '', 'all'))
		setCurrentPage(1)
	}

	const handleView = (quote) => {
		setSelectedQuote(quote)
		setShowViewModal(true)
	}

	const handleReplyClick = (quote) => {
		setSelectedQuote(quote)
		setReplyEmail(quote.email)
		setReplyText('')
		setShowReplyModal(true)
	}

	const handleSubmitReply = async () => {
		if (!replyText.trim()) {
			alert('Please enter a response or quote.')
			return
		}
		try {
			if (!user || !user._id) {
				alert('You must be logged in to reply.')
				return
			}
			const res = await fetch(`/api/quote/${selectedQuote._id}`, {
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
				loadQuotes()
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
			const res = await fetch(`/api/quote/${selectedQuote._id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			})
			const data = await res.json()
			if (data.success) {
				loadQuotes()
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

	const handleViewWaybill = async (quote) => {
		setSelectedQuote(quote)
		setShowWaybillModal(true)
		setLoadingWaybill(true)
		try {
			const res = await fetch(`/api/quote/${quote._id}/waybill`)
			const data = await res.json()
			if (data.success) {
				setWaybillData(data.data)
			} else {
				alert(data.message || 'Failed to load waybill')
				setShowWaybillModal(false)
			}
		} catch (error) {
			console.error('Failed to load waybill:', error)
			alert('Failed to load waybill')
			setShowWaybillModal(false)
		} finally {
			setLoadingWaybill(false)
		}
	}

	const handleDownloadWaybill = async () => {
		if (!selectedQuote) return
		try {
			const res = await fetch(`/api/quote/${selectedQuote._id}/waybill/download`)
			if (!res.ok) throw new Error('Failed to download waybill')
			
			const blob = await res.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `waybill-${selectedQuote._id}-${new Date().getTime()}.pdf`
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			document.body.removeChild(a)
		} catch (error) {
			console.error('Failed to download waybill:', error)
			alert('Failed to download waybill')
		}
	}

	const totalPages = Math.ceil(filteredQuotes.length / quotesPerPage)
	const startIndex = (currentPage - 1) * quotesPerPage
	const endIndex = startIndex + quotesPerPage
	const currentQuotes = filteredQuotes.slice(startIndex, endIndex)

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
				<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">My Assigned Quotes</h1>

				{/* Search and Filters */}
				<div className="bg-white rounded-lg shadow-sm p-2 md:p-6 mb-6">
					<div className="flex flex-col gap-4">
						{/* Search Bar */}
						<div className="relative">
							<Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
							<input
								type="text"
								placeholder="Search by name, email, company, service, or location..."
								value={searchQuery}
								onChange={handleSearch}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
							/>
						</div>

						{/* Filters and Clear Button */}
						<div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
							<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-start sm:items-center">
								<label className="text-sm font-medium text-gray-700">Filter by Status:</label>
								<select
									value={statusFilter}
									onChange={(e) => handleStatusFilter(e.target.value)}
									className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white text-gray-900 font-medium cursor-pointer w-full sm:w-auto"
								>
									<option value="all">All ({quotes.length})</option>
									{shipmentStatuses.map((status) => (
										<option key={status._id} value={status.name}>
											{status.emoji} {status.name} ({quotes.filter((q) => q.status === status.name).length})
										</option>
									))}
								</select>
							</div>

							{(searchQuery || statusFilter !== 'all') && (
								<button
									onClick={clearFilters}
									className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition"
								>
									Clear Filters
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Results Summary */}
				<div className="mb-4 text-sm text-gray-600">
					Showing {currentQuotes.length > 0 ? startIndex + 1 : 0} to{' '}
					{Math.min(endIndex, filteredQuotes.length)} of {filteredQuotes.length} quotes
				</div>

				{/* Quotes Table */}
				{filteredQuotes.length === 0 ? (
					<div className="bg-white rounded-lg shadow-sm p-12 text-center">
						<Filter className="mx-auto w-12 h-12 text-gray-400 mb-4" />
						<p className="text-gray-600 text-lg font-medium">No quotes found</p>
						<p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 border-b border-gray-200">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Tracking Number
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Customer Name
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Service
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Date
										</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{currentQuotes.map((quote, idx) => (
										<tr key={quote._id || quote.id || idx} className="hover:bg-gray-50 transition">
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="font-mono text-orange-600 font-semibold">
													{quote.trackingNumber || 'PENDING'}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="font-medium text-gray-900">{quote.fullName || quote.name}</div>
												<div className="text-sm text-gray-500">{quote.email}</div>
											</td>
											<td className="px-6 py-4">
												<span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
													{quote.serviceType || quote.service}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quote.status)}`}>
													{getStatusDisplay(quote.status)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
												{formatDate(quote.createdAt)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center justify-center flex-wrap gap-2">
													<button
														onClick={() => handleView(quote)}
														className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
														title="View"
													>
														<Eye className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleViewWaybill(quote)}
														className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
														title="View Waybill"
													>
														<FileText className="w-4 h-4" />
													</button>
													<button
														onClick={() => {
															setSelectedQuote(quote)
															setNewStatus(quote.status)
															setShowStatusModal(true)
														}}
														className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
														title="Change Status"
													>
														<CheckCircle className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleReplyClick(quote)}
														className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
														title="Reply"
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
													? 'bg-orange-600 text-white'
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
				{showViewModal && selectedQuote && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
							<div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
								<h3 className="text-lg font-semibold text-gray-900">View Quote Details</h3>
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
										<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
										<p className="text-gray-900">{selectedQuote.fullName || selectedQuote.name}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
										<p className="text-gray-900">{selectedQuote.company}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
										<p className="text-gray-900">{selectedQuote.email}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
										<p className="text-gray-900">{selectedQuote.phone}</p>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
										<p className="text-gray-900">{selectedQuote.pickupLocation || 'N/A'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
										<p className="text-gray-900">{selectedQuote.deliveryLocation || 'N/A'}</p>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
										<p className="text-gray-900">{selectedQuote.serviceType || selectedQuote.service}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type</label>
										<p className="text-gray-900">{selectedQuote.cargoType || 'N/A'}</p>
									</div>
								</div>

								<div className="grid grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
										<p className="text-gray-900">{selectedQuote.weight || 'N/A'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
										<p className="text-gray-900">{selectedQuote.quantity || 'N/A'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Preferred Delivery</label>
										<p className="text-gray-900">{selectedQuote.preferredDeliveryDate ? new Date(selectedQuote.preferredDeliveryDate).toLocaleDateString() : 'N/A'}</p>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
									<p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">{selectedQuote.description || selectedQuote.message || 'N/A'}</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
										<span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedQuote.status)}`}>
											{getStatusDisplay(selectedQuote.status)}
										</span>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
										<p className="font-mono font-semibold text-orange-600">{selectedQuote.trackingNumber || 'Not yet assigned'}</p>
									</div>
									<div className="col-span-2">
										<label className="block text-sm font-medium text-gray-700 mb-1">Submitted On</label>
										<p className="text-gray-900">{formatDate(selectedQuote.createdAt)}</p>
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
										handleReplyClick(selectedQuote)
									}}
									className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition flex items-center gap-2"
								>
									<Reply className="w-4 h-4" />
									Reply
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Reply Modal */}
				{showReplyModal && selectedQuote && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
							<div className="p-6 border-b border-gray-200 flex justify-between items-center">
								<h3 className="text-lg font-semibold text-gray-900">Reply to Quote Request</h3>
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
									<label className="block text-sm font-medium text-gray-700 mb-2">Customer Request</label>
									<p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">Service: {selectedQuote.serviceType || selectedQuote.service}</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Your Response/Quote *</label>
									<textarea
										value={replyText}
										onChange={(e) => setReplyText(e.target.value)}
										rows="6"
										placeholder="Type your quote or response here. Include pricing, timeline, scope of work, etc."
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
									Send Quote
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Status Change Modal */}
				{showStatusModal && selectedQuote && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-md w-full">
							<div className="p-6 border-b border-gray-200 flex justify-between items-center">
								<h3 className="text-lg font-semibold text-gray-900">Change Quote Status</h3>
								<button
									onClick={() => setShowStatusModal(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							<div className="p-6 space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Quote From</label>
									<p className="text-gray-900">{selectedQuote.fullName || selectedQuote.name} ({selectedQuote.company})</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
									<span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedQuote.status)}`}>
										{getStatusDisplay(selectedQuote.status)}
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

				{/* Waybill Modal */}
				{showWaybillModal && selectedQuote && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
							<div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
								<h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
									<FileText className="w-5 h-5 text-orange-600" />
									Shipment Waybill
								</h3>
								<button
									onClick={() => setShowWaybillModal(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							{loadingWaybill ? (
								<div className="p-12 text-center">
									<Commet color="#155dfc" size="medium" text="Loading waybill..." textColor="#155dfc" />
								</div>
							) : waybillData ? (
								<div className="flex-1 overflow-y-auto p-6">
									{/* Waybill Header */}
									<div className="mb-8 pb-6 border-b border-gray-200">
										<div className="flex justify-between items-start mb-4">
											<div>
												<h2 className="text-2xl font-bold text-gray-900">MODEST CARGO</h2>
												<p className="text-gray-600">International Shipping & Logistics</p>
											</div>
											<div className="text-right">
												<p className="text-sm font-semibold text-gray-900">Waybill #: {waybillData.waybillNumber || selectedQuote._id}</p>
												<p className="text-sm text-gray-600">Date: {new Date(waybillData.date || selectedQuote.createdAt).toLocaleDateString()}</p>
											</div>
										</div>
									</div>

									{/* Sender & Receiver Info */}
									<div className="grid grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-200">
										<div>
											<h4 className="font-semibold text-gray-900 mb-3">Shipper Information</h4>
											<div className="space-y-1 text-sm text-gray-700">
												<p><strong>Name:</strong> {waybillData.shipperName || selectedQuote.fullName}</p>
												<p><strong>Company:</strong> {waybillData.shipperCompany || selectedQuote.company}</p>
												<p><strong>Email:</strong> {waybillData.shipperEmail || selectedQuote.email}</p>
												<p><strong>Phone:</strong> {waybillData.shipperPhone || selectedQuote.phone}</p>
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900 mb-3">Shipment Details</h4>
											<div className="space-y-1 text-sm text-gray-700">
												<p><strong>Service:</strong> {waybillData.serviceType || selectedQuote.serviceType}</p>
												<p><strong>Cargo Type:</strong> {waybillData.cargoType || selectedQuote.cargoType}</p>
												<p><strong>Weight:</strong> {waybillData.weight || selectedQuote.weight} kg</p>
												<p><strong>Quantity:</strong> {waybillData.quantity || selectedQuote.quantity} units</p>
											</div>
										</div>
									</div>

									{/* Location Info */}
									<div className="grid grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-200">
										<div>
											<h4 className="font-semibold text-gray-900 mb-3">Pickup Location</h4>
											<p className="text-sm text-gray-700">{waybillData.pickupLocation || selectedQuote.pickupLocation}</p>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900 mb-3">Delivery Location</h4>
											<p className="text-sm text-gray-700">{waybillData.deliveryLocation || selectedQuote.deliveryLocation}</p>
										</div>
									</div>

									{/* Description */}
									{(waybillData.description || selectedQuote.description) && (
										<div className="mb-8 pb-6 border-b border-gray-200">
											<h4 className="font-semibold text-gray-900 mb-2">Description of Goods</h4>
											<p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{waybillData.description || selectedQuote.description}</p>
										</div>
									)}

									{/* Status Info */}
									<div className="grid grid-cols-2 gap-6 mb-8 pb-6 border-b border-gray-200">
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">Status</h4>
											<span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedQuote.status)}`}>
												{getStatusDisplay(selectedQuote.status)}
											</span>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">Tracking Number</h4>
											<p className="font-mono font-semibold text-orange-600 text-sm">{waybillData.trackingNumber || selectedQuote.trackingNumber || 'PENDING'}</p>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900 mb-2">Preferred Delivery Date</h4>
											<p className="text-sm text-gray-700">{selectedQuote.preferredDeliveryDate ? new Date(selectedQuote.preferredDeliveryDate).toLocaleDateString() : 'Not specified'}</p>
										</div>
									</div>

									{/* Footer */}
									<div className="mt-8 pt-6 border-t border-gray-200">
										<p className="text-xs text-gray-500 text-center">
											This is an official Modest Cargo waybill. Please keep for your records.
										</p>
									</div>
								</div>
							) : (
								<div className="p-12 text-center text-gray-600">
									<p>No waybill data available</p>
								</div>
							)}

							<div className="p-6 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-gray-50">
								<button
									onClick={() => setShowWaybillModal(false)}
									className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
								>
									Close
								</button>
								<button
									onClick={handleDownloadWaybill}
									className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition flex items-center gap-2"
								>
									<Download className="w-4 h-4" />
									Download PDF
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default MyAssignedQuotes
