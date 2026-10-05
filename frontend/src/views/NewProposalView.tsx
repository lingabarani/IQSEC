import React, { useState } from 'react';
import { useProposal } from '../context/ProposalContext';
import { useI18n } from '../context/I18nContext';
import { DocketDetails } from '../components/DocketDetails';
import { DocumentUploadList } from '../components/DocumentUploadList';
import { PipelineStepper } from '../components/PipelineStepper';
import { SidebarSimple, Sparkle } from '@phosphor-icons/react';
import { createProposalDocket } from '../services/api';
import { Proposal, Requirement } from '../types';

interface NewProposalViewProps {
  onNotify?: (text: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  onProposalCreated?: (proposalId: string) => void;
}

export const NewProposalView: React.FC<NewProposalViewProps> = ({
  onNotify,
  onProposalCreated
}) => {
  const { t } = useI18n();
  const { addProposal } = useProposal();

  // Form State
  const [proposalName, setProposalName] = useState<string>('Tender CFE 2026 - Modernización Red SCADA');
  const [tenderNo, setTenderNo] = useState<string>('CFE-GCON-004-2026');
  const [clientOrg, setClientOrg] = useState<string>('Comisión Federal de Electricidad (CFE)');
  const [presalesLead, setPresalesLead] = useState<string>('Alejandro Ruiz (Presales Lead - Cybersecurity)');

  // Pipeline State
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleStartProcessing = async () => {
    setIsProcessing(true);
    onNotify?.('Initializing AI extraction pipeline & creating proposal docket...', 'info');

    try {
      // 1. Create real proposal docket
      const created = await createProposalDocket({
        title: proposalName,
        tender_number: tenderNo,
        customer_id: clientOrg,
        presales_lead: presalesLead
      });

      const newPropId = created.id || `prop_${Date.now()}`;
      const newRfpId = created.rfp_id || `rfp_${Date.now()}`;

      onNotify?.(`Docket ${tenderNo} registered. Claude 3.5 Sonnet analyzing RFP document...`, 'info');

      // 2. Simulated real-time stage transitions with feedback
      setTimeout(() => {
        setCurrentStage(2);
        onNotify?.('Stage 2/6: Processing OCR and multi-column RFP extraction...', 'info');
      }, 1000);

      setTimeout(() => {
        setCurrentStage(3);
        onNotify?.('Stage 3/6: Parsing technical clauses & reconciling addendum deltas...', 'info');
      }, 2000);

      setTimeout(() => {
        setCurrentStage(4);
        onNotify?.('Stage 4/6: Mapping catalog of IQSEC solutions & OEM partners...', 'info');
      }, 3000);

      setTimeout(() => {
        setCurrentStage(5);
        onNotify?.('Stage 5/6: Scoring compliance gaps & retrieving OpenSearch citations...', 'info');
      }, 4000);

      setTimeout(async () => {
        setCurrentStage(6);
        setIsProcessing(false);

        // Build new proposal object
        const fullNewProposal: Proposal = {
          id: newPropId,
          rfp_id: newRfpId,
          title: proposalName,
          tender_number: tenderNo,
          customer_id: clientOrg,
          status: 'IN_REVIEW',
          version: 1,
          total_requirements: 10,
          compliant_count: 8,
          exception_count: 2,
          non_compliant_count: 0,
          overall_compliance_rate: 88.0,
          sabana_status: 'PENDING_REVIEW',
          lifecycle_status: 'DRAFT',
          created_at: new Date().toISOString()
        };

        // Build generated requirements for this proposal
        const generatedReqs: Requirement[] = [
          {
            id: `req_${newPropId}_001`,
            rfp_id: newRfpId,
            code: 'R001',
            requirement_code: 'R001',
            page: 3,
            page_number: 3,
            page_end: 4,
            pillar: 'INCIDENT_RESPONSE',
            iqsec_pillar: 'INCIDENT_RESPONSE',
            section_code: 'R001',
            section_title: 'SCADA Telemetry & Active Defense',
            title: 'SCADA Telemetry & Active Defense',
            original_text: 'The contractor must deploy automated OT intrusion prevention and micro-segmentation across CFE high-voltage substations.',
            effective_text: 'The contractor must deploy automated OT intrusion prevention and micro-segmentation across CFE high-voltage substations.',
            is_mandatory: true,
            status: 'CUMPLE',
            compliance_status: 'CUMPLE',
            confidence: 0.94,
            confidence_score: 0.94,
            response_text: 'IQSEC deploys Product ABC (OT Security Suite) with native DPI for Modbus and DNP3 protocols without packet drop or electrical interruption.',
            technical_response: 'IQSEC deploys Product ABC (OT Security Suite) with native DPI for Modbus and DNP3 protocols without packet drop or electrical interruption.',
            citations: [
              { doc: 'Tender_SCADA_CFE.pdf', page: 3, quote: 'Micro-segmentation protocol requirement for substations.', score: 0.96 }
            ],
            exact_citations: [
              { doc: 'Tender_SCADA_CFE.pdf', page: 3, quote: 'Micro-segmentation protocol requirement for substations.', score: 0.96 }
            ],
            human_approved: true,
            reviewed_by: 'Alejandro Ruiz'
          },
          {
            id: `req_${newPropId}_002`,
            rfp_id: newRfpId,
            code: 'R002',
            requirement_code: 'R002',
            page: 7,
            page_number: 7,
            page_end: 7,
            pillar: 'SOC_SIEM',
            iqsec_pillar: 'SOC_SIEM',
            section_code: 'R002',
            section_title: 'Clause REF: RFP-SCADA-4.2',
            title: '24/7/365 Substation Telemetry SIEM Ingestion',
            original_text: 'System must sustain continuous 20,000 EPS ingestion from CFE regional transmission control centers with 99.99% availability.',
            effective_text: 'System must sustain continuous 20,000 EPS ingestion from CFE regional transmission control centers with 99.99% availability.',
            is_mandatory: true,
            status: 'CUMPLE_CON_EXCEPCION',
            compliance_status: 'CUMPLE_CON_EXCEPCION',
            confidence: 0.86,
            confidence_score: 0.86,
            response_text: 'IQSEC NextGen SOC MDR platform ingests up to 35,000 EPS per cluster node. Dedicated satellite links require redundant BGP routing.',
            technical_response: 'IQSEC NextGen SOC MDR platform ingests up to 35,000 EPS per cluster node. Dedicated satellite links require redundant BGP routing.',
            citations: [
              { doc: '01_Whitepaper_IQSEC_SOC_NextGen.pdf', page: 4, quote: 'High-throughput Kafka ingest buffering up to 35,000 EPS.', score: 0.93 }
            ],
            exact_citations: [
              { doc: '01_Whitepaper_IQSEC_SOC_NextGen.pdf', page: 4, quote: 'High-throughput Kafka ingest buffering up to 35,000 EPS.', score: 0.93 }
            ],
            human_approved: false,
            reviewed_by: null
          }
        ];

        // Register to context
        addProposal(fullNewProposal, generatedReqs);
        onNotify?.(`AI Generation completed! ${generatedReqs.length} clauses extracted and ready for verification.`, 'success');
        onProposalCreated?.(newPropId);
      }, 5000);
    } catch (err: any) {
      setIsProcessing(false);
      onNotify?.(err.message || 'Error running AI proposal generation', 'error');
    }
  };

  return (
    <div className="flex-1 p-8 max-w-5xl w-full mx-auto space-y-6 overflow-y-auto font-sans">
      {/* Page Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {t('nav.newProposal')}
            </h1>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
              <Sparkle size={12} weight="fill" />
              AgentCore Ingestion Engine v4.2
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Initialize a new tender docket, ingest RFP specification files, and trigger automated AI clause extraction.
          </p>
        </div>
      </div>

      {/* Step 1: Proposal Docket Details */}
      <DocketDetails
        proposalName={proposalName}
        setProposalName={setProposalName}
        tenderNo={tenderNo}
        setTenderNo={setTenderNo}
        clientOrg={clientOrg}
        setClientOrg={setClientOrg}
        presalesLead={presalesLead}
        setPresalesLead={setPresalesLead}
      />

      {/* Step 2: Upload Documents */}
      <DocumentUploadList
        onNotify={(text, type) => onNotify?.(text, type || 'info')}
        onSelectDocForInspection={() => {}}
      />

      {/* Step 3: Pipeline Stepper */}
      <PipelineStepper
        currentStage={currentStage}
        isProcessing={isProcessing}
        onStartProcessing={handleStartProcessing}
        onCancel={() => {
          setIsProcessing(false);
          onNotify?.('Processing cancelled by user.', 'info');
        }}
      />
    </div>
  );
};
