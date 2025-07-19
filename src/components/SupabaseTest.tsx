import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const SupabaseTest = () => {
  const [testResult, setTestResult] = useState<string>('Testing...')
  const [tableData, setTableData] = useState<any[]>([])

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const testSupabaseConnection = async () => {
    try {
      // Test 1: Basic connection
      setTestResult('Testing basic connection...')
      
      // Test 2: Check if table exists
      setTestResult('Checking if table exists...')
      const { data: tableCheck, error: tableError } = await supabase
        .from('species_in_news')
        .select('count')
        .limit(1)
      
      if (tableError) {
        setTestResult(`Table error: ${tableError.message}`)
        return
      }

      // Test 3: Try to get actual data
      setTestResult('Fetching data...')
      const { data, error } = await supabase
        .from('species_in_news')
        .select('*')
        .limit(5)

      if (error) {
        setTestResult(`Data fetch error: ${error.message}`)
        return
      }

      setTableData(data || [])
      setTestResult(`Success! Found ${data?.length || 0} records`)
      
    } catch (err) {
      setTestResult(`Connection error: ${err}`)
    }
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
      <h3 className="font-bold text-yellow-800 mb-2">Supabase Connection Test</h3>
      <p className="text-yellow-700 mb-2">{testResult}</p>
      
      {tableData.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Sample Data:</h4>
          <div className="space-y-1">
            {tableData.map((item, index) => (
              <div key={index} className="text-sm text-yellow-700">
                {index + 1}. {item.name} ({item.scientific_name})
              </div>
            ))}
          </div>
        </div>
      )}
      
      <button 
        onClick={testSupabaseConnection}
        className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
      >
        Retest Connection
      </button>
    </div>
  )
}

export default SupabaseTest 