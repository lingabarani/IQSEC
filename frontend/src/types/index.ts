export type ComplianceStatus = 
  | 'CUMPLE' 
  | 'CUMPLE_CON_EXCEPCION' 
  | 'EXCEPCION' 
  | 'NO_CUMPLE' 
  | 'ACLARACION' 
  | 'REQUIERE_ACLARACION' 
  | 'COMPLIES' 
  | 'EXCEPTION' 
  | 'DOES_NOT_COMPLY' 
  | 'CLARIFICATION_REQUIRED';

export type IQSECPillar = 
  | 'SOC_SIEM'
  | 'THREAT_INTEL'
  | 'CLOUD_SECURITY'
  | 'INCIDENT_RESPONSE'
  | 'GOVERNANCE_RISK_COMPLIANCE'
  | 'IDENTITY_ACCESS';

export interface Citation {
  doc: string;
  page: number;
  quote: string;
  score: number;
}

export interface Requirement {
  id: string;
  rfp_id?: string;
  code?: string;
  requirement_code?: string;
  page?: number;
  page_number?: number;
  page_end?: number;
  pillar?: IQSECPillar;
  iqsec_pillar?: IQSECPillar;
  section_code?: string;
  section_title?: string;
  title?: string;
  original_text: string;
  effective_text: string;
  is_mandatory?: boolean;
  status?: ComplianceStatus;
  compliance_status?: ComplianceStatus;
  confidence?: number;
  confidence_score?: number;
  response_text?: string;
  technical_response?: string;
  compliance_rationale?: string;
  citations?: Citation[];
  exact_citations?: Citation[];
  human_approved: boolean;
  reviewed_by: string | null;
  modification_notes?: string | null;
  is_modified_by_addendum?: boolean;
  addendum_reference?: string | null;
  addendum_question_num?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Proposal {
  id: string;
  rfp_id: string;
  title: string;
  tender_number: string;
  customer_id: string;
  status: string;
  version: number;
  total_requirements: number;
  compliant_count: number;
  exception_count: number;
  non_compliant_count: number;
  overall_compliance_rate: number;
  sabana_status?: string;
  lifecycle_status?: string;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  environment: string;
  database: string;
  s3_rfp_bucket?: string;
  s3_knowledge_bucket?: string;
  s3_deliverables_bucket?: string;
  opensearch_collection_id?: string;
  version: string;
}

export interface ComplianceSummary {
  total: number;
  cumple: number;
  excepcion: number;
  nocumple: number;
  aclaracion: number;
  approvedCount: number;
  avgConfidence: number;
}

export interface ProductCatalogItem {
  id: string;
  name: string;
  category: string;
  sku: string;
  version: string;
  manufacturer: string;
  tier: string;
  capabilities: string;
  status: string;
}

export interface KnowledgeDocumentItem {
  id: string;
  title: string;
  description?: string;
  pillar: string;
  confidentiality: string;
  customer_scope: string;
  chunk_count: number;
  created_at: string;
}

export interface ExportArtifact {
  id: string;
  name: string;
  filename: string;
  version: string;
  format: string;
  status: string;
  file_size: string;
  clauses_audited?: number;
  verified_citations?: number;
  pages?: number;
  skus_configured?: number;
  slides_planned?: number;
  download_url: string;
}

export interface PackagingDossierManifest {
  proposal_id: string;
  tender_number: string;
  submission_readiness: number;
  ready_deliverables: number;
  target_deliverables: number;
  total_requirements: number;
  human_approved_count: number;
  sign_off_authority: {
    name: string;
    role: string;
    status: string;
  };
  artifacts: ExportArtifact[];
}

export interface ExportAuditHistoryItem {
  id: string;
  artifact_file: string;
  triggered_by: string;
  timestamp: string;
  sha256_checksum: string;
  download_url: string;
}
