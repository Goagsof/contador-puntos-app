// Devuelve los departamentos que puede ver un rol
export function getAllowedDepartments(role) {
  switch (role) {
    case 'modeling':
      return ['modeling'];
    case 'di':
      return ['di', 'modeling'];
    case 'qc':
      return ['qc', 'modeling'];
    case 'lider':
    case 'admin':
      return ['di', 'modeling', 'qc'];
    default:
      return ['modeling'];
  }
}

// ¿Puede ver el departamento específico?
export function canViewDepartment(role, department) {
  return getAllowedDepartments(role).includes(department);
}