const textToHomologate: any = {
  IPS: {
    clientes: "pacientes",
    cliente: "paciente",
    empleado: "médico",
    empleados: "médicos",
    documentos: "historia clínica",
    documento: "historia clínica"
  }
};


export const homologateText = (parent: string, child: string) =>
  textToHomologate?.[parent]?.[child] ?? child;

