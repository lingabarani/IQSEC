import React, { createContext, useContext, useState, useEffect } from 'react';

export type Locale = 'en' | 'es';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Brand & Global
    'brand.title': 'IQSEC',
    'brand.subtitle': 'AI PROPOSAL GENERATOR',
    'global.saveDraft': 'Save as Draft',
    'global.cancel': 'Cancel',
    'global.humanReview': 'Human Review',
    'global.search': 'Search...',
    'global.filter': 'Filter',
    'global.loading': 'Loading data...',
    'global.actions': 'Actions',
    'global.status': 'Status',
    'global.refresh': 'Refresh',

    // Navigation Items
    'nav.dashboard': 'Dashboard',
    'nav.requirements': 'Requirements',
    'nav.compliance': 'Compliance',
    'nav.evidence': 'Evidence',
    'nav.products': 'Products',
    'nav.clarifications': 'Clarifications',
    'nav.validation': 'Validation',
    'nav.outputs': 'Outputs',
    'nav.newProposal': 'New Proposal',

    // Header & User
    'header.proposals': 'Proposals',
    'header.activeProposal': 'Active Proposal',
    'header.presalesLead': 'Presales Lead',
    'header.switchProposal': 'Switch Proposal',

    // Requirement Verification View
    'req.verificationTitle': 'Requirement Verification',
    'req.progressLabel': 'PROGRESS',
    'req.validated': 'Validated',
    'req.ofClauses': 'of {total} clauses',
    'req.needsReview': 'Needs Review',
    'req.approved': 'Approved',
    'req.partialCompliance': 'Partial Compliance',
    'req.fullCompliance': 'Full Compliance',
    'req.nonCompliance': 'Non-Compliance',
    'req.tabOverview': 'Overview',
    'req.tabDetail': 'Detail View',
    'req.tabComplianceMatrix': 'Compliance Matrix',
    'req.tabEvidenceLocker': 'Evidence Locker',
    'req.clauseRef': 'Clause Ref',
    'req.categoryPillar': 'Category / Pillar',
    'req.aiResult': 'AI Analysis & Triage',
    'req.latency': 'latency',
    'req.productMapping': 'Product Mapping',
    'req.manufacturer': 'Manufacturer',
    'req.aiResponse': 'AI Response / Technical Rationale',
    'req.evidenceSource': 'Evidence Source & Grounding',
    'req.viewEvidence': 'View Evidence',
    'req.hash': 'Hash',
    'req.humanReviewActions': 'Human Review & Presales Rationale',
    'req.approve': 'Approve',
    'req.reject': 'Reject',
    'req.editFlag': 'Edit / Flag',
    'req.presalesPlaceholder': 'Presales technical rationale, configuration notes, or tender exceptions...',
    'req.saveDraft': 'Save Draft',
    'req.saveAndNext': 'Save & Next →',
    'req.clauseNavigator': 'Clause Navigator',
    'req.searchClauses': 'Search clauses...',
    'req.filterAll': 'All',
    'req.filterFlagged': 'Flagged',
    'req.filterValidated': 'Validated',
    'req.tenderSpecs': 'Tender Specifications',
    'req.issuingAuthority': 'Issuing Authority',
    'req.deadline': 'Submission Deadline',
    'req.leadArchitect': 'Lead Architect',
    'req.valueTarget': 'Value Target',

    // Outputs & Deliverables View
    'out.title': 'Proposal Outputs & Deliverables',
    'out.subtitle': 'Release Pipeline — Multi-format Artifact Compilation & Cryptographic Packaging',
    'out.regenerateAll': 'Regenerate All',
    'out.finalSubmissionCheck': 'Final Submission Check',
    'out.batchDownload': 'Batch Download All (.ZIP)',
    'out.requirementsSheet': 'Requirements Sheet (.xlsx)',
    'out.requirementsDesc': 'Official Color-coded Sábana Matrix with row-by-row compliance tags',
    'out.technicalProposal': 'Technical Proposal (.docx / .pdf)',
    'out.technicalDesc': 'Comprehensive proposal document grounded in ISO 27001 & CMMI-3',
    'out.economicProposal': 'Economic Proposal (.xlsx / .pdf)',
    'out.economicDesc': 'SKU catalogue pricing, 36-month OPEX breakdown, and rate cards',
    'out.executiveDeck': 'Executive Presentation (.pptx)',
    'out.executiveDesc': 'High-level C-Suite deck with architecture schematics and SLA commitments',
    'out.download': 'Download',
    'out.preview': 'Preview',
    'out.packagingDossier': 'Packaging Dossier',
    'out.submissionReadiness': 'Submission Readiness',
    'out.manifestChecklist': 'Integrity Manifest',
    'out.legalSignoff': 'Legal Sign-off (Verified)',
    'out.technicalSigned': 'Technical Review (Signed)',
    'out.financialReview': 'Financial Structure (Validated)',
    'out.cryptoIntegrity': 'Cryptographic Integrity (Locked)',
    'out.signOffAuthority': 'Sign-off Authority',
    'out.downloadCompletePackage': 'Download Complete Package (.ZIP)',
    'out.auditTrailTitle': 'Export History & Cryptographic Audit Trail',
    'out.tamperEvident': 'Tamper-Evident SHA-256 Hashes',
    'out.thArtifact': 'Artifact Name',
    'out.thVersion': 'Version',
    'out.thFormat': 'Format',
    'out.thTriggeredBy': 'Triggered By',
    'out.thTimestamp': 'Timestamp',
    'out.thChecksum': 'SHA-256 Checksum',
    'out.thStatus': 'Integrity',
    'out.thActions': 'Actions',

    // Compliance Statuses
    'status.CUMPLE': 'Complies (100%)',
    'status.CUMPLE_CON_EXCEPCION': 'Complies with Exception',
    'status.EXCEPCION': 'Exception Required',
    'status.NO_CUMPLE': 'Does Not Comply',
    'status.ACLARACION': 'Requires Clarification',
    'status.REQUIERE_ACLARACION': 'Clarification Pending',

    // Products View
    'prod.title': 'Products & OEM Partner Catalog',
    'prod.subtitle': 'Certified cybersecurity capabilities, pre-configured SKUs, and service tiers',
    'prod.sku': 'SKU',
    'prod.tier': 'Tier / Level',
    'prod.capabilities': 'Capabilities & Features',

    // Clarifications View
    'clar.title': 'Junta de Aclaraciones — Addendum Reconciler',
    'clar.subtitle': 'Automated delta detection between RFP baseline and post-addendum modifications',
    'clar.originalText': 'Original RFP Text',
    'clar.effectiveText': 'Effective Modified Clause',
    'clar.addendumRef': 'Addendum Reference',

    // Validation Queue View
    'val.title': 'Governance & Validation Queue',
    'val.subtitle': 'Two-stage human-in-the-loop review and executive sign-off authority',
    'val.stage1': 'Stage 1: Pre-Sales Technical Sábana Review',
    'val.stage2': 'Stage 2: Final Proposal Executive Sign-off'
  },
  es: {
    // Brand & Global
    'brand.title': 'IQSEC',
    'brand.subtitle': 'GENERADOR DE PROPUESTAS IA',
    'global.saveDraft': 'Guardar Borrador',
    'global.cancel': 'Cancelar',
    'global.humanReview': 'Revisión Humana',
    'global.search': 'Buscar...',
    'global.filter': 'Filtrar',
    'global.loading': 'Cargando datos...',
    'global.actions': 'Acciones',
    'global.status': 'Estado',
    'global.refresh': 'Actualizar',

    // Navigation Items
    'nav.dashboard': 'Panel Principal',
    'nav.requirements': 'Requerimientos',
    'nav.compliance': 'Cumplimiento',
    'nav.evidence': 'Evidencia RAG',
    'nav.products': 'Catálogo de Soluciones',
    'nav.clarifications': 'Aclaraciones',
    'nav.validation': 'Validación Humana',
    'nav.outputs': 'Entregables y Salidas',
    'nav.newProposal': 'Nueva Propuesta',

    // Header & User
    'header.proposals': 'Propuestas',
    'header.activeProposal': 'Propuesta Activa',
    'header.presalesLead': 'Líder de Preventa',
    'header.switchProposal': 'Cambiar Propuesta',

    // Requirement Verification View
    'req.verificationTitle': 'Verificación de Requerimiento',
    'req.progressLabel': 'PROGRESO',
    'req.validated': 'Validados',
    'req.ofClauses': 'de {total} cláusulas',
    'req.needsReview': 'Requiere Revisión',
    'req.approved': 'Aprobado',
    'req.partialCompliance': 'Cumplimiento Parcial',
    'req.fullCompliance': 'Cumple Totalmente',
    'req.nonCompliance': 'No Cumple',
    'req.tabOverview': 'Resumen General',
    'req.tabDetail': 'Vista Detallada',
    'req.tabComplianceMatrix': 'Matriz de Cumplimiento',
    'req.tabEvidenceLocker': 'Bóveda de Evidencia',
    'req.clauseRef': 'Ref. Cláusula',
    'req.categoryPillar': 'Pilar Tecnológico',
    'req.aiResult': 'Análisis y Triage IA',
    'req.latency': 'latencia',
    'req.productMapping': 'Mapeo de Producto',
    'req.manufacturer': 'Fabricante / Proveedor',
    'req.aiResponse': 'Respuesta Técnica y Justificación IA',
    'req.evidenceSource': 'Fuente de Evidencia y Sustento',
    'req.viewEvidence': 'Ver Evidencia',
    'req.hash': 'Hash Criptográfico',
    'req.humanReviewActions': 'Validación Humana y Criterio Preventa',
    'req.approve': 'Aprobar',
    'req.reject': 'Rechazar',
    'req.editFlag': 'Editar / Observar',
    'req.presalesPlaceholder': 'Justificación técnica de preventa, excepciones del pliego o notas de dimensionamiento...',
    'req.saveDraft': 'Guardar Borrador',
    'req.saveAndNext': 'Guardar y Siguiente →',
    'req.clauseNavigator': 'Navegador de Cláusulas',
    'req.searchClauses': 'Buscar cláusulas...',
    'req.filterAll': 'Todas',
    'req.filterFlagged': 'Observadas',
    'req.filterValidated': 'Validadas',
    'req.tenderSpecs': 'Especificaciones de Licitación',
    'req.issuingAuthority': 'Convocante',
    'req.deadline': 'Fecha Límite de Entrega',
    'req.leadArchitect': 'Arquitecto Líder',
    'req.valueTarget': 'Monto Objetivo',

    // Outputs & Deliverables View
    'out.title': 'Entregables y Salidas de la Propuesta',
    'out.subtitle': 'Pipeline de Compilación — Empaquetado Criptográfico y Formatos Oficiales',
    'out.regenerateAll': 'Regenerar Todo',
    'out.finalSubmissionCheck': 'Verificación de Integridad',
    'out.batchDownload': 'Descarga Masiva (.ZIP)',
    'out.requirementsSheet': 'Sábana de Requerimientos (.xlsx)',
    'out.requirementsDesc': 'Matriz oficial coloreada con evaluación cláusula por cláusula y sustento normativo',
    'out.technicalProposal': 'Propuesta Técnica Formal (.docx / .pdf)',
    'out.technicalDesc': 'Documento exhaustivo con arquitectura técnica alineada a ISO 27001 y CMMI-3',
    'out.economicProposal': 'Propuesta Económica (.xlsx / .pdf)',
    'out.economicDesc': 'Catálogo de partidas presupuestales, proyección OPEX a 36 meses y precios unitarios',
    'out.executiveDeck': 'Presentación Ejecutiva (.pptx)',
    'out.executiveDesc': 'Láminas para comité directivo con esquemas de solución y compromisos de SLA',
    'out.download': 'Descargar',
    'out.preview': 'Previsualizar',
    'out.packagingDossier': 'Expediente de Licitación',
    'out.submissionReadiness': 'Nivel de Preparación',
    'out.manifestChecklist': 'Manifiesto de Integridad',
    'out.legalSignoff': 'Visto Bueno Legal (Verificado)',
    'out.technicalSigned': 'Revisión Técnica (Firmada)',
    'out.financialReview': 'Estructura Financiera (Validada)',
    'out.cryptoIntegrity': 'Integridad Criptográfica (Bloqueada)',
    'out.signOffAuthority': 'Autoridad de Firma',
    'out.downloadCompletePackage': 'Descargar Expediente Completo (.ZIP)',
    'out.auditTrailTitle': 'Historial de Exportaciones y Pistas de Auditoría SHA-256',
    'out.tamperEvident': 'Firmas Criptográficas Inmutables',
    'out.thArtifact': 'Nombre del Entregable',
    'out.thVersion': 'Versión',
    'out.thFormat': 'Formato',
    'out.thTriggeredBy': 'Generado Por',
    'out.thTimestamp': 'Fecha / Hora',
    'out.thChecksum': 'Firma Criptográfica SHA-256',
    'out.thStatus': 'Integridad',
    'out.thActions': 'Acciones',

    // Compliance Statuses
    'status.CUMPLE': 'Cumple Totalmente',
    'status.CUMPLE_CON_EXCEPCION': 'Cumple con Excepción',
    'status.EXCEPCION': 'Excepción Requerida',
    'status.NO_CUMPLE': 'No Cumple',
    'status.ACLARACION': 'Requiere Aclaración',
    'status.REQUIERE_ACLARACION': 'Aclaración en Trámite',

    // Products View
    'prod.title': 'Catálogo de Soluciones y Alianzas OEM',
    'prod.subtitle': 'Capacidades de ciberseguridad certificadas, SKUs preconfigurados y niveles de servicio',
    'prod.sku': 'Clave SKU',
    'prod.tier': 'Nivel de Certificación',
    'prod.capabilities': 'Capacidades y Características',

    // Clarifications View
    'clar.title': 'Junta de Aclaraciones — Conciliador de Adendas',
    'clar.subtitle': 'Detección automática de discrepancias entre el pliego original y las respuestas del convocante',
    'clar.originalText': 'Texto Original del Pliego',
    'clar.effectiveText': 'Cláusula Efectiva Modificada',
    'clar.addendumRef': 'Referencia de la Adenda',

    // Validation Queue View
    'val.title': 'Mesa de Gobierno y Validación',
    'val.subtitle': 'Flujo de revisión en dos etapas con intervención humana y firma ejecutiva',
    'val.stage1': 'Etapa 1: Validación Técnica de Sábana (Preventa)',
    'val.stage2': 'Etapa 2: Firma Ejecutiva y Liberación de Propuesta'
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    return (localStorage.getItem('iqsec_lang') as Locale) || 'en';
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('iqsec_lang', newLocale);
  };

  const t = (key: string, fallback?: string): string => {
    return translations[locale]?.[key] || translations.en?.[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
