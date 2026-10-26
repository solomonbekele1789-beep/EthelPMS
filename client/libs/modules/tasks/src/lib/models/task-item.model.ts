export type TaskItemStatus = 'ToDo' | 'InProgress' | 'InReview' | 'Approved' | 'Rejected' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ApprovalAction = 'Submitted' | 'Approved' | 'Rejected' | 'ReturnedForRevision';

export interface TaskItemDto {
  id: string;
  taskListId: string;
  projectId?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  progressPercentage: number;
  assignedToUserId?: string;
  assignedToName?: string;
  parentTaskId?: string;
  sortOrder: number;
  assignments: TaskAssignmentDto[];
  commentsCount: number;
  createdAt: string;
  createdBy?: string;
}

export interface TaskAssignmentDto {
  id: string;
  taskItemId: string;
  assignedToUserId: string;
  assignedToName: string;
  assignedByUserId: string;
  assignedDate: string;
  role?: string;
}

export interface TaskCommentDto {
  id: string;
  taskItemId: string;
  content: string;
  authorUserId: string;
  authorName: string;
  parentCommentId?: string;
  createdAt: string;
  createdBy?: string;
}

export interface TaskApprovalLogDto {
  id: string;
  taskItemId: string;
  approverId: string;
  approverName: string;
  action: string;
  comments?: string;
  approvalLevel: number;
  createdAt: string;
}

export interface CreateTaskRequest {
  taskListId: string;
  title: string;
  projectId?: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assignedToUserId?: string;
  assignedToName?: string;
  parentTaskId?: string;
  sortOrder?: number;
}

export interface UpdateTaskRequest {
  taskId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskStatusRequest {
  taskId: string;
  status: TaskItemStatus;
}

export interface UpdateTaskProgressRequest {
  taskId: string;
  progressPercentage: number;
}

export interface AssignTaskRequest {
  taskId: string;
  assignedToUserId: string;
  assignedToName: string;
  role?: string;
}

export interface MoveTaskRequest {
  taskId: string;
  targetListId: string;
  sortOrder?: number;
}

export interface AddTaskCommentRequest {
  taskItemId: string;
  content: string;
  parentCommentId?: string;
}

export interface SubmitForApprovalRequest {
  taskId: string;
  comments?: string;
}

export interface ApproveTaskRequest {
  taskId: string;
  approvalLevel: number;
  comments?: string;
}

export interface RejectTaskRequest {
  taskId: string;
  approvalLevel: number;
  comments?: string;
}
