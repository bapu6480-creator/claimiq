export type Role = 'adjuster' | 'admin';

export type Stage =
  | 'Submitted'
  | 'Validated'
  | 'Extracted'
  | 'Under Review'
  | 'Approved/Rejected'
  | 'Paid';

export const STAGES: Stage[] = [
  'Submitted',
  'Validated',
  'Extracted',
  'Under Review',
  'Approved/Rejected',
  'Paid',
];

export type ClaimType =
  | 'Auto'
  | 'Property'
  | 'Health'
  | 'Liability'
  | 'Travel'
  | 'Workers Comp';

export type ClaimStatus = 'open' | 'closed';

export interface ClaimDocument {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'policy' | 'report';
  pages: number;
  uploadedAt: string;
  sizeKb: number;
}

export interface TimelineEvent {
  stage: Stage;
  status: 'done' | 'current' | 'pending';
  timestamp: string | null;
  note: string;
}

export interface ChatCitation {
  file: string;
  page: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: ChatCitation[];
  timestamp: string;
}

export interface Claim {
  id: string;
  claimant: string;
  type: ClaimType;
  stage: Stage;
  status: ClaimStatus;
  amount: number;
  filedDate: string;
  closedDate: string | null;
  description: string;
  adjuster: string;
  documents: ClaimDocument[];
  timeline: TimelineEvent[];
  chat: ChatMessage[];
}

export interface Kpis {
  totalClaims: number;
  pendingReview: number;
  approvedAmount: number;
  avgDaysToClose: number;
}

export interface StageCount {
  stage: Stage;
  count: number;
}

export interface TypeCount {
  type: ClaimType;
  count: number;
}

export interface MonthCount {
  month: string;
  count: number;
}

export interface GlobalChatCitation {
  claimId: string;
  file: string;
  page: number;
}

export interface GlobalChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  citations?: GlobalChatCitation[];
  claimIds?: string[];
  timestamp: string;
}
