import {
  Timestamp,
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  updateDoc,
  where,
  type QueryConstraint,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from './firebase.ts';
import type { Issue, IssueActivity, IssueFilters, IssueFormValues } from '../types/issue.ts';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '../constants/issueOptions.ts';

const issuesCollection = collection(db, 'issues');
const countersCollection = collection(db, 'counters');

export const subscribeToIssues = (
  filters: IssueFilters,
  onChange: (issues: Issue[]) => void,
  onError: (error: Error) => void
) => {
  try {
    const constraints: QueryConstraint[] = [orderBy('serialNumber', 'asc')];

    // Filter issues based on showArchived
    if (filters.showArchived) {
      constraints.push(where('isArchived', '==', true));
    } else {
      constraints.push(where('isArchived', '==', false));
    }

    if (filters.categories.length && filters.categories.length < ISSUE_CATEGORIES.length) {
      constraints.push(where('category', 'in', filters.categories));
    }

    if (filters.statuses.length && filters.statuses.length < ISSUE_STATUSES.length) {
      constraints.push(where('status', 'in', filters.statuses));
    }

    if (filters.priorities.length && filters.priorities.length < ISSUE_PRIORITIES.length) {
      constraints.push(where('priority', 'in', filters.priorities));
    }

    if (filters.assignee) {
      constraints.push(where('assignee', '==', filters.assignee));
    }

    const issuesQuery = query(issuesCollection, ...constraints);

    return onSnapshot(issuesQuery, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => {
        const raw = docSnap.data();
        const issue: Issue = {
          id: docSnap.id,
          serialNumber: raw.serialNumber,
          description: raw.description,
          category: raw.category,
          status: raw.status,
          priority: raw.priority,
          assignee: raw.assignee ?? null,
          reporter: raw.reporter,
          customerName: raw.customerName,
          expectedResolution: raw.expectedResolution ?? null,
          slaBreachRisk: raw.slaBreachRisk ?? 'On Track',
          tags: raw.tags ?? [],
          documents: raw.documents ?? [],
          createdAt: (raw.createdAt as Timestamp | undefined)?.toDate().toISOString() ?? raw.createdAt,
          updatedAt: (raw.updatedAt as Timestamp | undefined)?.toDate().toISOString() ?? raw.updatedAt,
          isArchived: raw.isArchived ?? false,
        };
        return issue;
      });

      const filtered = filters.search
        ? data.filter((issue) => {
            const target = `${issue.description} ${issue.customerName ?? ''} ${issue.assignee ?? ''}`.toLowerCase();
            return target.includes(filters.search!.toLowerCase());
          })
        : data;

      onChange(filtered);
    });
  } catch (error) {
    onError(error as Error);
    return () => undefined;
  }
};

export const createIssue = async (values: IssueFormValues, actor: string) => {
  const now = Timestamp.now();
  const issueCounterRef = doc(countersCollection, 'issues');

  const newIssueId = await runTransaction(db, async (transaction) => {
    const issueCounterDoc = await transaction.get(issueCounterRef);
    const newCount = (issueCounterDoc.data()?.count || 0) + 1;

    const newIssueRef = doc(issuesCollection);
    transaction.set(newIssueRef, {
      ...values,
      serialNumber: newCount,
      assignee: values.assignee ?? null,
      tags: values.tags ?? [],
      createdAt: now,
      updatedAt: now,
      isArchived: false, // New issues are not archived by default
    });

    transaction.set(issueCounterRef, { count: newCount });

    return newIssueRef.id;
  });

  await logActivity(newIssueId, {
    action: 'comment',
    actor,
    message: 'Issue created',
  });

  return newIssueId;
};

export const createIssueWithDocument = async (values: IssueFormValues, file: File, actor: string) => {
  const issueId = await createIssue(values, actor);
  const downloadUrl = await uploadDocument(issueId, file);
  await addDocumentToIssue(issueId, { name: file.name, url: downloadUrl });
};

export const updateIssue = async (issueId: string, values: Partial<IssueFormValues>, actor: string, message?: string) => {
  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, {
    ...values,
    updatedAt: Timestamp.now(),
  });

  await logActivity(issueId, {
    action: 'comment',
    actor,
    message: message ?? 'Issue updated',
  });
};

export const updateIssueStatus = async (issueId: string, status: Issue['status'], actor: string) => {
  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, {
    status,
    updatedAt: Timestamp.now(),
  });

  await logActivity(issueId, {
    action: status === 'Closed' ? 'closure' : 'status_update',
    actor,
    message: `Status changed to ${status}`,
  });
};

export const archiveIssue = async (issueId: string, actor: string) => {
  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, {
    isArchived: true,
    updatedAt: Timestamp.now(),
  });

  await logActivity(issueId, {
    action: 'comment',
    actor,
    message: 'Issue archived',
  });
};

export const unarchiveIssue = async (issueId: string, actor: string) => {
  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, {
    isArchived: false,
    updatedAt: Timestamp.now(),
  });

  await logActivity(issueId, {
    action: 'comment',
    actor,
    message: 'Issue unarchived',
  });
};

export const logActivity = async (
  issueId: string,
  activity: Pick<IssueActivity, 'action' | 'actor' | 'message'>
) => {
  const activitiesCollection = collection(db, 'issues', issueId, 'activities');
  await addDoc(activitiesCollection, {
    ...activity,
    timestamp: Timestamp.now(),
  });
};

export const subscribeToActivities = (
  issueId: string,
  onChange: (activities: IssueActivity[]) => void
) => {
  const activitiesCollection = collection(db, 'issues', issueId, 'activities');
  const activitiesQuery = query(activitiesCollection, orderBy('timestamp', 'desc'));

  return onSnapshot(activitiesQuery, (snapshot) => {
    const data: IssueActivity[] = snapshot.docs.map((docSnap) => {
      const raw = docSnap.data();
      return {
        id: docSnap.id,
        issueId,
        actor: raw.actor,
        action: raw.action,
        message: raw.message,
        timestamp: (raw.timestamp as Timestamp | undefined)?.toDate().toISOString() ?? raw.timestamp,
      };
    });
    onChange(data);
  });
};

export const uploadDocument = async (issueId: string, file: File) => {
  const storageRef = ref(storage, `issues/${issueId}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
};

export const addDocumentToIssue = async (issueId: string, document: { name: string; url: string }) => {
  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, {
    documents: arrayUnion(document),
    updatedAt: Timestamp.now(),
  });
};
