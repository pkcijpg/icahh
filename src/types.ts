export interface ActionStep {
  stepNumber: number;
  title: string;
  detail: string;
  completed?: boolean;
}

export interface Concept {
  title: string;
  description: string;
  fitPercentage: number;
  estimatedDuration: string;
  actionSteps: ActionStep[];
  id?: string;
  status?: "belum_mulai" | "sedang_berjalan" | "selesai";
}

export interface AntiBuntuMethod {
  name: string;
  description: string;
}

export interface AntiBuntuCategory {
  title: string;
  subtitle: string;
  methods: AntiBuntuMethod[];
}

export interface AntiBuntuResponse {
  cognitive: AntiBuntuCategory;
  somatic: AntiBuntuCategory;
  technical: AntiBuntuCategory;
}
