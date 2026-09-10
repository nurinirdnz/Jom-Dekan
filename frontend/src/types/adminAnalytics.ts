export interface AnalyticsCount {
  label: string;
  value: number;
}

export interface AnalyticsTrendPoint {
  month: string;
  users: number;
  resources: number;
  forumPosts: number;
  applications: number;
}

export interface AdminAnalytics {
  totals: {
    users: number;
    activeUsers: number;
    resources: number;
    forumPosts: number;
    forumComments: number;
    opportunities: number;
    applications: number;
    pendingModeration: number;
  };
  userRoles: AnalyticsCount[];
  resourceStatuses: AnalyticsCount[];
  opportunityStatuses: AnalyticsCount[];
  applicationStatuses: AnalyticsCount[];
  monthlyTrend: AnalyticsTrendPoint[];
}
