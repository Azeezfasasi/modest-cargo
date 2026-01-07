'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { X, Plus, MapPin, Package, AlertCircle } from 'lucide-react'
import { Commet } from 'react-loading-indicators'
import toast from 'react-hot-toast'

const CreateShipment = () => {
	const { user } = useAuth()
	const [loading, setLoading] = useState(false)
	const [successMessage, setSuccessMessage] = useState('')
	const [errorMessage, setErrorMessage] = useState('')

	const [formData, setFormData] = useState({
		fullName: '',
		email: '',
		phone: '',
		company: '',
		pickupLocation: '',
		deliveryLocation: '',
		serviceType: '',
		cargoType: '',
		weight: '',
		quantity: '',
		description: '',
		preferredDeliveryDate: '',
	})

	const [errors, setErrors] = useState({})

	const validateForm = () => {
		const newErrors = {}

		if (!formData.fullName.trim()) newErrors.fullName = 'Customer name is required'
		if (!formData.email.trim()) {
			newErrors.email = 'Email is required'
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email'
		}
		if (!formData.phone.trim()) newErrors.phone = 'Phone is required'
		if (!formData.company.trim()) newErrors.company = 'Company is required'
		if (!formData.pickupLocation.trim()) newErrors.pickupLocation = 'Pickup location is required'
		if (!formData.deliveryLocation.trim()) newErrors.deliveryLocation = 'Delivery location is required'
		if (!formData.serviceType) newErrors.serviceType = 'Service type is required'
		if (!formData.cargoType) newErrors.cargoType = 'Cargo type is required'
		if (!formData.weight || formData.weight <= 0) newErrors.weight = 'Weight must be greater than 0'
		if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0'
		if (!formData.description.trim()) newErrors.description = 'Shipment details are required'

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleInputChange = (e) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
		// Clear error for this field when user starts typing
		if (errors[name]) {
			setErrors(prev => ({
				...prev,
				[name]: ''
			}))
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		if (!validateForm()) {
			setErrorMessage('Please fix the errors above')
			setTimeout(() => setErrorMessage(''), 5000)
			return
		}

		setLoading(true)
		setErrorMessage('')
		setSuccessMessage('')

		try {
			const res = await fetch('/api/quote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...formData,
					weight: parseFloat(formData.weight),
					quantity: parseInt(formData.quantity),
					preferredDeliveryDate: formData.preferredDeliveryDate ? new Date(formData.preferredDeliveryDate) : null,
					status: 'pending',
				}),
			})

			const data = await res.json()

			if (data.success) {
				const trackingNumber = data.quote?.trackingNumber || 'PENDING'
				toast.success(
					<div className="flex flex-col gap-1">
						<span>✓ Shipment created successfully!</span>
						<span className="font-mono text-sm">Tracking: {trackingNumber}</span>
					</div>
				)
				setSuccessMessage(`✓ Shipment created successfully! Tracking: ${trackingNumber}`)
				setFormData({
					fullName: '',
					email: '',
					phone: '',
					company: '',
					pickupLocation: '',
					deliveryLocation: '',
					serviceType: '',
					cargoType: '',
					weight: '',
					quantity: '',
					description: '',
					preferredDeliveryDate: '',
				})
				setTimeout(() => {
					setSuccessMessage('')
				}, 5000)
			} else {
				setErrorMessage(data.message || 'Failed to create shipment')
			}
		} catch (error) {
			console.error('Error creating shipment:', error)
			setErrorMessage('An error occurred while creating the shipment')
		} finally {
			setLoading(false)
		}
	}

	const handleReset = () => {
		setFormData({
			fullName: '',
			email: '',
			phone: '',
			company: '',
			pickupLocation: '',
			deliveryLocation: '',
			serviceType: '',
			cargoType: '',
			weight: '',
			quantity: '',
			description: '',
			preferredDeliveryDate: '',
		})
		setErrors({})
		setErrorMessage('')
		setSuccessMessage('')
	}

	return (
		<div className="bg-gray-50 py-2 md:py-8 px-0 sm:px-6 lg:px-8 mx-auto min-h-screen">
			<div className="w-[330px] md:w-full md:max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
						<Plus className="w-8 h-8 text-red-700" />
						Create New Shipment
					</h1>
					<p className="text-gray-600 mt-2">Fill in the shipment details below to create a new shipment in the system</p>
                </div>
                
                {/* Form Info Box */}
				<div className="mt-8 p-6 bg-amber-50 border border-red-200 rounded-lg">
					<h3 className="text-sm font-semibold text-red-700 mb-3">ℹ️ Important Information</h3>
					<ul className="text-sm text-red-700 space-y-2">
						<li>• All fields marked with * are required</li>
						<li>• Email must be a valid email address</li>
						<li>• Weight and quantity must be greater than 0</li>
						<li>• Shipment status will be set to "Pending" upon creation</li>
						<li>• You can modify the shipment status and assign it to staff members later</li>
					</ul>
				</div>

				{/* Success Message */}
				{successMessage && (
					<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 mt-2">
						<div className="w-5 h-5 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
							<span className="text-white text-sm font-bold">✓</span>
						</div>
						<div className="flex-1">
							<p className="text-green-700 font-medium">{successMessage}</p>
						</div>
						<button
							onClick={() => setSuccessMessage('')}
							className="text-green-600 hover:text-green-700"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				)}

				{/* Error Message */}
				{errorMessage && (
					<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
						<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
						<div className="flex-1">
							<p className="text-red-800 font-medium">{errorMessage}</p>
						</div>
						<button
							onClick={() => setErrorMessage('')}
							className="text-red-600 hover:text-red-700"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				)}

				<form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm overflow-hidden">
					{/* Customer Information Section */}
					<div className="p-6 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
							<span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
							Customer Information
						</h2>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Full Name *
									{errors.fullName && <span className="text-red-600 text-xs ml-1">({errors.fullName})</span>}
								</label>
								<input
									type="text"
									name="fullName"
									value={formData.fullName}
									onChange={handleInputChange}
									placeholder="e.g., John Doe"
									className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition ${
										errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
									}`}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Email Address *
									{errors.email && <span className="text-red-600 text-xs ml-1">({errors.email})</span>}
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									placeholder="e.g., john@example.com"
									className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition ${
										errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
									}`}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Phone Number *
									{errors.phone && <span className="text-red-600 text-xs ml-1">({errors.phone})</span>}
								</label>
								<input
									type="tel"
									name="phone"
									value={formData.phone}
									onChange={handleInputChange}
									placeholder="e.g., +1 (555) 123-4567"
									className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition ${
										errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
									}`}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Company Name *
									{errors.company && <span className="text-red-600 text-xs ml-1">({errors.company})</span>}
								</label>
								<input
									type="text"
									name="company"
									value={formData.company}
									onChange={handleInputChange}
									placeholder="e.g., Acme Corporation"
									className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition ${
										errors.company ? 'border-red-500 bg-red-50' : 'border-gray-300'
									}`}
								/>
							</div>
						</div>
					</div>

					{/* Location Information Section */}
					<div className="p-6 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
							<span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
							<MapPin className="w-5 h-5" />
							Shipment Locations
						</h2>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Pickup Location *
									{errors.pickupLocation && <span className="text-red-600 text-xs ml-1">({errors.pickupLocation})</span>}
								</label>
								<input
									type="text"
									name="pickupLocation"
									value={formData.pickupLocation}
									onChange={handleInputChange}
									placeholder="e.g., New York, NY"
									className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition ${
										errors.pickupLocation ? 'border-red-500 bg-red-50' : 'border-gray-300'
									}`}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Delivery Location *
									{errors.deliveryLocation && <span className="text-red-600 text-xs ml-1">({errors.deliveryLocation})</span>}
								</label>
								<input
									type="text"
									name="deliveryLocation"
									value={formData.deliveryLocation}
									onChange={handleInputChange}
									placeholder="e.g., Los Angeles, CA"
									className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition ${
										errors.deliveryLocation ? 'border-red-500 bg-red-50' : 'border-gray-300'
									}`}
								/>
							</div>
						</div>
					</div>

					{/* Service & Cargo Information Section */}
					<div className="p-6 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
							<span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
							<Package className="w-5 h-5" />
							Service & Cargo Details
						</h2>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Service Type *
									{errors.serviceType && <span className="text-red-600 text-xs ml-1">({errors.serviceType})</span>}
								</label>
								<select
									name="serviceType"
									value={formData.serviceType}
									onChange={handleInputChange}
									className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition bg-white ${
										errors.serviceType ? 'border-red-500 bg-red-50' : 'border-gray-300'
									}`}
								>
									<option value="">-- Select Service Type --</option>
									<option value="LCL Shipping">LCL Shipping (Less than Container Load)</option>
									<option value="FCL Shipping">FCL Shipping (Full Container Load)</option>
									<option value="Air Freight">Air Freight</option>
									<option value="Road Transport">Road Transport</option>
									<option value="Sea Freight">Sea Freight</option>
									<option value="Express Delivery">Express Delivery</option>
									<option value="Consolidation">Consolidation Service</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Cargo Type *
									{errors.cargoType && <span className="text-red-600 text-xs ml-1">({errors.cargoType})</span>}
								</label>
								<select
									name="cargoType"
									value={formData.cargoType}
									onChange={handleInputChange}
									className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition bg-white ${
										errors.cargoType ? 'border-red-500 bg-red-50' : 'border-gray-300'
									}`}
								>
									<option value="">-- Select Cargo Type --</option>
									<option value="Electronics">Electronics</option>
									<option value="Machinery">Machinery & Equipment</option>
									<option value="Textiles">Textiles & Apparel</option>
									<option value="Chemicals">Chemicals & Pharmaceuticals</option>
									<option value="Food & Beverage">Food & Beverage</option>
									<option value="Construction Materials">Construction Materials</option>
									<option value="Automotive">Automotive Parts</option>
									<option value="General">General Cargo</option>
									<option value="Hazardous">Hazardous Materials</option>
									<option value="Other">Other</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Weight (kg) *
									{errors.weight && <span className="text-red-600 text-xs ml-1">({errors.weight})</span>}
								</label>
								<input
									type="number"
									name="weight"
									value={formData.weight}
									onChange={handleInputChange}
									placeholder="e.g., 100"
									step="0.01"
									min="0"
									className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition ${
										errors.weight ? 'border-red-500 bg-red-50' : 'border-gray-300'
									}`}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Quantity *
									{errors.quantity && <span className="text-red-600 text-xs ml-1">({errors.quantity})</span>}
								</label>
								<input
									type="number"
									name="quantity"
									value={formData.quantity}
									onChange={handleInputChange}
									placeholder="e.g., 5"
									min="0"
									className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition ${
										errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300'
									}`}
								/>
							</div>
						</div>
					</div>

					{/* Additional Information Section */}
					<div className="p-6 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
							<span className="w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
							Additional Information
						</h2>

						<div className="space-y-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Preferred Delivery Date
								</label>
								<input
									type="date"
									name="preferredDeliveryDate"
									value={formData.preferredDeliveryDate}
									onChange={handleInputChange}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition"
								/>
								<p className="text-xs text-gray-500 mt-1">Optional: Select when you want this shipment to be delivered</p>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Shipment Details *
									{errors.description && <span className="text-red-600 text-xs ml-1">({errors.description})</span>}
								</label>
								<textarea
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									placeholder="Describe the contents of the shipment, special handling requirements, or any other relevant information..."
									rows="5"
									className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-700 focus:border-transparent outline-none transition resize-none ${
										errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
									}`}
								/>
								<p className="text-xs text-gray-500 mt-1">{formData.description.length} characters</p>
							</div>
						</div>
					</div>

					{/* Success Message */}
					{successMessage && (
						<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3 mt-2">
							<div className="w-5 h-5 bg-green-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
								<span className="text-white text-sm font-bold">✓</span>
							</div>
							<div className="flex-1">
								<p className="text-green-700 font-medium">{successMessage}</p>
							</div>
							<button
								onClick={() => setSuccessMessage('')}
								className="text-green-600 hover:text-green-700"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					)}

					{/* Error Message */}
					{errorMessage && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
							<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
							<div className="flex-1">
								<p className="text-red-800 font-medium">{errorMessage}</p>
							</div>
							<button
								onClick={() => setErrorMessage('')}
								className="text-red-600 hover:text-red-700"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					)}

					{/* Form Actions */}
					<div className="p-6 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
						<button
							type="reset"
							onClick={handleReset}
							disabled={loading}
							className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Reset
						</button>
						<button
							type="submit"
							disabled={loading}
							className="px-6 py-2 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{loading ? (
								<>
									<Commet color="#ffffff" size="small" text="" textColor="#ffffff" />
									Creating...
								</>
							) : (
								<>
									<Plus className="w-4 h-4" />
									Create Shipment
								</>
							)}
						</button>
					</div>
				</form>

			</div>
		</div>
	)
}

export default CreateShipment
