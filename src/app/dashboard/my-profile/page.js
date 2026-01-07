import React from 'react'
import ProfileManagement from './components/ProfileManagement'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function page() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'staff-member', 'client']}>
      <ProfileManagement />
    </ProtectedRoute>
  )
}
