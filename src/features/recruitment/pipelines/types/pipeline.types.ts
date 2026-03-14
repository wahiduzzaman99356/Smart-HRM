export type PipelineStatus = 'Draft' | 'Active' | 'Archived';

export interface PipelineStage {
  id:    string;
  name:  string;
  order: number;
}

export interface Pipeline {
  id:               string;
  name:             string;
  position:         string;   // target job title / role
  stages:           PipelineStage[];
  candidates:       number;
  createdAt:        string;
  status:           PipelineStatus;
  // optional link back to the MRF / job posting that spawned this pipeline
  jobPostingId?:    string;
  jobPostingTitle?: string;
}
