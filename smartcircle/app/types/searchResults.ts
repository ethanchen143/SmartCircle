export interface SearchCandidate {
  connection_id: string;
  reasoning: string;
  outreachMessage: string;
}

export interface SearchResults {
  task: string;
  candidates: SearchCandidate[];
  timestamp: Date;
}
