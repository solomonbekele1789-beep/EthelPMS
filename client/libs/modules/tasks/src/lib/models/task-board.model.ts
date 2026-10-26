export interface TaskBoardDto {
  id: string;
  name: string;
  projectId: string;
  description?: string;
  isDefault: boolean;
  lists: TaskListDto[];
  createdAt: string;
}

export interface TaskListDto {
  id: string;
  taskBoardId: string;
  name: string;
  sortOrder: number;
  color?: string;
  taskCount: number;
  createdAt: string;
}

export interface CreateTaskBoardRequest {
  name: string;
  projectId: string;
  description?: string;
  isDefault?: boolean;
}

export interface CreateTaskListRequest {
  taskBoardId: string;
  name: string;
  sortOrder: number;
  color?: string;
}
