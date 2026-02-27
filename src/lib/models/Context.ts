export interface ContextFilter {
  id: string;
  label: string;
  type: "status" | "tag" | "source" | "custom";
  value: string;
}

export const defaultContextFilters: ContextFilter[] = [
  {
    id: "filter-1",
    label: "Open",
    type: "status",
    value: "open"
  },
  {
    id: "filter-2",
    label: "In progress",
    type: "status",
    value: "in_progress"
  },
  {
    id: "filter-3",
    label: "Done",
    type: "status",
    value: "done"
  },
  {
    id: "filter-4",
    label: "Tag: planning",
    type: "tag",
    value: "planning"
  },
  {
    id: "filter-5",
    label: "Source: workspace",
    type: "source",
    value: "workspace"
  }
];