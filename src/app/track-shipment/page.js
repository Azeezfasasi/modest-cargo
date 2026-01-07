'use client'

import React, { useState, useCallback } from 'react'
import { Search, Package, MapPin, Phone, Mail, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Commet } from 'react-loading-indicators'

const TrackShipment = () => {
	const [trackingNumber, setTrackingNumber] = useState('')
	const [shipment, setShipment] = useState(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [searched, setSearched] = useState(false)

	const handleSearch = useCallback(async (e) => {
		e.preventDefault()
		
		if (!trackingNumber.trim()) {
			setError('Please enter a tracking number')
			return
		}

		setLoading(true)
		setError('')
		setSearched(true)

		try {
			const res = await fetch(`/api/quote/track/${trackingNumber.trim().toUpperCase()}`)
			const data = await res.json()

			if (data.success) {
				setShipment(data.shipment)
			} else {
				setError(data.message || 'Shipment not found. Please check the tracking number and try again.')
				setShipment(null)
			}
		} catch (err) {
			console.error('Error tracking shipment:', err)
			setError('Failed to track shipment. Please try again later.')
			setShipment(null)
		} finally {
			setLoading(false)
		}
	}, [trackingNumber])

	const getStatusIcon = (status) => {
		return <CheckCircle className="w-5 h-5" />
	}

	const getStatusColor = (status) => {
		const statusColors = {
			pending: 'bg-yellow-100 border-yellow-300 text-yellow-700',
			processing: 'bg-blue-100 border-blue-300 text-blue-700',
			shipped: 'bg-purple-100 border-purple-300 text-purple-700',
			out_for_delivery: 'bg-orange-100 border-orange-300 text-orange-700',
			delivered: 'bg-green-100 border-green-300 text-green-700',
			cancelled: 'bg-red-100 border-red-300 text-red-700',
		}
		return statusColors[status?.toLowerCase()] || 'bg-gray-100 border-gray-300 text-gray-700'
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

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
						<Package className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-4xl font-bold text-gray-900 mb-2">Track Your Shipment</h1>
					<p className="text-lg text-gray-600">Enter your tracking number to see your shipment status and history</p>
				</div>

				{/* Search Section */}
				<div className="bg-white rounded-lg shadow-md p-8 mb-8">
					<form onSubmit={handleSearch} className="flex gap-2">
						<div className="flex-1 relative">
							<input
								type="text"
								placeholder="Enter tracking number (e.g., MC-20260107-12345)"
								value={trackingNumber}
								onChange={(e) => setTrackingNumber(e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-900 placeholder-gray-500"
							/>
						</div>
						<button
							type="submit"
							disabled={loading}
							className="px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							<Search className="w-5 h-5" />
							Track
						</button>
					</form>
				</div>

				{/* Error Message */}
				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
						<p className="text-red-700">{error}</p>
					</div>
				)}

				{/* Loading State */}
				{loading && (
					<div className="flex justify-center items-center py-16">
						<Commet color="#ea580c" />
					</div>
				)}

				{/* No Results State */}
				{!loading && searched && !shipment && !error && (
					<div className="bg-white rounded-lg shadow-md p-12 text-center">
						<Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-600 text-lg font-medium">No shipment found</p>
						<p className="text-gray-500 mt-2">Try entering a valid tracking number</p>
					</div>
				)}

				{/* Shipment Details */}
				{shipment && (
					<>
						{/* Shipment Header */}
						<div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
							<div className="bg-gradient-to-r from-orange-600 to-orange-700 px-8 py-6">
								<p className="text-orange-100 text-sm mb-2">Tracking Number</p>
								<h2 className="text-3xl font-bold text-white font-mono">{shipment.trackingNumber}</h2>
							</div>

							{/* Current Status */}
							<div className="px-8 py-6 border-b border-gray-200">
								<div className="flex items-start justify-between">
									<div>
										<p className="text-sm text-gray-600 mb-1">Current Status</p>
										<p className={`text-2xl font-bold capitalize ${
											shipment.status === 'delivered' 
												? 'text-green-600' 
												: shipment.status === 'cancelled'
												? 'text-red-600'
												: 'text-orange-600'
										}`}>
											{shipment.status?.replace(/_/g, ' ')}
										</p>
									</div>
									<div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(shipment.status)}`}>
										{shipment.status === 'delivered' ? (
											<CheckCircle className="w-5 h-5" />
										) : shipment.status === 'cancelled' ? (
											<AlertCircle className="w-5 h-5" />
										) : (
											<Clock className="w-5 h-5" />
										)}
										{shipment.status?.replace(/_/g, ' ')}
									</div>
								</div>
							</div>

							{/* Shipment Details Grid */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-6">
								{/* Sender Information */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
										<MapPin className="w-5 h-5 text-orange-600" />
										From
									</h3>
									<div className="space-y-2">
										<p className="text-sm">
											<span className="text-gray-600">Name:</span>
											<span className="ml-2 font-medium text-gray-900">{shipment.fullName || 'N/A'}</span>
										</p>
										<p className="text-sm">
											<span className="text-gray-600">Location:</span>
											<span className="ml-2 font-medium text-gray-900">{shipment.pickupLocation || 'N/A'}</span>
										</p>
										<p className="text-sm">
											<span className="text-gray-600">Phone:</span>
											<span className="ml-2 font-medium text-gray-900">{shipment.phone || 'N/A'}</span>
										</p>
									</div>
								</div>

								{/* Delivery Information */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
										<MapPin className="w-5 h-5 text-orange-600" />
										To
									</h3>
									<div className="space-y-2">
										<p className="text-sm">
											<span className="text-gray-600">Location:</span>
											<span className="ml-2 font-medium text-gray-900">{shipment.deliveryLocation || 'N/A'}</span>
										</p>
										<p className="text-sm">
											<span className="text-gray-600">Service:</span>
											<span className="ml-2 font-medium text-gray-900">{shipment.serviceType || shipment.service || 'N/A'}</span>
										</p>
										<p className="text-sm">
											<span className="text-gray-600">Est. Delivery:</span>
											<span className="ml-2 font-medium text-gray-900">
												{shipment.preferredDeliveryDate 
													? formatDate(shipment.preferredDeliveryDate).split(',')[0]
													: 'N/A'
												}
											</span>
										</p>
									</div>
								</div>

								{/* Shipment Details */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
										<Package className="w-5 h-5 text-orange-600" />
										Package Details
									</h3>
									<div className="space-y-2">
										<p className="text-sm">
											<span className="text-gray-600">Description:</span>
											<span className="ml-2 font-medium text-gray-900">{shipment.description || shipment.cargoType || 'N/A'}</span>
										</p>
										<p className="text-sm">
											<span className="text-gray-600">Weight:</span>
											<span className="ml-2 font-medium text-gray-900">{shipment.weight ? `${shipment.weight} kg` : 'N/A'}</span>
										</p>
										<p className="text-sm">
											<span className="text-gray-600">Quantity:</span>
											<span className="ml-2 font-medium text-gray-900">{shipment.quantity || 1} unit(s)</span>
										</p>
									</div>
								</div>

								{/* Contact Information */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
										<Mail className="w-5 h-5 text-orange-600" />
										Contact Information
									</h3>
									<div className="space-y-2">
										<p className="text-sm">
											<span className="text-gray-600">Email:</span>
											<span className="ml-2 font-medium text-gray-900 break-all">{shipment.email || 'N/A'}</span>
										</p>
										<p className="text-sm">
											<span className="text-gray-600">Company:</span>
											<span className="ml-2 font-medium text-gray-900">{shipment.company || 'N/A'}</span>
										</p>
										<p className="text-sm">
											<span className="text-gray-600">Submitted:</span>
											<span className="ml-2 font-medium text-gray-900">{formatDate(shipment.createdAt)}</span>
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Status Timeline */}
						<div className="bg-white rounded-lg shadow-md p-8">
							<h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
								<Calendar className="w-6 h-6 text-orange-600" />
								Shipment Status History
							</h3>

							<div className="space-y-6">
								{shipment.statusHistory && shipment.statusHistory.length > 0 ? (
									shipment.statusHistory.map((historyItem, index) => (
										<div key={index} className="flex gap-6">
											{/* Timeline Line */}
											<div className="flex flex-col items-center">
												<div className={`w-4 h-4 rounded-full border-4 ${
													historyItem.status === 'delivered' 
														? 'bg-green-500 border-green-200'
														: historyItem.status === 'cancelled'
														? 'bg-red-500 border-red-200'
														: 'bg-orange-500 border-orange-200'
												}`}></div>
												{index < shipment.statusHistory.length - 1 && (
													<div className="w-1 h-20 bg-gradient-to-b from-gray-300 to-gray-200 my-2"></div>
												)}
											</div>

											{/* Timeline Content */}
											<div className="pb-2 flex-1">
												<div className="flex items-center gap-3 mb-1">
													<h4 className="text-lg font-semibold text-gray-900 capitalize">
														{historyItem.status?.replace(/_/g, ' ')}
													</h4>
													<span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(historyItem.status)}`}>
														{historyItem.status?.replace(/_/g, ' ')}
													</span>
												</div>
												<p className="text-sm text-gray-600 mb-2">
													{formatDate(historyItem.timestamp || historyItem.updatedAt)}
												</p>
												{historyItem.notes && (
													<p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 mt-2">
														{historyItem.notes}
													</p>
												)}
											</div>
										</div>
									))
								) : (
									<div className="text-center py-8">
										<Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
										<p className="text-gray-600">No status history available yet</p>
									</div>
								)}
							</div>
						</div>

						{/* Help Section */}
						<div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
							<h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
							<p className="text-blue-800 text-sm mb-3">
								If you have any questions about your shipment, please contact us:
							</p>
							<div className="flex flex-col sm:flex-row gap-4 text-sm">
								<a href="mailto:support@modestcargo.com" className="text-orange-600 font-medium hover:underline">
									📧 support@modestcargo.com
								</a>
								<a href="tel:+234" className="text-orange-600 font-medium hover:underline">
									📞 +234 XXX XXX XXXX
								</a>
							</div>
						</div>
					</>
				)}

				{/* Placeholder State */}
				{!searched && !shipment && (
					<div className="bg-white rounded-lg shadow-md p-12 text-center">
						<Package className="w-16 h-16 text-orange-600 mx-auto mb-4 opacity-50" />
						<p className="text-gray-600 text-lg font-medium">Enter your tracking number to get started</p>
						<p className="text-gray-500 mt-2">You can find your tracking number in your confirmation email</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default TrackShipment
