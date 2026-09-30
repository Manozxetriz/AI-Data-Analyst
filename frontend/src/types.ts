export type PageId =
  | 'dashboard'
  | 'sales'
  | 'products'
  | 'schools'
  | 'ai-analyst'
  | 'agent-runs';

export interface StatMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  period: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  icon?: string;
}

export interface SalesTransaction {
  id: string;
  orderNumber: string;
  institutionName: string;
  districtCode: string;
  date: string;
  amount: number;
  itemsCount: number;
  status: 'Settled' | 'Pending Verification' | 'Processing' | 'Flagged Audit';
  category: 'Diagnostic Assessments' | 'Clinical Protocols' | 'Digital District Licenses' | 'Lab Consumables';
  paymentTerms: 'Net 30' | 'Net 60' | 'Direct Wire' | 'Institutional Grant';
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  category: 'Diagnostic Assessment' | 'Curriculum Kit' | 'Digital License' | 'Lab Consumable' | 'Clinical Protocol';
  stockLevel: number;
  reorderPoint: number;
  unitPrice: number;
  institutionalBulkPrice: number;
  batchLot: string;
  complianceStandard: 'FDA Class I' | 'FERPA Compliant' | 'ISO 13485' | 'COPPA Verified';
  lastQualityAudit: string;
  status: 'In Stock' | 'Low Stock' | 'Backordered' | 'Reserved';
}

export interface EducationalInstitution {
  id: string;
  institutionCode: string;
  name: string;
  district?: string;
  districtCode?: string;
  state: string;
  institutionTier: 'Metropolitan District' | 'Clinical Academy' | 'University Health' | 'Regional Consortium';
  activeEnrollment: number;
  licensedSeats: number;
  annualContractValue: number;
  contractExpiry: string;
  renewalStatus: 'Active Compliant' | 'Pending Review' | 'Renewal Impending' | 'Audit Action Required';
  clinicalLead: string;
  leadEmail: string;
}

export interface AgentStep {
  stepIndex: number;
  timestamp: string;
  action: string;
  latencyMs: number;
  status: 'success' | 'warning' | 'info';
  metadataNotes?: string;
}

export interface AgentRun {
  id: string;
  agentIdentifier: string;
  agentName: string;
  triggerSource: 'Automated Schedule' | 'Procurement Webhook' | 'Discrepancy Invariant' | 'Manual Analyst Execution';
  executionStatus: 'Completed' | 'Running' | 'Queued' | 'Action Flagged';
  durationSeconds: number;
  recordsEvaluated: number;
  startedAt: string;
  completedAt?: string;
  auditSummary: string;
  telemetryLogs: AgentStep[];
}

export interface AIAnalysisInsight {
  id: string;
  headline: string;
  summary: string;
  category: 'Revenue Optimization' | 'Procurement Risk' | 'Compliance Drift' | 'Inventory Velocity';
  severity: 'low' | 'medium' | 'high';
  confidenceScore: number;
  keyFindings: string[];
  interventions: string[];
  impactMetric: {
    label: string;
    value: string;
    direction: 'positive' | 'negative' | 'neutral';
  };
}
