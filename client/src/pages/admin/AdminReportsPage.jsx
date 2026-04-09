// src/pages/admin/AdminReportsPage.jsx
import React from "react";
import AdminLayout from "../../layouts/Layout";

/* --- Mock data --- */
const stats = [
  {
    id: "s1",
    title: "Revenue",
    value: "₦100,000",
    note: "+5%",
    noteClass: "text-green-600",
  },
  {
    id: "s2",
    title: "Engagement Overview",
    value: "+15%",
    note: "Last 30 days +10%",
    noteClass: "text-green-600",
  },
  {
    id: "s3",
    title: "Pending Tutor Application",
    value: "15",
    note: "-20%",
    noteClass: "text-red-500",
  },
];

const subscriptions = [
  {
    id: 1,
    name: "Chidinma Okeke",
    date: "2025-09-15",
    completed: 10,
    status: "Active",
  },
  {
    id: 2,
    name: "Fatima Abubakar",
    date: "2025-09-15",
    completed: 20,
    status: "Active",
  },
  {
    id: 3,
    name: "Tunde Oladipo",
    date: "2025-09-15",
    completed: 30,
    status: "Inactive",
  },
];

/* --- Reusable components --- */
function StatCard({ title, value, note, noteClass }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-3 text-2xl font-semibold text-gray-900">{value}</div>
      <div className={`mt-2 text-sm ${noteClass || "text-green-600"}`}>
        {note}
      </div>
    </div>
  );
}

/* SmallArea renders an area chart with unique gradient id so fill is light-blue */
function SmallArea({ id, pathD }) {
  const gradId = `areaGrad-${id}`;
  return (
    <svg
      viewBox="0 0 100 60"
      className="w-full h-28"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#dbeefe" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#dbeefe" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      {/* fill = gradient; stroke = dark-blue */}
      <path
        d={pathD}
        fill={`url(#${gradId})`}
        stroke="#2b73ee"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Table header helper */
function TableHeader({ cols }) {
  return (
    <thead>
      <tr className="bg-blue-50">
        {cols.map((c) => (
          <th key={c} className="px-6 py-4 text-left text-sm text-gray-700">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/* View button used in table actions */
function ViewButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full border bg-white text-blue-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
      aria-label="View"
    >
      View
    </button>
  );
}

/* --- Page --- */
export default function AdminReportsPage() {
  return (
    <h1 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">
      Coming Soon...
    </h1>
  );

  // return (
  //   <div className="max-w-6xl space-y-8">
  //     {/* top search area (keeps layout same as screenshot) */}
  //     <div className="flex items-center gap-4">
  //       <div className="flex-1">
  //         <input
  //           className="w-full px-4 py-3 border rounded-lg bg-white placeholder-gray-400 text-sm"
  //           placeholder="Search"
  //           aria-label="Search"
  //         />
  //       </div>
  //     </div>

  //     {/* stats */}
  //     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
  //       {stats.map((s) => (
  //         <StatCard
  //           key={s.id}
  //           title={s.title}
  //           value={s.value}
  //           note={s.note}
  //           noteClass={s.noteClass}
  //         />
  //       ))}
  //     </div>

  //     {/* Engagement overview */}
  //     <section className="bg-white rounded-xl p-6 shadow-sm border">
  //       <div className="flex items-start justify-between mb-6">
  //         <div>
  //           <h3 className="text-lg font-semibold">Quick Engagement Overview</h3>
  //           <div className="mt-2 text-3xl font-bold text-gray-900">+15%</div>
  //           <div className="text-sm text-green-600 mt-1">Last 30 Days +15%</div>
  //         </div>

  //         <button
  //           className="p-2 rounded-full hover:bg-gray-50"
  //           aria-label="Open details"
  //         >
  //           <svg
  //             className="w-5 h-5 text-gray-400"
  //             viewBox="0 0 24 24"
  //             fill="none"
  //             stroke="currentColor"
  //           >
  //             <path
  //               strokeWidth="2"
  //               strokeLinecap="round"
  //               strokeLinejoin="round"
  //               d="M9 5l7 7-7 7"
  //             />
  //           </svg>
  //         </button>
  //       </div>

  //       {/* four mini-area charts */}
  //       <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
  //         <div className="p-4">
  //           <SmallArea
  //             id={1}
  //             pathD="M0,50 C20,10 40,10 60,40 C80,60 100,50 100,50 L100,60 L0,60 Z"
  //           />
  //           <div className="text-center text-sm text-gray-500 mt-2">Week 1</div>
  //         </div>

  //         <div className="p-4">
  //           <SmallArea
  //             id={2}
  //             pathD="M0,60 C20,30 40,40 60,12 C80,4 100,60 100,60 L100,60 L0,60 Z"
  //           />
  //           <div className="text-center text-sm text-gray-500 mt-2">Week 2</div>
  //         </div>

  //         <div className="p-4">
  //           <SmallArea
  //             id={3}
  //             pathD="M0,50 C18,38 36,20 54,30 C72,40 90,35 100,50 L100,60 L0,60 Z"
  //           />
  //           <div className="text-center text-sm text-gray-500 mt-2">Week 3</div>
  //         </div>

  //         <div className="p-4">
  //           <SmallArea
  //             id={4}
  //             pathD="M0,60 C15,35 35,5 55,10 C75,20 95,55 100,45 L100,60 L0,60 Z"
  //           />
  //           <div className="text-center text-sm text-gray-500 mt-2">Week 4</div>
  //         </div>
  //       </div>
  //     </section>

  //     {/* Subscriptions table */}
  //     <section className="bg-white rounded-xl p-6 shadow-sm border">
  //       <div className="flex items-center justify-between mb-4">
  //         <h3 className="font-semibold text-lg">Subscriptions</h3>
  //         <a className="text-sm text-blue-600" href="#view-all">
  //           View All
  //         </a>
  //       </div>

  //       <div className="overflow-x-auto">
  //         <table className="w-full">
  //           <TableHeader
  //             cols={[
  //               "Name",
  //               "Registration Date",
  //               "Completed sections",
  //               "Status",
  //               "Action",
  //             ]}
  //           />

  //           <tbody>
  //             {subscriptions.map((s, idx) => (
  //               <tr
  //                 key={s.id}
  //                 className={`${
  //                   idx < subscriptions.length - 1 ? "border-b" : ""
  //                 }`}
  //               >
  //                 <td className="px-6 py-4 text-sm text-gray-700">{s.name}</td>
  //                 <td className="px-6 py-4 text-sm text-gray-600">{s.date}</td>
  //                 <td className="px-6 py-4 text-sm text-gray-600">
  //                   {s.completed}
  //                 </td>
  //                 <td className="px-6 py-4">
  //                   <span
  //                     className={`inline-block px-3 py-1 text-xs rounded-full ${
  //                       s.status === "Active"
  //                         ? "bg-green-100 text-green-700"
  //                         : "bg-red-100 text-red-600"
  //                     }`}
  //                   >
  //                     {s.status}
  //                   </span>
  //                 </td>
  //                 <td className="px-6 py-4 text-right">
  //                   <ViewButton
  //                     onClick={() => alert(`Open subscription ${s.id}`)}
  //                   />
  //                 </td>
  //               </tr>
  //             ))}
  //           </tbody>
  //         </table>
  //       </div>
  //     </section>
  //   </div>
  // );
}
