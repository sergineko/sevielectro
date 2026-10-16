import { legalIdentity } from '../src/data/legal-identity.js';

const fields = [
  ['legalName','Nombre legal o razón social'],
  ['ruc','RUC'],
  ['address','Domicilio completo'],
];
const missing = fields.filter(([key]) => typeof legalIdentity[key] !== 'string' || !legalIdentity[key].trim());

if (missing.length) {
  console.error('Identificación pendiente en src/data/legal-identity.js:');
  for (const [,label] of missing) console.error(`- ${label}`);
  process.exitCode = 1;
} else {
  console.log('Los tres datos de identificación están completos.');
  console.log('Compila y publica para actualizar Aviso legal y Privacidad y retirar su aviso de identificación pendiente.');
}
