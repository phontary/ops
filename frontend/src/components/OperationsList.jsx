import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import OperationEditor from './OperationEditor';

export default function OperationsList({ operations, onUpdate }) {
  const [editingId, setEditingId] = useState(null);
  const { token } = useAuth();
  const { t } = useLanguage();

  const handleDelete = async (id) => {
    if (!confirm('Delete this operation?')) return;

    try {
      await fetch(`/api/ops/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      onUpdate();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-xl font-semibold text-gray-800">{t('operations')}</h3>
      </div>

      {operations.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">
          No operations yet. Upload files to get started.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('opId')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('date')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('diagnose')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">{t('duration')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {operations.map(op => (
                editingId === op.id ? (
                  <tr key={op.id}>
                    <td colSpan="6" className="px-4 py-4">
                      <OperationEditor
                        operation={op}
                        onCancel={() => setEditingId(null)}
                        onSave={() => {
                          setEditingId(null);
                          onUpdate();
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  <tr key={op.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{op.op_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(op.datum).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{op.diagnose || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{op.dauer_min} min</td>
                    <td className="px-4 py-3">
                      {op.complete ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t('complete')}
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {t('incomplete')}
                          </span>
                          {op.missing_fields && op.missing_fields.length > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {t('missingFields')}: {op.missing_fields.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => setEditingId(op.id)}
                        className="text-medical-blue hover:text-medical-dark mr-3"
                      >
                        {t('edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(op.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        {t('delete')}
                      </button>
                    </td>
                  </tr>
                )
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
