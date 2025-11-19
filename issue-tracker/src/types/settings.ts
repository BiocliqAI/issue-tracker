import type { IssueCategory } from './issue.ts';

export type RoutingSettings = {
  defaultAssignees: Record<IssueCategory, string>;
  escalationContacts: string[];
  watchers: string[];
};

export const defaultRoutingSettings: RoutingSettings = {
  defaultAssignees: {
    Urologiq: '',
    Corsight: '',
    Oneview: '',
    Infrastructure: '',
    Other: '',
  },
  escalationContacts: [],
  watchers: [],
};
