export type FeedbackType = 'Complaint' | 'Suggestion' | 'Positive' | 'Safeguarding' | 'Query';
export type FeedbackStatus = 'New' | 'Acknowledged' | 'UnderReview' | 'Escalated' | 'Resolved' | 'Closed';
export type FeedbackPriority = 'Low' | 'Normal' | 'High' | 'Critical';
export type FeedbackChannel = 'Web' | 'Mobile' | 'InPerson' | 'Phone' | 'SuggestionBox' | 'Other';

export interface FeedbackItemDto {
  id: string;
  feedbackCategoryId: string | null;
  referenceNumber: string;
  type: FeedbackType;
  status: FeedbackStatus;
  priority: FeedbackPriority;
  channel: FeedbackChannel;
  description: string;
  submitterName: string | null;
  submitterContact: string | null;
  submitterUserId: string | null;
  isAnonymous: boolean;
  isConfidential: boolean;
  location: string | null;
  projectId: string | null;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  assignedToUserId: string | null;
  assignedToName: string | null;
  slaResponseDeadline: string;
  slaResolutionDeadline: string;
  slaStatus: string;
  responseCount: number;
  createdAt: string;
  responses: FeedbackResponseDto[];
}

export interface FeedbackResponseDto {
  id: string;
  feedbackItemId: string;
  responderUserId: string;
  responderName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface SubmitFeedbackRequest {
  feedbackCategoryId?: string;
  type: FeedbackType;
  priority: FeedbackPriority;
  channel: FeedbackChannel;
  description: string;
  submitterName?: string;
  submitterContact?: string;
  isAnonymous: boolean;
  isConfidential: boolean;
  location?: string;
  projectId?: string;
}

export interface AssignFeedbackRequest {
  feedbackItemId: string;
  assignedToUserId: string;
  assignedToName: string;
}

export interface EscalateFeedbackRequest {
  feedbackItemId: string;
  reason: string;
}

export interface AddFeedbackResponseRequest {
  feedbackItemId: string;
  content: string;
  isInternal: boolean;
}
