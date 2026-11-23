// Colores fijos por familia de caso (guía visual, no cambian con el acento del usuario)
const CASE_COLORS = {
  unbonded: '#ADD9BD',
  therapeutic: '#D98E04',
  diagnostics: '#F2D544',
  retainer: '#6B87BF',
  // CT's: mezcla unbonded + therapeutic (puede ser cualquiera de los dos)
  cts: 'linear-gradient(135deg, #ADD9BD 0%, #ADD9BD 50%, #D98E04 50%, #D98E04 100%)',
};

function getCaseMeta(description) {
  const d = description.toLowerCase();

  // Diagnóstico va primero: cualquier "diag" es amarillo
  if (d.includes('diag')) {
    return { color: CASE_COLORS.diagnostics, colorMode: 'solid' };
  }
  // CT's genérico (sin diag): degradado unbonded+therapeutic
  if (d.startsWith("ct's") || d.startsWith('cts')) {
    return { color: CASE_COLORS.cts, colorMode: 'gradient' };
  }
  if (d.includes('unbonded')) {
    return { color: CASE_COLORS.unbonded, colorMode: 'solid' };
  }
  if (d.includes('therapeutic')) {
    return { color: CASE_COLORS.therapeutic, colorMode: 'solid' };
  }
  if (d.includes('retainer')) {
    return { color: CASE_COLORS.retainer, colorMode: 'solid' };
  }
  return { color: null, colorMode: null };
}

// Helper para no repetir el spread en cada operación
const op = (type, description, points) => ({
  type,
  description,
  points,
  ...getCaseMeta(description),
});

export const departmentOperations = {
  di: {
    name: 'DI',
    operations: [
      op('DI', 'Unbonded therapeutic initial', 0.044),
      op('DI', 'Unbonded therapeutic CT suppl', 0.145),
      op('DI', 'Unbonded therapeutic init CT suppl', 0.207),
      op('DI', 'unbonded therapeutic update', 0.047),
      op('DI', 'Retainer stand-alone model', 0.05),
      op('DI', 'Diagonstic model stl', 0.048),
      op('DI', 'Therapeutic initial 3rd party', 0.11),
      op('DI', 'Therapeutic update 3rd party', 0.12),
      op('DI', 'Therapeutic update Ling 3rd party', 0.13),
    ],
    hasPTS: false,
  },
  modeling: {
    name: 'Modeling',
    operations: [
      op('Modeling', 'Unbonded', 0.25),
      op('Modeling', 'Diagnostics', 0.15),
      op('Modeling', 'Retainers SA', 0.25),
      op('Modeling', 'Therapeutic', 0.333),
      op('Modeling', "CT's", 0.3),
      op('Modeling', "CT's Suppl", 0.417),
      op('Modeling', "CT's Diag", 0.208),
      op('Modeling', "CT's Diag Suppl", 0.244),
    ],
    ptsOperations: [
      op('PTS', 'Diagnostics', 0.083),
      op('PTS', 'Retainers SA', 0.12),
      op('PTS', 'Unbonded', 0.133),
      op('PTS', 'Therapeutic', 0.133),
      op('PTS', "CT's / Suppl", 0.133),
      op('PTS', 'Unbonded Suppl', 0.164),
    ],
    hasPTS: true,
  },
  qc: {
    name: 'QC',
    operations: [
      op('QC', 'Unbonded therapeutic initial', 0.035),
      op('QC', 'Unbonded therapeutic CT suppl', 0),
      op('QC', 'Unbonded therapeutic init CT suppl', 0),
      op('QC', 'unbonded therapeutic update', 0.035),
      op('QC', 'Retainer stand-alone model', 0),
      op('QC', 'Diagonstic model stl', 0.018),
      op('QC', 'Therapeutic initial 3rd party', 0.035),
      op('QC', 'Therapeutic update 3rd party', 0.035),
      op('QC', 'Therapeutic update Ling 3rd party', 0.035),
    ],
    hasPTS: false,
  },
};

export const QUALITY_THRESHOLD = 83;