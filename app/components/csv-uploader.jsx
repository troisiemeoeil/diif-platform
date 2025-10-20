'use client';

import React, { useState } from 'react';

export default function CsvUploader() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a CSV file.');
      return;
    }

    setLoading(true);
    setMessage('Uploading and importing...');

    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await fetch('/api/import-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Success! Imported ${data.insertedCount} documents.`);
      } else {
        setMessage(`Error: ${data.error || 'Failed to import file.'}`);
      }
    } catch (error) {
      setMessage('Network error or server connection failed.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Import CSV to MongoDB'}
      </button>
      <p>{message}</p>
    </form>
  );
}