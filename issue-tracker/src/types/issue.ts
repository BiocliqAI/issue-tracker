export type IssueCategory = 'Urologiq' | 'Corsight' | 'Oneview' | 'Infrastructure' | 'Other';

export type IssueStatus = 'New' | 'In Progress' | 'Awaiting Customer' | 'Resolved' | 'Closed';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Issue {
  id: string;
  serialNumber: number;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: string | null;
  reporter: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  expectedResolution?: string | null;
  slaBreachRisk?: 'On Track' | 'At Risk' | 'Breached';
  tags?: string[];
  documents?: { name: string; url: string }[];
  isArchived?: boolean;
}

export type IssueFormValues = Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>;

export interface IssueActivity {
  id: string;
  issueId: string;
  actor: string;
  action: 'comment' | 'status_update' | 'assignment' | 'closure';
  message: string;
  timestamp: string;
}

export type IssueFilters = {
  categories: IssueCategory[];
  statuses: IssueStatus[];
  priorities: IssuePriority[];
  assignee?: string;
  showOnlyOpen?: boolean;
  search?: string;
  showArchived?: boolean;
};
