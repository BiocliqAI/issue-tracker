import type { IssueCategory, IssuePriority, IssueStatus } from '../types/issue.ts';

export const ISSUE_CATEGORIES: IssueCategory[] = ['Urologiq', 'Corsight', 'Oneview', 'Infrastructure', 'Other'];

export const ISSUE_STATUSES: IssueStatus[] = ['New', 'In Progress', 'Awaiting Customer', 'Resolved', 'Closed'];

export const ISSUE_PRIORITIES: IssuePriority[] = ['Low', 'Medium', 'High', 'Critical'];

export const SLA_OPTIONS = ['On Track', 'At Risk', 'Breached'] as const;

export const ASSIGNABLE_USERS = [
  { name: 'Ravichandar N', email: 'n.ravi@biocliq.com' },
  { name: 'Syed Furqan Azeez', email: 'Furqan.azeez@biocliq.com' },
  { name: 'B Rengarajan', email: 'renga@biocliq.com' },
  { name: 'Apeksha Sakegaonkar', email: 'apeksha@biocliq.com' },
  { name: 'Shivam Gaikwad', email: 'shivam@biocliq.com' },
  { name: 'Aamir Mohammed Shariff', email: 'aamir@biocliq.com' },
  { name: 'Shashi kiran km', email: 'shashikiran@biocliq.com' },
  { name: 'Yogesh Jadhav', email: 'yogesh@biocliq.com' },
  { name: 'Nayab Fathima', email: 'nayab@biocliq.com' },
  { name: 'Swapnil Patil', email: 'swapnil@biocliq.com' },
  { name: 'Akhila KR', email: 'akhila@biocliq.com' },
  { name: 'Mohammed Faisal Jamal Sabri', email: 'faisal@biocliq.com' },
  { name: 'Sanket Dhumal', email: 'sanket@biocliq.com' },
  { name: 'Mohd Irfanullah Khatib I', email: 'irfan@biocliq.com' },
  { name: 'Joyshree Debbarma', email: 'joyshree@biocliq.com' },
  { name: 'Hari Om Swarup S A', email: 'hariomswarup@biocliq.com' },
  { name: 'Amit Kumar', email: 'amit@biocliq.com' },
];
