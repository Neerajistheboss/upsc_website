import React from 'react'
import { useToast } from '@/hooks/useToast'

const ToastExample = () => {
  const toast = useToast()

  const showSuccessToast = () => {
    toast.success('Success!', 'Your action was completed successfully.')
  }

  const showErrorToast = () => {
    toast.error('Error!', 'Something went wrong. Please try again.')
  }

  const showWarningToast = () => {
    toast.warning('Warning!', 'Please review your input before proceeding.')
  }

  const showInfoToast = () => {
    toast.info('Info!', 'Here is some helpful information.')
  }

  const showLoadingToast = () => {
    const loadingToast = toast.loading('Processing your request...')
    
    // Simulate some async operation
    setTimeout(() => {
      toast.dismiss(loadingToast)
      toast.success('Completed!', 'Your request has been processed.')
    }, 3000)
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Toast Notification Examples</h2>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={showSuccessToast}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
        >
          Success Toast
        </button>
        <button
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Error Toast
        </button>
        <button
          onClick={showWarningToast}
          className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
        >
          Warning Toast
        </button>
        <button
          onClick={showInfoToast}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Info Toast
        </button>
        <button
          onClick={showLoadingToast}
          className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
        >
          Loading Toast
        </button>
      </div>
    </div>
  )
}

export default ToastExample 