import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function OperationEditor({ operation, onCancel, onSave }) {
  const [formData, setFormData] = useState({
    diagnose: operation.diagnose || '',
    anasthesie_typ: operation.anasthesie_typ || '',
    dauer_min: operation.dauer_min || 0,
    blutverlust_ml: operation.blutverlust_ml || 0,
    pathologie_befund: operation.pathologie_befund || '',
    op_verlauf: operation.op_verlauf || '',
    lagerung: operation.lagerung || ''
  });
  const { token } = useAuth();
  const { t } = useLanguage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('_min') || name.includes('_ml') ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await fetch(`/api/ops/${operation.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      onSave();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-medical-light p-4 rounded-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('diagnose')}
          </label>
          <input
            type="text"
            name="diagnose"
            value={formData.diagnose}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('anasthesieTyp')}
          </label>
          <input
            type="text"
            name="anasthesie_typ"
            value={formData.anasthesie_typ}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('duration')}
          </label>
          <input
            type="number"
            name="dauer_min"
            value={formData.dauer_min}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('bloodLoss')}
          </label>
          <input
            type="number"
            name="blutverlust_ml"
            value={formData.blutverlust_ml}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lagerung
          </label>
          <input
            type="text"
            name="lagerung"
            value={formData.lagerung}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('pathology')}
        </label>
        <textarea
          name="pathologie_befund"
          value={formData.pathologie_befund}
          onChange={handleChange}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          OP-Verlauf
        </label>
        <textarea
          name="op_verlauf"
          value={formData.op_verlauf}
          onChange={handleChange}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-medical-blue"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-medical-blue text-white rounded-lg hover:bg-medical-dark transition"
        >
          {t('save')}
        </button>
      </div>
    </form>
  );
}
