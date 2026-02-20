import crypto from 'crypto';

export function hashPatientId(patientId) {
  return crypto.createHash('sha256').update(patientId).digest('hex');
}

export function generateOpId(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `OP-${year}-${month}-${day}`;
}

export function checkMandatoryFields(operation) {
  const missing = [];

  if (!operation.datum) missing.push('datum');
  if (!operation.diagnose || operation.diagnose === '') missing.push('diagnose');
  if (!operation.anasthesie_typ || operation.anasthesie_typ === '') missing.push('anasthesie_typ');
  if (!operation.dauer_min || operation.dauer_min === 0) missing.push('dauer_min');
  if (!operation.pathologie_befund) missing.push('pathologie_befund');
  if (operation.blutverlust_ml === null || operation.blutverlust_ml === undefined) missing.push('blutverlust_ml');

  return missing;
}
