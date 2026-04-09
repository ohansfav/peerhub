// import { useQuery } from "@tanstack/react-query";
// import { useMemo } from "react";
// import { getPendingTutorApplications } from "../api/applications";
// import { getReportedIssues } from "../api/issues";

// export function useAdminNotifications() {
//   const applications = useQuery({
//     queryKey: ["pendingTutorApplications"],
//     queryFn: getPendingTutorApplications,
//     staleTime: 60000,
//   });

//   const issues = useQuery({
//     queryKey: ["reportedIssues"],
//     queryFn: getReportedIssues,
//     staleTime: 60000,
//   });

//   const notifications = useMemo(() => {
//     const result = [];

//     // Pending tutor applications
//     if (applications.data) {
//       applications.data.forEach((app) => {
//         result.push({
//           id: `application-${app.id}`,
//           type: "application",
//           sender: app.user?.firstName || "User",
//           message: "submitted a tutor application",
//           timestamp: app.createdAt,
//           priority: "medium",
//           action: { label: "Review", link: `/admin/applications/${app.id}` },
//         });
//       });
//     }

//     // Open reported issues
//     if (issues.data) {
//       issues.data
//         .filter((issue) => issue.status === "open")
//         .forEach((issue) => {
//           result.push({
//             id: `issue-${issue.id}`,
//             type: "alert",
//             sender: issue.reportedBy?.firstName || "User",
//             message: `reported: ${issue.subject}`,
//             timestamp: issue.createdAt,
//             priority: "high",
//             action: { label: "View", link: `/admin/issues/${issue.id}` },
//           });
//         });
//     }

//     return result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
//   }, [applications.data, issues.data]);

//   return {
//     notifications,
//     isLoading: applications.isLoading || issues.isLoading,
//   };
// }
