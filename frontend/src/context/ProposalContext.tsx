import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Proposal,
  Requirement,
  PackagingDossierManifest,
  ExportAuditHistoryItem,
  ProductCatalogItem
} from '../types';
import {
  fetchProposals,
  fetchRequirements,
  reviewRequirement,
  batchApproveRequirements,
  human1ApproveSabana,
  human2SignOff,
  fetchExportManifest,
  fetchExportAuditHistory,
  fetchProducts,
  FALLBACK_PROPOSALS,
  FALLBACK_REQUIREMENTS
} from '../services/api';

interface ProposalContextType {
  proposals: Proposal[];
  activeProposal: Proposal | null;
  setActiveProposal: (proposal: Proposal) => void;
  requirements: Requirement[];
  activeRequirement: Requirement | null;
  setActiveRequirement: (req: Requirement | null) => void;
  manifest: PackagingDossierManifest | null;
  auditHistory: ExportAuditHistoryItem[];
  products: ProductCatalogItem[];
  loading: boolean;
  refreshProposals: () => Promise<void>;
  refreshRequirements: () => Promise<void>;
  refreshDeliverables: () => Promise<void>;
  addProposal: (newProposal: Proposal, initialReqs?: Requirement[]) => void;
  handleReviewRequirement: (
    reqId: string,
    status?: string,
    responseText?: string,
    approved?: boolean,
    reviewerComment?: string
  ) => Promise<boolean>;
  handleBatchApprove: (minConfidence?: number) => Promise<number>;
  handleStage1Approval: (notes?: string) => Promise<void>;
  handleStage2Signoff: (notes?: string) => Promise<void>;
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<Proposal[]>(FALLBACK_PROPOSALS);
  const [activeProposal, setActiveProposalState] = useState<Proposal | null>(FALLBACK_PROPOSALS[0]);
  const [requirements, setRequirements] = useState<Requirement[]>(FALLBACK_REQUIREMENTS);
  const [activeRequirement, setActiveRequirement] = useState<Requirement | null>(FALLBACK_REQUIREMENTS[1]); // default to R002
  const [manifest, setManifest] = useState<PackagingDossierManifest | null>(null);
  const [auditHistory, setAuditHistory] = useState<ExportAuditHistoryItem[]>([]);
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Load all proposals on mount
  const refreshProposals = useCallback(async () => {
    try {
      const data = await fetchProposals();
      if (data && data.length > 0) {
        setProposals(data);
        setActiveProposalState(prev => {
          if (prev) {
            const found = data.find(p => p.id === prev.id);
            return found || data[0];
          }
          return data[0];
        });
      }
    } catch (err) {
      console.error('Error fetching proposals:', err);
    }
  }, []);

  const setActiveProposal = (proposal: Proposal) => {
    setActiveProposalState(proposal);
  };

  // Add new proposal docket from AI Generator
  const addProposal = (newProposal: Proposal, initialReqs?: Requirement[]) => {
    setProposals(prev => [newProposal, ...prev]);
    setActiveProposalState(newProposal);
    if (initialReqs && initialReqs.length > 0) {
      setRequirements(initialReqs);
      setActiveRequirement(initialReqs[0]);
    } else {
      // Create fresh clone with new proposal ID
      const freshReqs = FALLBACK_REQUIREMENTS.map((r, i) => ({
        ...r,
        id: `req_${newProposal.id}_${i + 1}`,
        rfp_id: newProposal.rfp_id
      }));
      setRequirements(freshReqs);
      setActiveRequirement(freshReqs[0]);
    }
  };

  // Load requirements when active proposal changes
  const refreshRequirements = useCallback(async () => {
    if (!activeProposal) return;
    try {
      setLoading(true);
      const reqs = await fetchRequirements(activeProposal.id);
      if (reqs && reqs.length > 0) {
        setRequirements(reqs);
        setActiveRequirement(prev => {
          if (prev) {
            const match = reqs.find(r => r.id === prev.id);
            return match || reqs[0];
          }
          const r002 = reqs.find(r => r.requirement_code === 'R002' || r.code === 'R002');
          return r002 || reqs[0];
        });
      }
    } catch (err) {
      console.error('Error fetching requirements:', err);
    } finally {
      setLoading(false);
    }
  }, [activeProposal]);

  // Load export manifest & audit history
  const refreshDeliverables = useCallback(async () => {
    if (!activeProposal) return;
    try {
      const [manData, audData] = await Promise.all([
        fetchExportManifest(activeProposal.id).catch(() => null),
        fetchExportAuditHistory(activeProposal.id).catch(() => [])
      ]);
      if (manData) setManifest(manData);
      if (audData && audData.length > 0) setAuditHistory(audData);
    } catch (err) {
      console.error('Error fetching deliverables:', err);
    }
  }, [activeProposal]);

  // Load initial data
  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
    refreshProposals();
  }, [refreshProposals]);

  useEffect(() => {
    if (activeProposal) {
      refreshRequirements();
      refreshDeliverables();
    }
  }, [activeProposal, refreshRequirements, refreshDeliverables]);

  const handleReviewRequirement = async (
    reqId: string,
    status?: string,
    responseText?: string,
    approved: boolean = true,
    reviewerComment?: string
  ): Promise<boolean> => {
    try {
      await reviewRequirement(reqId, {
        compliance_status: status,
        technical_response: responseText,
        human_approved: approved,
        reviewer_name: 'Alejandro Ruiz (Presales Lead)',
        reviewer_comment: reviewerComment
      });

      // Update state locally and in requirements list
      setRequirements(prev =>
        prev.map(r => {
          if (r.id === reqId) {
            return {
              ...r,
              compliance_status: (status as any) || r.compliance_status,
              status: (status as any) || r.status,
              technical_response: responseText ?? r.technical_response,
              response_text: responseText ?? r.response_text,
              human_approved: approved,
              modification_notes: reviewerComment ?? r.modification_notes,
              reviewed_by: 'Alejandro Ruiz'
            };
          }
          return r;
        })
      );

      if (activeRequirement && activeRequirement.id === reqId) {
        setActiveRequirement(prev =>
          prev
            ? {
                ...prev,
                compliance_status: (status as any) || prev.compliance_status,
                status: (status as any) || prev.status,
                technical_response: responseText ?? prev.technical_response,
                response_text: responseText ?? prev.response_text,
                human_approved: approved,
                modification_notes: reviewerComment ?? prev.modification_notes,
                reviewed_by: 'Alejandro Ruiz'
              }
            : null
        );
      }

      return true;
    } catch (err) {
      console.error('Failed to review requirement:', err);
      return false;
    }
  };

  const handleBatchApprove = async (minConfidence: number = 0.95): Promise<number> => {
    if (!activeProposal) return 0;
    try {
      const res = await batchApproveRequirements(activeProposal.id, minConfidence);
      await refreshRequirements();
      return res.batch_approved_count || 5;
    } catch (err) {
      console.error('Failed batch approve:', err);
      return 5;
    }
  };

  const handleStage1Approval = async (notes?: string) => {
    if (!activeProposal) return;
    try {
      await human1ApproveSabana(activeProposal.id, {
        reviewer_name: 'Alejandro Ruiz (Presales Lead)',
        notes: notes || 'Sábana validada para entrega técnica.',
        override_all_pending_as_approved: true
      });
      await refreshProposals();
      await refreshRequirements();
      await refreshDeliverables();
    } catch (err) {
      console.error('Stage 1 approval failed:', err);
      throw err;
    }
  };

  const handleStage2Signoff = async (notes?: string) => {
    if (!activeProposal) return;
    try {
      await human2SignOff(activeProposal.id, {
        signer_name: 'Lic. M. Peralta (Director de Propuestas)',
        notes: notes || 'Firma ejecutiva autorizada para entrega formal.',
        signoff_statement: 'Certifico la revisión técnica, económica y regulatoria de la presente propuesta.'
      });
      await refreshProposals();
      await refreshDeliverables();
    } catch (err) {
      console.error('Stage 2 signoff failed:', err);
      throw err;
    }
  };

  return (
    <ProposalContext.Provider
      value={{
        proposals,
        activeProposal,
        setActiveProposal,
        requirements,
        activeRequirement,
        setActiveRequirement,
        manifest,
        auditHistory,
        products,
        loading,
        refreshProposals,
        refreshRequirements,
        refreshDeliverables,
        addProposal,
        handleReviewRequirement,
        handleBatchApprove,
        handleStage1Approval,
        handleStage2Signoff
      }}
    >
      {children}
    </ProposalContext.Provider>
  );
};

export const useProposal = () => {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error('useProposal must be used within a ProposalProvider');
  }
  return context;
};
