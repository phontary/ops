import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import OperationsList from '../components/OperationsList';
import UploadForm from '../components/UploadForm';

export default function Dashboard() {
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { t } = useLanguage();

  const fetchOperations = async () => {
    try {
      const response = await fetch('/api/ops', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setOperations(data);
    } catch (error) {
      console.error('Error fetching operations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperations();
  }, [token]);

  const handleUploadSuccess = () => {
    fetchOperations();
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/ops/export/csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'operations.csv';
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">{t('dashboard')}</h2>
        <button
          onClick={handleExport}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          {t('export')} CSV
        </button>
      </div>

      <UploadForm onSuccess={handleUploadSuccess} />

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue"></div>
        </div>
      ) : (
        <OperationsList operations={operations} onUpdate={fetchOperations} />
      )}
    </div>
  );
}
