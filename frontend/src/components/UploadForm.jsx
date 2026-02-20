import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function UploadForm({ onSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const { token } = useAuth();
  const { t } = useLanguage();

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/ops/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Upload successful!');
        setFiles([]);
        e.target.reset();
        onSuccess();
      } else {
        setMessage('Upload failed: ' + data.error);
      }
    } catch (error) {
      setMessage('Upload error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">{t('uploadFiles')}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.pdf"
            multiple
            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-medical-blue transition"
          />
          {files.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {files.length} file(s) selected
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={uploading || files.length === 0}
          className="w-full bg-medical-blue text-white py-3 rounded-lg hover:bg-medical-dark transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : t('uploadFiles')}
        </button>

        {message && (
          <div className={`px-4 py-3 rounded-lg text-sm ${
            message.includes('successful')
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
