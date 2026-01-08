'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext';
import { Trash2, Eye, Reply, Search, Filter, ChevronLeft, ChevronRight, X, CheckCircle, FileText, Download, MapPin, Package } from 'lucide-react'
import { Commet } from "react-loading-indicators";

const ManageQuoteRequests = () => {
				const { user } = useAuth();
			// Handle submit reply
			const handleSubmitReply = async () => {
				if (!replyText.trim()) {
					alert('Please enter a response or quote.');
					return;
				}
				try {
					if (!user || !user._id) {
						alert('You must be logged in as an admin or staff to reply.');
						return;
					}
					const res = await fetch(`/api/quote/${selectedRequest._id}`, {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ message: replyText, senderId: user._id }),
					});
					const data = await res.json();
					if (data.success) {
						setShowReplyModal(false);
						setReplyText("");
						setReplyEmail("");
						alert('Reply sent successfully!');
						loadRequests();
					} else {
						alert(data.message || 'Failed to send reply.');
					}
				} catch (error) {
					console.error('Failed to send reply:', error);
					alert('Failed to send reply.');
				}
			};
		// Handle view action
		const handleView = (request) => {
			setSelectedRequest(request);
			setShowViewModal(true);
		};

		// Handle reply action
		const handleReplyClick = (request) => {
			setSelectedRequest(request);
			setReplyEmail(request.email);
			setReplyText("");
			setShowReplyModal(true);
		};
	// Handle search
	const handleSearch = (e) => {
		const value = e.target.value;
		setSearchQuery(value);
		setFilteredRequests(applyFilters(requests, value, statusFilter));
		setCurrentPage(1);
	};

	// Handle status filter
	const handleStatusFilter = (status) => {
		setStatusFilter(status);
		setFilteredRequests(applyFilters(requests, searchQuery, status));
		setCurrentPage(1);
	};

	// Clear all filters
	const clearFilters = () => {
		setSearchQuery("");
		setStatusFilter("all");
		setFilteredRequests(applyFilters(requests, "", "all"));
		setCurrentPage(1);
	};
	const [requests, setRequests] = useState([])
	const [filteredRequests, setFilteredRequests] = useState([])
	const [loading, setLoading] = useState(false)
	const [currentPage, setCurrentPage] = useState(1)
	const [searchQuery, setSearchQuery] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [showViewModal, setShowViewModal] = useState(false)
	const [showReplyModal, setShowReplyModal] = useState(false)
	const [showStatusModal, setShowStatusModal] = useState(false)
	const [showDeleteModal, setShowDeleteModal] = useState(false)
	const [showAssignModal, setShowAssignModal] = useState(false)
	const [showWaybillModal, setShowWaybillModal] = useState(false)
	const [selectedRequest, setSelectedRequest] = useState(null)
	const [waybillData, setWaybillData] = useState(null)
	const [loadingWaybill, setLoadingWaybill] = useState(false)
	const [replyText, setReplyText] = useState('')
	const [replyEmail, setReplyEmail] = useState('')
	const [newStatus, setNewStatus] = useState('')
	const [assignedUserId, setAssignedUserId] = useState('')
	const [availableUsers, setAvailableUsers] = useState([])
	const [loadingUsers, setLoadingUsers] = useState(false)
	const [shipmentStatuses, setShipmentStatuses] = useState([])

	const requestsPerPage = 10

	// Load requests and shipment statuses from backend API
	useEffect(() => {
		loadRequests()
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

	const loadAvailableUsers = async () => {
		setLoadingUsers(true)
		try {
			const res = await fetch('/api/users?roles=admin,staff-member')
			const data = await res.json()
			console.log('Available users response:', data)
			if (data.success) {
				setAvailableUsers(data.users || [])
			}
		} catch (error) {
			console.error('Failed to load users:', error)
			setAvailableUsers([])
		} finally {
			setLoadingUsers(false)
		}
	}

	const loadRequests = async () => {
		setLoading(true)
		try {
			const res = await fetch('/api/quote')
			const data = await res.json()
			if (data.success) {
				// Exclude delivered shipments
				const nonDelivered = data.quotes.filter(quote => quote.status !== 'Delivered')
				setRequests(nonDelivered)
				setFilteredRequests(applyFilters(nonDelivered, '', 'all'));
				setSearchQuery('');
				setStatusFilter('all');
				setCurrentPage(1);
			} else {
				setRequests([])
				setFilteredRequests([]);
				setSearchQuery('');
				setStatusFilter('all');
				setCurrentPage(1);
			}
		} catch (error) {
			console.error('Failed to load requests:', error)
			setRequests([])
			setFilteredRequests([]);
			setSearchQuery('');
			setStatusFilter('all');
			setCurrentPage(1);
		} finally {
			setLoading(false)
		}
	}

	const applyFilters = useCallback((data, search, status) => {
		let filtered = data

		// Search filter
		if (search.trim()) {
			filtered = filtered.filter(
				(request) => {
					const searchStr = search.toLowerCase();
					return (
						(request.fullName || request.name || '').toLowerCase().includes(searchStr) ||
						request.email.toLowerCase().includes(searchStr) ||
						(request.company || '').toLowerCase().includes(searchStr) ||
						(request.serviceType || request.service || '').toLowerCase().includes(searchStr) ||
						(request.pickupLocation || '').toLowerCase().includes(searchStr) ||
						(request.deliveryLocation || '').toLowerCase().includes(searchStr) ||
						(request.description || request.message || '').toLowerCase().includes(searchStr) ||
						(request.trackingNumber || request.trackingNumber || '').toLowerCase().includes(searchStr)
					);
				}
			)
		}

		// Status filter
		if (status !== 'all') {
			filtered = filtered.filter((request) => request.status === status)
		}

		// Sort by date (newest first)
		filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		return filtered;
	}, []);

	// Change status
	const handleChangeStatus = async () => {
		if (!newStatus) {
			alert('Please select a status');
			return;
		}
		try {
			const res = await fetch(`/api/quote/${selectedRequest._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: newStatus }),
			});
			const data = await res.json();
			if (data.success) {
				loadRequests();
				setShowStatusModal(false);
				alert("Status updated successfully!");
			} else {
				alert(data.message || "Failed to update status");
			}
		} catch (error) {
			console.error("Failed to update status:", error);
			alert("Failed to update status");
		}
	};

	// Delete request
	const handleDelete = async () => {
		try {
			const res = await fetch(`/api/quote/${selectedRequest._id}`, {
				method: "DELETE",
			});
			const data = await res.json();
			if (data.success) {
				loadRequests();
				setShowDeleteModal(false);
				alert("Quote request deleted.");
			} else {
				alert(data.message || "Failed to delete request");
			}
		} catch (error) {
			console.error("Failed to delete request:", error);
			alert("Failed to delete request");
		}
	};

	// Handle assign
	const handleAssign = async () => {
		if (!assignedUserId) {
			alert('Please select a user to assign');
			return;
		}
		try {
			const res = await fetch(`/api/quote/${selectedRequest._id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ assignedUserId }),
			});
			const data = await res.json();
			if (data.success) {
				loadRequests();
				setShowAssignModal(false);
				setAssignedUserId('');
				setAvailableUsers([]);
				alert("Quote assigned successfully!");
			} else {
				alert(data.message || "Failed to assign quote");
			}
		} catch (error) {
			console.error("Failed to assign quote:", error);
			alert("Failed to assign quote");
		}
	};

	// Handle view waybill
	const handleViewWaybill = async (request) => {
		setSelectedRequest(request)
		setShowWaybillModal(true)
		setLoadingWaybill(true)
		try {
			const res = await fetch(`/api/quote/${request._id}/waybill`)
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

	// Handle download waybill
	const handleDownloadWaybill = async () => {
		if (!selectedRequest) return
		try {
			const res = await fetch(`/api/quote/${selectedRequest._id}/waybill/download`)
			if (!res.ok) throw new Error('Failed to download waybill')
			
			const blob = await res.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `waybill-${selectedRequest._id}-${new Date().getTime()}.pdf`
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			document.body.removeChild(a)
		} catch (error) {
			console.error('Failed to download waybill:', error)
			alert('Failed to download waybill')
		}
	}

	// Pagination
	const totalPages = Math.ceil(filteredRequests.length / requestsPerPage)
	const startIndex = (currentPage - 1) * requestsPerPage
	const endIndex = startIndex + requestsPerPage
	const currentRequests = filteredRequests.slice(startIndex, endIndex)

	// Get status badge color based on shipment status color
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
	
	// Get status display with emoji and name
	const getStatusDisplay = (statusName) => {
		if (!statusName) return 'N/A'
		const statusObj = shipmentStatuses.find(s => s.name === statusName)
		if (statusObj) {
			return `${statusObj.emoji} ${statusObj.name}`
		}
		// Fallback if status not found in shipmentStatuses
		return statusName
	}

	// Format date
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
				<p className="text-gray-600"><Commet color="#FF0000" size="medium" text="Loading" textColor="#FFB300" /></p>
			</div>
		)
	}

	return (
		<div className="bg-gray-50 py-2 md:py-8 px-0 sm:px-6 lg:px-8 mx-auto">
			<div className="w-[330px] md:w-full mx-auto">
				<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Quote Requests</h1>
				{/* Search and Filters */}
				<div className="bg-white rounded-lg shadow-sm p-2 lg:p-6 mb-6">
					<div className="flex flex-col gap-4">
						{/* Search Bar */}
						<div className="relative">
							<Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
							<input
								type="text"
								placeholder="Search by name, email, company, service, or message..."
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
									<option value="all">All ({requests.length})</option>
									{shipmentStatuses.map((status) => (
										<option key={status._id} value={status.name}>
											{status.emoji} {status.name} ({requests.filter((r) => r.status === status.name).length})
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
					Showing {currentRequests.length > 0 ? startIndex + 1 : 0} to{' '}
					{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
				</div>

				{/* Requests Table */}
				{filteredRequests.length === 0 ? (
					<div className="bg-white rounded-lg shadow-sm p-12 text-center">
						<Filter className="mx-auto w-12 h-12 text-gray-400 mb-4" />
						<p className="text-gray-600 text-lg font-medium">No requests found</p>
						<p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow-sm overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead className="bg-amber-100 border-b border-gray-200">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Tracking Number
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Name & Company
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Service
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
											Assigned To
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
									{currentRequests.map((request, idx) => (
										<tr key={request._id || request.id || idx} className="hover:bg-gray-50 transition">
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												<span className="font-mono text-orange-600 font-semibold">
													{request.trackingNumber || 'PENDING'}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
											<div className="font-medium text-gray-900">{request.fullName || request.name}</div>
												<div className="text-sm text-gray-500">{request.company}</div>
											</td>
											<td className="px-6 py-4">
												<span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
													{request.serviceType || request.service}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
												{getStatusDisplay(request.status)}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												{request.assignedTo ? (
													<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
														{request.assignedTo.firstName && request.assignedTo.lastName 
															? `${request.assignedTo.firstName} ${request.assignedTo.lastName}`
															: request.assignedTo.email
														}
													</span>
												) : (
													<span className="text-gray-400">Unassigned</span>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
												{formatDate(request.createdAt)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center justify-center flex-wrap gap-2">
													<button
														onClick={() => handleView(request)}
														className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
														title="View"
													>
														<Eye className="w-4 h-4" />
													</button>
													<button
														onClick={() => handleReplyClick(request)}
														className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
														title="Reply"
													>
														<Reply className="w-4 h-4" />
													</button>
													<button
														onClick={() => {
															setSelectedRequest(request)
															setNewStatus(request.status)
															setShowStatusModal(true)
														}}
														className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
														title="Change Status"
													>
														<CheckCircle className="w-4 h-4" />
													</button>
													<button
														onClick={() => {
															setSelectedRequest(request)
															setAssignedUserId('')
															setShowAssignModal(true)
															loadAvailableUsers()
														}}
														className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
														title="Assign"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
													</button>
													<button
														onClick={() => handleViewWaybill(request)}
														className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition"
														title="View Waybill"
													>
														<FileText className="w-4 h-4" />
													</button>
													<button
														onClick={() => {
															setSelectedRequest(request)
															setShowDeleteModal(true)
														}}
														className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
														title="Delete"
													>
														<Trash2 className="w-4 h-4" />
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
				{showViewModal && selectedRequest && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto">
							<div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
								<h3 className="text-lg font-semibold text-gray-900">View Quote Request</h3>
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
										<p className="text-gray-900">{selectedRequest.fullName || selectedRequest.name}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
										<p className="text-gray-900">{selectedRequest.company}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
										<p className="text-gray-900">{selectedRequest.email}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
										<p className="text-gray-900">{selectedRequest.phone}</p>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
										<p className="text-gray-900">{selectedRequest.pickupLocation || 'N/A'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
										<p className="text-gray-900">{selectedRequest.deliveryLocation || 'N/A'}</p>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
										<p className="text-gray-900">{selectedRequest.serviceType || selectedRequest.service}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Cargo Type</label>
										<p className="text-gray-900">{selectedRequest.cargoType || 'N/A'}</p>
									</div>
								</div>

								<div className="grid grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
										<p className="text-gray-900">{selectedRequest.weight || 'N/A'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
										<p className="text-gray-900">{selectedRequest.quantity || 'N/A'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Preferred Delivery</label>
										<p className="text-gray-900">{selectedRequest.preferredDeliveryDate ? new Date(selectedRequest.preferredDeliveryDate).toLocaleDateString() : 'N/A'}</p>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
									<p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">{selectedRequest.description || selectedRequest.message || 'N/A'}</p>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
										<span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedRequest.status)}`}>
											{getStatusDisplay(selectedRequest.status)}
										</span>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
										<p className="font-mono font-semibold text-orange-600">{selectedRequest.trackingNumber || 'Not yet assigned'}</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
										{selectedRequest.assignedTo ? (
											<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
												{selectedRequest.assignedTo.firstName && selectedRequest.assignedTo.lastName 
													? `${selectedRequest.assignedTo.firstName} ${selectedRequest.assignedTo.lastName}`
													: selectedRequest.assignedTo.email
												}
											</span>
										) : (
											<span className="text-gray-400">Unassigned</span>
										)}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Submitted On</label>
										<p className="text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
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
										handleReplyClick(selectedRequest)
									}}
									className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition flex items-center gap-2"
								>
									<Reply className="w-4 h-4" />
									Reply
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Reply Modal */}
				{showReplyModal && selectedRequest && (
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
									<label className="block text-sm font-medium text-gray-700 mb-2">Original Request</label>
									<p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">Service: {selectedRequest.service}</p>
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
									className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition flex items-center gap-2"
								>
									<Reply className="w-4 h-4" />
									Send Quote
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Status Change Modal */}
				{showStatusModal && selectedRequest && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-md w-full">
							<div className="p-6 border-b border-gray-200 flex justify-between items-center">
								<h3 className="text-lg font-semibold text-gray-900">Change Request Status</h3>
								<button
									onClick={() => setShowStatusModal(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							<div className="p-6 space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Request From</label>
									<p className="text-gray-900">{selectedRequest.fullName || selectedRequest.name} ({selectedRequest.company})</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
									<span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedRequest.status)}`}>
										{getStatusDisplay(selectedRequest.status)}
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

				{/* Assign Modal */}
				{showAssignModal && selectedRequest && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-md w-full">
							<div className="p-6 border-b border-gray-200 flex justify-between items-center">
								<h3 className="text-lg font-semibold text-gray-900">Assign Quote Request</h3>
								<button
									onClick={() => setShowAssignModal(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							<div className="p-6 space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Quote From</label>
									<p className="text-gray-900">{selectedRequest.fullName || selectedRequest.name} ({selectedRequest.company})</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Currently Assigned To</label>
									{selectedRequest.assignedTo ? (
										<p className="text-blue-700 font-medium">
											{selectedRequest.assignedTo.firstName && selectedRequest.assignedTo.lastName 
												? `${selectedRequest.assignedTo.firstName} ${selectedRequest.assignedTo.lastName}`
												: selectedRequest.assignedTo.email
											}
										</p>
									) : (
										<p className="text-gray-400">Unassigned</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Reassign To *</label>
									{loadingUsers ? (
										<div className="p-4 text-center text-gray-600">Loading users...</div>
									) : availableUsers.length > 0 ? (
										<select
											value={assignedUserId}
											onChange={(e) => setAssignedUserId(e.target.value)}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
										>
											<option value="">Select a user</option>
											{availableUsers.map((user) => (
												<option key={user._id} value={user._id}>
													{user.name || user.email} ({user.role})
												</option>
											))}
										</select>
									) : (
										<div className="p-4 text-center text-gray-600 bg-gray-50 rounded-lg">
											No users available to assign
										</div>
									)}
								</div>

								<p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
									This quote will be assigned to the selected user so they can handle the quote request.
								</p>
							</div>

							<div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
								<button
									onClick={() => setShowAssignModal(false)}
									className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
								>
									Cancel
								</button>
								<button
									onClick={handleAssign}
									disabled={!assignedUserId || loadingUsers}
									className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
									Assign
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Delete Modal */}
				{showDeleteModal && selectedRequest && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-md w-full">
							<div className="p-6">
								<div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
									<Trash2 className="w-6 h-6 text-red-600" />
								</div>
								<h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Quote Request</h3>
								<p className="text-gray-600 text-center mb-6">
									Are you sure you want to delete this quote request from{' '}
								<strong>{selectedRequest.fullName || selectedRequest.name}</strong>? This action cannot be undone.
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

				{/* Waybill Modal */}
				{showWaybillModal && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
								<h3 className="text-lg font-semibold text-gray-900">Waybill Details</h3>
								<button
									onClick={() => setShowWaybillModal(false)}
									className="text-gray-500 hover:text-gray-700"
								>
									<X className="w-6 h-6" />
								</button>
							</div>

							{loadingWaybill ? (
								<div className="p-12 text-center">
									<div className="inline-block">
										<div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
									</div>
									<p className="text-gray-600 mt-4">Loading waybill...</p>
								</div>
							) : waybillData ? (
								<div className="p-6 space-y-6">
									{/* Waybill Header */}
									<div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
										<h4 className="font-bold text-orange-900 text-lg">Waybill #{waybillData.waybillNumber || 'N/A'}</h4>
										<p className="text-orange-600 font-semibold">Status: <span className="font-semibold text-orange-900">{waybillData.status || 'N/A'}</span></p>
										<p className="text-orange-600 mt-2 font-semibold">Tracking Number: <span className="font-mono font-semibold text-orange-900">{waybillData.trackingNumber || 'PENDING'}</span></p>
									</div>

									{/* Sender Information */}
									<div>
										<h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
											<MapPin className="w-4 h-4 text-blue-600" />
											Sender Information
										</h5>
										<div className="bg-gray-50 p-4 rounded-lg space-y-2">
											<p><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{waybillData.senderName || 'N/A'}</span></p>
											<p><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-900">{waybillData.senderAddress || 'N/A'}</span></p>
											<p><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-900">{waybillData.senderPhone || 'N/A'}</span></p>
										</div>
									</div>

									{/* Receiver Information */}
									<div>
										<h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
											<MapPin className="w-4 h-4 text-green-600" />
											Receiver Information
										</h5>
										<div className="bg-gray-50 p-4 rounded-lg space-y-2">
											<p><span className="font-medium text-gray-700">Name:</span> <span className="text-gray-900">{waybillData.receiverName || 'N/A'}</span></p>
											<p><span className="font-medium text-gray-700">Address:</span> <span className="text-gray-900">{waybillData.receiverAddress || 'N/A'}</span></p>
											<p><span className="font-medium text-gray-700">Phone:</span> <span className="text-gray-900">{waybillData.receiverPhone || 'N/A'}</span></p>
										</div>
									</div>

									{/* Shipment Details */}
									<div>
										<h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
											<Package className="w-4 h-4 text-purple-600" />
											Shipment Details
										</h5>
										<div className="bg-gray-50 p-4 rounded-lg space-y-2">
											<p><span className="font-medium text-gray-700">Description:</span> <span className="text-gray-900">{waybillData.cargoDescription || 'N/A'}</span></p>
											<p><span className="font-medium text-gray-700">Weight:</span> <span className="text-gray-900">{waybillData.weight || 'N/A'} kg</span></p>
											<p><span className="font-medium text-gray-700">Dimensions:</span> <span className="text-gray-900">{waybillData.dimensions || 'N/A'}</span></p>
											<p><span className="font-medium text-gray-700">Service Type:</span> <span className="text-gray-900">{waybillData.serviceType || 'N/A'}</span></p>
										</div>
									</div>

									{/* Tracking Information */}
									<div>
										<h5 className="font-semibold text-gray-900 mb-3">Tracking Timeline</h5>
										<div className="space-y-3">
											{waybillData.trackingHistory && waybillData.trackingHistory.length > 0 ? (
												waybillData.trackingHistory.map((entry, idx) => (
													<div key={idx} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
														<div className="flex flex-col items-center">
															<div className="w-3 h-3 bg-orange-600 rounded-full"></div>
															{idx < waybillData.trackingHistory.length - 1 && <div className="w-0.5 h-8 bg-gray-300 mt-1"></div>}
														</div>
														<div className="pt-1">
															<p className="font-medium text-gray-900">{entry.status || 'Update'}</p>
															<p className="text-sm text-gray-600">{entry.location || 'N/A'}</p>
															<p className="text-xs text-gray-500">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}</p>
														</div>
													</div>
												))
											) : (
												<p className="text-gray-600 text-sm">No tracking information available</p>
											)}
										</div>
									</div>
								</div>
							) : (
								<div className="p-6 text-center">
									<FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
									<p className="text-gray-600">No waybill data available</p>
								</div>
							)}

							<div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 sticky bottom-0">
								<button
									onClick={() => setShowWaybillModal(false)}
									className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition"
								>
									Close
								</button>
								<button
									onClick={() => handleDownloadWaybill(selectedRequest)}
									disabled={!waybillData || loadingWaybill}
									className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ManageQuoteRequests
